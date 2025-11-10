(function(){
  // Runtime API base overrides. Example:
  // window.__APP_CONFIG__ = { authBase: 'https://api.mycorp.com/auth', hrBase: '/api/hr', financeBase: '/api/finance', reportingBase: '/api/reporting' };
  window.__APP_CONFIG__ = window.__APP_CONFIG__ || {};
  try {
    var env = (globalThis.__ENV__ || globalThis.ENV || {});
    var proc = (globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    var fromEnv = env.CHATBOT_URL || proc.CHATBOT_URL || '';
    if (fromEnv) {
      window.__APP_CONFIG__.chatbotUrl = fromEnv;
    }
  } catch(e) { /* ignore */ }
})();
