// Copy to public/config.local.js. This file is served to the browser.
window.ROADNET_CONFIG = {
  ...window.ROADNET_CONFIG,
  amapKey: 'YOUR_AMAP_WEB_KEY',
  // Use a server-side proxy for production, or securityJsCode for local development.
  serviceHost: '',
  securityJsCode: ''
};
