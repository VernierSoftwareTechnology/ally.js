define([
  './intern.base-config.js',
], function(config) {

  config.capabilities = {
    project: 'ally.js',
    // 'browserstack.debug': true,
    // 'browserstack.video': true,
    // 'browserstack.ie.noFlash': true,
  };

  // https://theintern.github.io/intern/#option-environments
  // see https://www.browserstack.com/automate/capabilities
  /*eslint-disable camelcase */
  config.environments = [
    // { browser: 'Edge', browser_version: '12.0', os: 'WINDOWS', os_version: '10', platform: 'WIN', browserName: 'Edge12' },
    { browser: 'IE', browser_version: '11', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'IE11' },
    { browser: 'IE', browser_version: '10', os: 'WINDOWS', os_version: '8', platform: 'WIN', browserName: 'IE10' },

    { browser: 'Firefox', browser_version: '41', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'Firefox 41' },
    { browser: 'Chrome', browser_version: '46', os: 'WINDOWS', os_version: '8.1', platform: 'WIN', browserName: 'Chrome 46' },

    { browser: 'Firefox', browser_version: '41', os: 'OS X', os_version: 'Yosemite', platform: 'MAC', browserName: 'Firefox 41' },
    { browser: 'Chrome', browser_version: '46', os: 'OS X', os_version: 'Yosemite', platform: 'MAC', browserName: 'Chrome 46' },

    // disabled because of https://github.com/theintern/intern/issues/481
    // { browser: 'Safari', browser_version: '8', os: 'OS X', os_version: 'Yosemite', platform: 'MAC', browserName: 'Safari 8' },
    // { browser: 'Safari', browser_version: '7.1', os: 'OS X', os_version: 'Mavericks', platform: 'MAC', browserName: 'Safari 7' },
    // { browser: 'Safari', browser_version: '6.2', os: 'OS X', os_version: 'Mountain Lion', platform: 'MAC', browserName: 'Safari 6' },
  ];
  /*eslint-enable camelcase */

  // https://theintern.github.io/intern/#option-maxConcurrency
  // OpenSauce allows 5 concurrent VMs
  //config.maxConcurrency = 5;
  config.maxConcurrency = 2;
  // https://theintern.github.io/intern/#option-tunnel
  config.tunnel = 'BrowserStackTunnel';

  return config;
});