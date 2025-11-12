(function(){
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  try {
    var env = (globalThis.__ENV__ || globalThis.ENV || {});
    var proc = (globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    var fromEnv = env.CHATBOT_URL || proc.CHATBOT_URL || '';
    if (fromEnv) {
      window.__APP_CONFIG__.chatbotUrl = fromEnv;
    }
    var gw = env.API_GATEWAY_BASE || proc.API_GATEWAY_BASE || '';
    if (gw) {
      window.__APP_CONFIG__.authBase = gw + '/api/auth';
      window.__APP_CONFIG__.hrBase = gw + '/api/hr';
      window.__APP_CONFIG__.financeBase = gw + '/api/finance';
      window.__APP_CONFIG__.reportingBase = gw + '/api/reporting';
      window.__APP_CONFIG__.inventoryBase = gw + '/api/inventory';
    }
  } catch(e) { /* ignore */ }
})();
