define([
  'intern!object',
  'intern/chai!expect',
  'sinon',
  '../helper/fixtures/custom.fixture',
  '../helper/supports',
  'ally/util/logger',
  'ally/element/disabled',
  'ally/supports/media/mp4',
], function(registerSuite, expect, sinon, customFixture, supports, logger, elementDisabled, mp4) {

  registerSuite(function() {
    var fixture;

    return {
      name: 'element/disabled',

      beforeEach: function() {
        sinon.spy(logger, 'warn');
        fixture = customFixture([
          /*eslint-disable indent */
          '<div tabindex="0" id="non-input"></div>',
          '<input type="text" id="input">',
          '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="svg">',
            '<a xlink:href="#void" id="svg-link">',
              '<text x="10" y="20" id="svg-link-text">text</text>',
            '</a>',
            '<text x="10" y="20" id="svg-text" focusable="true">text</text>',
          '</svg>',
          /*eslint-enable indent */
        ]);
      },
      afterEach: function() {
        logger.warn.restore();
        fixture.remove();
        fixture = null;
      },

      invalid: function() {
        expect(function() {
          elementDisabled(null);
        }).to.throw(TypeError, 'element/disabled requires valid options.context');
      },
      'non-input': function() {
        var element = document.getElementById('non-input');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.hasAttribute('data-ally-disabled')).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('data-ally-disabled')).to.equal(false, 'after disable undo');
      },
      input: function() {
        var element = document.getElementById('input');
        expect(element.disabled).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.disabled).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(element.disabled).to.equal(false, 'after disable undo');
      },
      'non-input - getter': function() {
        var element = document.getElementById('non-input');
        expect(elementDisabled(element)).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(elementDisabled(element)).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(elementDisabled(element)).to.equal(false, 'after disable undo');
      },
      'input - getter': function() {
        var element = document.getElementById('input');
        expect(elementDisabled(element)).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(elementDisabled(element)).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(elementDisabled(element)).to.equal(false, 'after disable undo');
      },
      'disable does not add data-ally-disabled to input': function() {
        var element = document.getElementById('input');
        expect(element.hasAttribute('tabindex')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(elementDisabled(element)).to.equal(true, 'after disable');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(false, 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('tabindex')).to.equal(false, 'after disable undo');
      },
      'double execution': function() {
        var element = document.getElementById('non-input');
        expect(element.getAttribute('tabindex')).to.equal('0', 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('tabindex')).to.equal('-1', 'after disable');

        elementDisabled(element, true);
        expect(element.getAttribute('tabindex')).to.equal('-1', 'after second disable');

        elementDisabled(element, false);
        expect(element.getAttribute('tabindex')).to.equal('0', 'after disable undo');
      },
      'disable restores tabindex="0"': function() {
        var element = document.getElementById('non-input');
        expect(element.getAttribute('tabindex')).to.equal('0', 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('tabindex')).to.equal('-1', 'after disable');

        elementDisabled(element, false);
        expect(element.getAttribute('tabindex')).to.equal('0', 'after disable undo');
      },
      'disable adds aria-disabled="true"': function() {
        var element = document.getElementById('non-input');
        expect(element.hasAttribute('aria-disabled')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('aria-disabled')).to.equal('true', 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('aria-disabled')).to.equal(false, 'after disable undo');
      },
      'disable restores aria-disabled="false"': function() {
        var element = document.getElementById('non-input');
        element.setAttribute('aria-disabled', 'false');
        expect(element.getAttribute('aria-disabled')).to.equal('false', 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('aria-disabled')).to.equal('true', 'after disable');

        elementDisabled(element, false);
        expect(element.getAttribute('aria-disabled')).to.equal('false', 'after disable undo');
      },
      'disable prevents element.focus()': function() {
        var element = document.getElementById('non-input');
        expect(element.focus === HTMLElement.prototype.focus).to.equal(true, 'before disable');

        elementDisabled(element, true);
        expect(element.focus === HTMLElement.prototype.focus).to.equal(false, 'after disable');

        element.focus();
        expect(logger.warn.calledOnce).to.equal(true, 'one warning logged');
        expect(logger.warn.calledWith('trying to focus inert element', element))
          .to.equal(true, 'proper warning logged');

        elementDisabled(element, false);
        expect(element.focus === HTMLElement.prototype.focus).to.equal(true, 'after disable undo');
      },
      'disable prevents pointer events': function() {
        var element = document.getElementById('non-input');
        expect(element.style.pointerEvents).to.equal('', 'before disable');

        elementDisabled(element, true);
        expect(element.style.pointerEvents).to.equal('none', 'after disable');

        elementDisabled(element, false);
        expect(element.style.pointerEvents).to.equal('', 'after disable undo');
      },
      'disable removes video controls': function() {
        if (supports.AVOID_MEDIA) {
          this.skip('Browser cannot deal with <video> and <audio>');
        }

        var element = fixture.add('<video controls src="' + mp4 + '"></video>').firstElementChild;
        expect(element.hasAttribute('controls')).to.equal(true, 'before disable');

        elementDisabled(element, true);
        expect(element.hasAttribute('controls')).to.equal(false, 'after disable');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('controls')).to.equal(true, 'after disable undo');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(false, 'after disable undo');
      },
      'disable does not ignore video without controls': function() {
        if (supports.AVOID_MEDIA) {
          this.skip('Browser cannot deal with <video> and <audio>');
        }

        var element = fixture.add('<video src="' + mp4 + '"></video>').firstElementChild;
        expect(element.hasAttribute('controls')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.hasAttribute('controls')).to.equal(false, 'after disable');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(true, 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('controls')).to.equal(false, 'after disable undo');
        expect(element.hasAttribute('data-ally-disabled')).to.equal(false, 'after disable undo');
      },
      'disable adds focusable="false"': function() {
        var element = document.getElementById('svg-link');
        expect(element.hasAttribute('focusable')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('focusable')).to.equal('false', 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('focusable')).to.equal(false, 'after disable undo');
      },
      'disable restores focusable="true"': function() {
        var element = document.getElementById('svg-text');
        expect(element.getAttribute('focusable')).to.equal('true', 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('focusable')).to.equal('false', 'after disable');

        elementDisabled(element, false);
        expect(element.getAttribute('focusable')).to.equal('true', 'after disable undo');
      },
      'disable adds focusable="false" to <svg>': function() {
        var element = document.getElementById('svg');
        expect(element.hasAttribute('focusable')).to.equal(false, 'before disable');

        elementDisabled(element, true);
        expect(element.getAttribute('focusable')).to.equal('false', 'after disable');

        elementDisabled(element, false);
        expect(element.hasAttribute('focusable')).to.equal(false, 'after disable undo');
      },

    };
  });
});
