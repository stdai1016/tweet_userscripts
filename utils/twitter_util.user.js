// ==UserScript==
// @name         twitter_util
// @description  An utility for Twitter
// @version      0.0.1
// @license      MIT
// @namespace    https://github.com/stdai1016
// @include      https://twitter.com/*
// ==/UserScript==

/* jshint esversion: 6 */

const twitter_util = (function (window) { // eslint-disable-line
  'use strict';

  function makeUtility () {
    const __tweetListeners = [];
    const utils = {
      URL_PATTERNS: Object.freeze({
        TWITTER: /^(?:|https?:\/\/)(?:|mobile\.)twitter\.com(?:|(\/.+))$/,
        TWEET: /^(?:|https?:\/\/)(?:|mobile\.)twitter\.com\/(\w+|i\/web)\/status\/(\d+)/,
        PHOTO: /^(?:|https?:\/\/)(?:|mobile\.)twitter\.com\/(\w+|i\/web)\/status\/(\d+)\/photo\/(\d)$/,
        TWIMG: /^(?:|https?:\/\/)pbs\.twimg\.com\/media\/\?format=(\w+)&name=\w+$/
      }),

      SELECTORS: Object.freeze({
        TWEET: '[data-testid="tweet"]',
        BUTTON: '[role="group"] [role="button"]:not([data-testid])',
        DIALOG: 'div.r-17gur6a[role="dialog"]',
        MENUITEM: 'div[role="menuitem"]'
      }),

      /**
       * @returns {string[]} List of tweet listener name
       */
      get tweetListeners () { return __tweetListeners.map(i => i.name); },

      /**
       *
       * @param {HTMLElement} tweet
       */
      handleTweet: function (tweet) {
        __tweetListeners.forEach(listener => {
          setTimeout(function () {
            logger(`${listener.name} run`);
            listener.handle(tweet);
          }, 0);
        });
      },

      /**
       * Add Tweet listener
       * @param {*} listener callable object
       * @param {*} options options
       */
      addTweetListener: function (listener, options = {}) {
        if (!isValidableLlistener(listener)) {
          throw new TypeError('listener is not validable!');
        }

        const name = options.name ?? getFunctionName(listener);
        if (this.hasTweetListener(name)) {
          throw new Error(`Listener ${name} already exists!`);
        }

        __tweetListeners.push({
          name,
          handle: listener
        });
      },

      /**
       * Check listener exists
       * @param {*} listener callable object or name of listener
       * @returns {boolean}
       */
      hasTweetListener: function (listener) {
        return this.tweetListeners.includes(getFunctionName(listener));
      },

      /**
       * Remove a listener previously registered with `addTweetListener`
       * @param {*} listener callable object or name of listener to remove
       */
      removeTweetListener: function (listener) {
        const idx = this.tweetListeners.indexOf(getFunctionName(listener));
        if (idx !== -1) __tweetListeners.splice(idx, 1);
      },

      /**
       *
       * @param {string} url URL
       */
      isTweetUrl: function (url) {
        return url.match(this.URL_PATTERNS.TWEET);
      }
    };

    for (const prop in utils) {
      if (prop.startsWith('_')) {
        Object.defineProperty(utils, prop, { writable: false, configurable: false, enumerable: false });
      } else if (Object.getOwnPropertyDescriptor(utils, prop).value) {
        Object.defineProperty(utils, prop, { writable: false, configurable: false });
      }
    }

    if (window.location.origin.match(utils.URL_PATTERNS.TWITTER)) {
      getElementAsync('main', document.body, 10000).then(main => {
        if (utils.isTweetUrl(window.location.href)) {
          main.querySelectorAll(utils.SELECTORS.TWEET).forEach(tweet => utils.handleTweet(tweet));
        }
        const observer = new MutationObserver(r => r.forEach(mu => mu.addedNodes.forEach(node => {
          node.querySelectorAll(utils.SELECTORS.TWEET).forEach(tweet => {
            if (tweet.classList.contains('twitter-util-handled')) return;
            tweet.classList.add('twitter-util-handled');
            utils.handleTweet(tweet);
          });
        })));
        observer.observe(main, { childList: true, subtree: true });
        Object.defineProperty(utils, '_observer',
          { value: observer, writable: false, configurable: false, enumerable: false });
      }).catch(reason => {
        console.error(reason);
      });
    }

    return utils;
  }

  function isValidableLlistener (listener) {
    if (!listener) { return false; }
    if (typeof listener !== 'function' && typeof listener !== 'object') { return false; }

    return true;
  }

  function getFunctionName (func) {
    if (!func) return '';
    if (typeof func === 'string') return func;
    if (typeof func === 'function') { return func.name ? func.name : randomStr(16); }

    return null;
  }

  function randomStr (length) {
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; ++i) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  function logger (message) {
    const debug = window.localStorage.getItem('twitter_util.debug');
    if (!['', '0', 'false', 'null', 'undefined'].includes(String(debug).toLowerCase())) {
      console.debug(message);
    }
  }

  /**
   * Get element async
   * @param {string} selectors A string containing CSS selectors to match
   * @param {Element} target The base element
   * @param {int} timeout timeout for match
   * @returns {Promise<Element>} The first descendant element of baseElement which matches the selectors.
   */
  function getElementAsync (selectors, target, timeout = 100) {
    return new Promise((resolve, reject) => {
      const i = setTimeout(function () {
        stop();
        const el = target.querySelector(selectors);
        if (el) resolve(el);
        else reject(Error(`get "${selectors}" timeout`));
      }, timeout);
      const mo = new MutationObserver(r => r.forEach(mu => {
        const el = mu.target.querySelector(selectors);
        if (el) { stop(); resolve(el); }
      }));
      mo.observe(target, { childList: true, subtree: true });
      function stop () { clearTimeout(i); mo.disconnect(); }
    });
  }

  return (window.twitter_util = window.twitter_util ?? makeUtility(window));
})(window);
