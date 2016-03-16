define([
  'intern!object',
  'intern/chai!expect',
  'require',
  // https://theintern.github.io/leadfoot/keys.html
  'intern/dojo/node!leadfoot/keys',
  // https://theintern.github.io/leadfoot/pollUntil.html
  'intern/dojo/node!leadfoot/helpers/pollUntil',
], function(registerSuite, expect, require, keys, pollUntil) {

  registerSuite(function() {
    var timeout = 120000;
    var advancesFocusOnTab = false;
    var advancesFocusToLinks = false;

    // Since we cannot .focus() SVG content in Firefox and Internet Explorer,
    // we need to run this unit test as a functional test, so we can emit
    // proper TAB key to make the browser shift focus to the SVG element

    return {
      name: 'style/focus-within',

      before: function() {
        return this.remote
          .get(require.toUrl('test/pages/intern.events.test.html'))
          .findById('first')
            .click()
            .end()
          .pressKeys(keys.TAB)
          .sleep(500)
          .execute('return document.activeElement.id || document.activeElement.nodeName')
          .then(function(activeElementId) {
            advancesFocusOnTab = activeElementId === 'second';
          })

          .findById('second')
            .click()
            .end()
          .pressKeys(keys.TAB)
          .sleep(500)
          .execute('return document.activeElement.id || document.activeElement.nodeName')
          .then(function(activeElementId) {
            advancesFocusToLinks = activeElementId === 'third';
          })

          .get(require.toUrl('test/pages/style.focus-within.test.html'))
          .setPageLoadTimeout(timeout)
          .setFindTimeout(timeout)
          .setExecuteAsyncTimeout(timeout)
          // wait until we're really initialized
          .then(pollUntil('return window.platform'));
      },

      'follow focus into SVG': function() {
        this.timeout = timeout;
        if (!advancesFocusOnTab) {
          this.skip('Cannot test Tab focus via WebDriver in this browser');
        }

        if (!advancesFocusToLinks) {
          this.skip('Cannot test Tab to link focus via WebDriver in this browser');
        }

        return this.remote
          .findById('before')
            .click()
            .end()
          .sleep(500)
          .execute('return document.activeElement.id || document.activeElement.nodeName')
          .then(function(activeElementId) {
            expect(activeElementId).to.equal('before', 'initial position');
          })
          .execute('return [].map.call(document.querySelectorAll(".ally-focus-within"), function(e) { return e.id || e.nodeName })')
          .then(function(elements) {
            var expected = ['HTML', 'BODY', 'before'];
            expect(elements).to.deep.equal(expected, '.ally-focus-within after first Tab');
          })

          .pressKeys(keys.TAB)
          .sleep(500)
          .execute('return document.activeElement.id || document.activeElement.nodeName')
          .then(function(activeElementId) {
            expect(activeElementId).to.equal('svg-link', 'activeElement after first Tab');
          })
          .execute('return [].map.call(document.querySelectorAll(".ally-focus-within"), function(e) { return e.id || e.nodeName })')
          .then(function(elements) {
            var expected = ['HTML', 'BODY', 'container', 'svg', 'svg-link'];
            expect(elements).to.deep.equal(expected, '.ally-focus-within after first Tab');
          })

          .pressKeys(keys.TAB)
          .sleep(500)
          .execute('return document.activeElement.id || document.activeElement.nodeName')
          .then(function(activeElementId) {
            expect(activeElementId).to.equal('after', 'after second Tab');
          })
          .execute('return [].map.call(document.querySelectorAll(".ally-focus-within"), function(e) { return e.id || e.nodeName })')
          .then(function(elements) {
            var expected = ['HTML', 'BODY', 'container', 'after'];
            expect(elements).to.deep.equal(expected, '.ally-focus-within after second Tab');
          });
      },
    };
  });
});
