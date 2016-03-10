define([
  'intern!object',
  'intern/chai!expect',
  'intern/dojo/Promise',
  '../helper/test-iframe-browser-data',
  '../helper/browser-focusable-data',
  'platform',
  'ally/is/focus-relevant',
  'ally/is/focusable',
  'ally/is/tabbable',
  'ally/is/only-tabbable',
  'ally/get/focus-redirect-target',
  'ally/query/tabsequence',
], function(
  registerSuite,
  expect,
  Promise,
  FocusableTestFrame,
  focusableTestData,
  platform,
  isFocusRelevant,
  isFocusable,
  isTabbable,
  isOnlyTabbable,
  getFocusRedirectTarget,
  queryTabsequence
) {
  registerSuite(function() {

    function keysMap(list) {
      var map = {};
      list.forEach(function(key) {
        map[key] = true;
      });
      return map;
    }

    var framed = new FocusableTestFrame();

    var data = focusableTestData(platform);
    var suite = {
      name: 'core: Browser Compatibility',

      before: function() {
        return framed.initialize(document.body);
      },
      after: function() {
        framed.terminate();
      },
      'browser version': function() {
        if (data) {
          var ident = data.platform.name + ' ' + data.platform.version;
          if (data.platform.product) {
            ident = data.platform.product + ' ' + ident;
          }

          this.skip('Checking against ' + ident);
        } else {
          this.skip('No data to compare to');
        }
      },
    };

    if (!data) {
      return suite;
    }

    var ignoreTabsequencePattern = /svg/;
    var ignoreTabsequenceFocusablePattern = null;
    var skipTabsequence = {};
    var ignorePattern = /(^|-> )(ignore|html|body|embed|param)/;
    var skipUntestable = keysMap([
      // known mismatch
      'iframe',
      'iframe[src=svg]',
      'keygen',
      'keygen[tabindex=-1]',
    ]);

    if (data.platform.layout === 'Blink' || data.platform.layout === 'WebKit') {
      skipUntestable['svg rect[onfocus]'] = true;
    }

    if (data.platform.name === 'Firefox') {
      skipUntestable['firefox-bug-1116126'] = true;
      skipUntestable['map.object area'] = true;
      skipUntestable['map.object area[href].upper'] = true;
      skipUntestable['map.object area[href].lower'] = true;
      // "label[tabindex=0]" is in the browser's tabsequence
      // (it's considered to redirect focus - scriptFocus and keyboardFocus behavior do not align!)
      skipTabsequence['label[tabindex=0]'] = true;
      // "img[usemap].duplicate area[href]" is in the browser's tabsequence once, in ally's twice
      skipTabsequence['img[usemap].duplicate area[href]'] = true;
      // "div{flexbox} > span{order:1} > input" and "div{flexbox} > span{order:2} > input" are not reordered in ally
      skipTabsequence['div{flexbox} > span{order:1} > input'] = true;
      skipTabsequence['div{flexbox} > span{order:2} > input'] = true;
      // In Firefox ShadowDOM is behind a flag
      if (!document.body.createShadowRoot) {
        ignoreTabsequencePattern = /svg|shadow-host/;
        ignoreTabsequenceFocusablePattern = /shadow-host/;
      }
    }

    if (data.platform.layout === 'Trident') {
      // IE and Edge do not forward focus upon script-focus, but does on pointer-focus,
      // we'll act as if script-focus worked just like pointer-focus
      data.elements['label:has(input)'].scriptFocus.redirected = 'label:has(input) input';
      data.elements['label[for=label-target-focusable]'].scriptFocus.redirected = 'input[type=text][tabindex=-1]';
      data.elements['label[for=label-target]'].scriptFocus.redirected = 'input[type=text]';

      if (parseInt(data.platform.version, 10) === 10) {
        // these elements were removed from IE10's manual test
        skipUntestable['object[src=swf]'] = true;
        skipUntestable['object[src=swf][height=0]'] = true;
        skipUntestable['object[src=swf][tabindex=0]'] = true;
      }
    }

    if (data.platform.product === 'iPhone' && data.platform.name === 'Safari') {
      [
        '[contenteditable]',
        '[contenteditable]:empty',
        '[hidden]{displayed} input',
        'canvas > input',
        'div{flexbox} > span{order:1} > input',
        'div{flexbox} > span{order:2} > input',
        'fieldset input',
        'fieldset:has(select) select',
        'fieldset:has(textarea) textarea',
        'firefox-bug-1116126',
        'form input',
        'form[disabled] input',
        'form[disabled][tabindex=-1] input',
        'form[disabled][tabindex=0] input',
        'form[tabindex=-1] input',
        'form[tabindex=0] input',
        'input[tabindex=1]',
        'input[tabindex=2]',
        'input[tabindex=hello]',
        'input[type=password]',
        'input[type=text]',
        'label:has(input) input',
        'select',
        'span{user-modify}',
        'textarea',
      ].forEach(function(ident) {
        // cannot detect tabbables in an iframe
        // is.tabbable.test will have to suffice
        data.elements[ident].tabbable = false;
      });

      // cannot detect tabbables in an iframe
      // query.tabsequence.test will have to suffice
      data.tabsequence = [];
    }

    function generateTest(label) {
      return function() {
        // static result state
        var element = data.elements[label] || {};
        var focusable = Boolean(element.focusable);
        var tabbable = focusable && Boolean(element.tabbable);
        var onlyTabbable = !focusable && Boolean(element.tabbable);
        var focusRelevant = Boolean(focusable || onlyTabbable
          || element.scriptFocus && element.scriptFocus.redirected);

        // evaluated state
        var _element = framed.getElement(label);
        if (!_element) {
          this.skip('element not found');
        }

        var _focusRelevant = isFocusRelevant(_element);
        var _focusable = isFocusable(_element);
        var _tabbable = _focusable && isTabbable(_element);
        var _onlyTabbable = isOnlyTabbable(_element);

        // focus-relevant is allowed to produce false-positives
        // as it is only used as a pre-filter
        var okFocusRelevant = _focusRelevant === focusRelevant || _focusRelevant && !focusRelevant;
        expect(okFocusRelevant).to.equal(true, 'is/focus-relevant');
        expect(_focusable).to.equal(focusable, 'is/focusable');
        expect(_tabbable).to.equal(tabbable, 'is/tabbable');
        expect(_onlyTabbable).to.equal(onlyTabbable, 'is/only-tabbable');

        var redirectTarget = element.scriptFocus && element.scriptFocus.redirected || null;
        var _redirectTarget = getFocusRedirectTarget({context: _element});
        var _redirectTargetLabel = _redirectTarget && _redirectTarget.getAttribute('data-label') || null;
        expect(_redirectTargetLabel).to.equal(redirectTarget, 'get/focus-redirect-target');
      };
    }

    if (!data) {
      return suite;
    }

    Object.keys(data.elements).forEach(function(label) {
      if (skipUntestable[label] || label.match(ignorePattern)) {
        // silently skip what we know we can't test
        return;
      }

      suite[label] = generateTest(label);
    });

    suite.tabsequence = function() {
      var ignored = function(label) {
        return !skipUntestable[label]
          && !skipTabsequence[label]
          && !label.match(ignorePattern)
          && !label.match(ignoreTabsequencePattern)
          && label.indexOf(' -> ') === -1;
      };

      var expected = data.tabsequence.filter(ignored);
      var sequence = queryTabsequence({
        context: framed.document.body,
        strategy: 'strict',
      }).map(function(element) {
        return element.getAttribute('data-label');
      }).filter(ignored);

      expect(sequence).to.deep.equal(expected);
    };

    suite['tabsequence with onlyTabbable'] = function() {
      var ignored = function(label) {
        return !skipUntestable[label]
          && !skipTabsequence[label]
          && !label.match(ignorePattern)
          && (!ignoreTabsequenceFocusablePattern || !label.match(ignoreTabsequenceFocusablePattern))
          && label.indexOf(' -> ') === -1;
      };

      var expected = data.tabsequence.filter(ignored);
      var sequence = queryTabsequence({
        context: framed.document.body,
        includeOnlyTabbable: true,
        strategy: 'strict',
      }).map(function(element) {
        return element.getAttribute('data-label');
      }).filter(ignored);

      expect(sequence).to.deep.equal(expected);
    };
    return suite;
  });
});
