define([
  'intern!object',
  'intern/chai!expect',
  '../helper/test-frame',
  'ally/util/get-content-document',
], function(registerSuite, expect, TestFrame, getContentDocument) {

  registerSuite(function() {
    var frame;

    return {
      name: 'util/get-content-document',

      before: function() {
        frame = new TestFrame([
          /*eslint-disable indent */
          '<!DOCTYPE html>',
          '<html lang="en">',
            '<head>',
              '<meta charset="utf-8" />',
              '<title>Framed Content</title>',
            '</head>',
            '<body>',
              '<p>Hello World</p>',
            '</body>',
          '</html>',
          /*eslint-enable indent */
        ].join(''));

        return frame.initialize(document.body);
      },
      after: function() {
        frame.terminate();
        frame = null;
      },

      'iframe content document': function() {
        var _document = getContentDocument(frame.element);
        expect(_document).to.equal(frame.document);
      },
    };
  });
});
