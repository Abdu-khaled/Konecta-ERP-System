# Stage 1: Build Angular app
FROM node:18-alpine AS build
WORKDIR /app

ARG CHATBOT_URL
ENV CHATBOT_URL=$CHATBOT_URL

COPY package*.json ./
RUN npm ci
COPY . .

RUN node ./scripts/inject-env.mjs

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Upgrade vulnerable system libraries
RUN apk update && apk upgrade --no-cache

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/erp-ui/browser /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
# Normalize line endings in case source was checked out on Windows
RUN sed -i 's/\r$//' /docker-entrypoint.sh
ENV CHATBOT_URL=""
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
