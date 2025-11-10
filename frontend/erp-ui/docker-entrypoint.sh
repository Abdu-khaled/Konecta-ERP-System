#!/bin/sh
set -e

# Generate env.js at runtime from container environment
JS_PATH="/usr/share/nginx/html/assets/env.js"
mkdir -p "$(dirname "$JS_PATH")"
cat > "$JS_PATH" <<'EOF'
// Generated at container start
(function(){
  window.__ENV__ = window.__ENV__ || {};
  // Use same-origin proxy path to avoid browser CORS
  window.__ENV__.CHATBOT_URL = "/ai-chat";
})();
EOF

# Configure nginx to proxy /ai-chat to the external webhook
mkdir -p /etc/nginx/snippets
CHATBOT_CONF=/etc/nginx/snippets/chatbot.conf
if [ -n "$CHATBOT_URL" ]; then
  SNI_HOST=$(echo "$CHATBOT_URL" | sed -E 's#^https?://([^/]+)/?.*#\1#')
  cat > "$CHATBOT_CONF" <<EOF2
location /ai-chat {
  proxy_pass $CHATBOT_URL;
  proxy_set_header Host $SNI_HOST;
  proxy_ssl_server_name on;
  proxy_ssl_name $SNI_HOST;
  proxy_set_header X-Real-IP \$remote_addr;
  proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto \$scheme;
}
EOF2
else
  # No URL provided; return 503 to make it obvious
  cat > "$CHATBOT_CONF" <<'EOF2'
location /ai-chat {
  return 503;
}
EOF2
fi

exec nginx -g 'daemon off;'
