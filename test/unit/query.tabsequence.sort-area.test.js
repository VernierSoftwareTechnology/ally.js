define([
  'intern!object',
  'intern/chai!expect',
  '../helper/fixtures/focusable.fixture',
  '../helper/supports',
  'ally/util/platform',
  'ally/query/tabbable',
  'ally/query/tabsequence.sort-area',
], function(registerSuite, expect, focusableFixture, supports, platform, queryTabbable, sortArea) {

  registerSuite(function() {
    var fixture;

    var mutateFixtureForImageMaps = function() {
      // create known end-point
      var last = fixture.add('<input type="text" id="end-of-line">').firstElementChild;
      // move image map before #end-of-line to separate <img> from <map>
      var img = document.getElementById('img-usemap');
      last.parentNode.insertBefore(img, last);
      // add second area to test order within map
      var area = document.getElementById('image-map-area');
      var newArea = area.cloneNode(true);
      newArea.id = 'image-map-area-2';
      area.parentNode.appendChild(newArea);
    };

    return {
      name: 'query/tabsequence.sort-area',

      beforeEach: function() {
        fixture = focusableFixture();
        // remove elements from tabbing test, because their behavior is undefined
        [].forEach.call(document.querySelectorAll('object, embed, audio, video, svg'), function(element) {
          element.parentNode.removeChild(element);
        });
        mutateFixtureForImageMaps();
      },
      afterEach: function() {
        fixture.remove();
        fixture = null;
      },

      'image is the first element': function() {
        var deferred = this.async(10000);

        // move the img to the first spot
        var img = document.getElementById('img-usemap');
        fixture.root.insertBefore(img, fixture.root.firstChild);

        var expected = [
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
          !platform.is.IOS && '#tabindex-0',
          !platform.is.IOS && '#tabindex-1',
          !platform.is.IOS && '#link',
          '#input',
          '#span-contenteditable',
          !platform.is.IOS && '#img-ismap-link',
          '#end-of-line',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var tabbable = queryTabbable({context: fixture.root});
          var result = sortArea(tabbable, fixture.root).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'image is in the middle': function() {
        var deferred = this.async(10000);

        // move the img to the last spot
        var img = document.getElementById('img-usemap');
        var pivot = document.getElementById('img-ismap-link');
        pivot.parentNode.insertBefore(img, pivot);

        var expected = [
          !platform.is.IOS && '#tabindex-0',
          !platform.is.IOS && '#tabindex-1',
          !platform.is.IOS && '#link',
          '#input',
          '#span-contenteditable',
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
          !platform.is.IOS && '#img-ismap-link',
          '#end-of-line',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var tabbable = queryTabbable({context: fixture.root});
          var result = sortArea(tabbable, fixture.root).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'image is the last element': function() {
        var deferred = this.async(10000);

        // move the img to the last spot
        var img = document.getElementById('img-usemap');
        img.parentNode.appendChild(img);

        var expected = [
          !platform.is.IOS && '#tabindex-0',
          !platform.is.IOS && '#tabindex-1',
          !platform.is.IOS && '#link',
          '#input',
          '#span-contenteditable',
          !platform.is.IOS && '#img-ismap-link',
          '#end-of-line',
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var tabbable = queryTabbable({context: fixture.root});
          var result = sortArea(tabbable, fixture.root).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'map is outside of context': function() {
        var deferred = this.async(10000);

        // move the img to the last spot
        var img = document.getElementById('img-usemap');
        img.parentNode.id = 'img-container';

        var expected = [
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
          '#end-of-line',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var context = document.getElementById('img-container');
          var tabbable = queryTabbable({context: context});
          var result = sortArea(tabbable, context).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'map does not exist': function() {
        var deferred = this.async(10000);

        // move the img to the last spot and kill map reference
        var img = document.getElementById('img-usemap');
        img.parentNode.id = 'img-container';
        img.setAttribute('usemap', '#does-not-exist');

        var expected = ['#end-of-line'];

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var context = document.getElementById('img-container');
          var tabbable = queryTabbable({context: context});
          var result = sortArea(tabbable, context).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'image is only content in context': function() {
        var deferred = this.async(10000);

        // move the img to the last spot
        var img = document.getElementById('img-usemap');
        img.parentNode.id = 'img-container';
        var eol = document.getElementById('end-of-line');
        eol.parentNode.removeChild(eol);

        var expected = [
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var context = document.getElementById('img-container');
          var tabbable = queryTabbable({context: context});
          var result = sortArea(tabbable, context).map(fixture.nodeToString);

          expect(tabbable.length).to.equal(0);
          expect(result).to.deep.equal(expected);
        }), 200);
      },
      'multiple images, one map': function() {
        var deferred = this.async(10000);

        // move the img to the last spot
        var img = document.getElementById('img-usemap');
        img.parentNode.appendChild(img);

        var img2 = img.cloneNode(true);
        img2.id = 'img-usemap-2';
        fixture.root.insertBefore(img2, fixture.root.firstChild);

        var expected = [
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
          !platform.is.IOS && '#tabindex-0',
          !platform.is.IOS && '#tabindex-1',
          !platform.is.IOS && '#link',
          '#input',
          '#span-contenteditable',
          !platform.is.IOS && '#img-ismap-link',
          '#end-of-line',
          !platform.is.IOS && '#image-map-area',
          !platform.is.IOS && '#image-map-area-2',
        ].filter(Boolean);

        // NOTE: Firefox decodes DataURIs asynchronously
        setTimeout(deferred.callback(function() {
          var tabbable = queryTabbable({context: fixture.root});
          var result = sortArea(tabbable, fixture.root).map(fixture.nodeToString);

          expect(result).to.deep.equal(expected);
        }), 200);
      },
    };
  });
});
