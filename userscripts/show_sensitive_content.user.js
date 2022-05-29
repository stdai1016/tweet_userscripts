// ==UserScript==
// @name         Show twitter sensitive content
// @description  Show sensitive content
// @version      0.1.0b
// @license      MIT
// @namespace    https://github.com/stdai1016
// @match        *://twitter.com/*
// @match        *://mobile.twitter.com/*
// @require      https://github.com/stdai1016/tweet_userscripts/raw/main/utils/twitter_util.user.js
// @grant        none
// ==/UserScript==

/* jshint esversion: 6 */
/* global twitter_util */

(function () {
  'use strict';

  const SELECTORS = {
    BLUR_CONTENT: '.r-yfv4eo',
    SHOW_SENSITIVE_CONTENT_BUTTON: '[role="button"]:not([data-testid]):not([aria-expanded]):not([aria-describedby])',
    PRESENTATION_BUTTON: '[role="presentation"] [role="button"]'
  };

  /**
   * @param {HTMLElement} tweet
   */
  function showSensitiveContent (tweet) {
    tweet.querySelector(SELECTORS.PRESENTATION_BUTTON)?.click();

    if (tweet.querySelector(SELECTORS.BLUR_CONTENT)) {
      tweet.querySelector(SELECTORS.SHOW_SENSITIVE_CONTENT_BUTTON).click();
    }
  }

  twitter_util.addTweetListener(showSensitiveContent);
})();
