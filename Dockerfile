# Stap 1: statische portfolio-HTML (SEO, mobiel, eenvoudige weergave) opnieuw genereren uit config.js,
# zodat index.html nooit afwijkt van de content. Geen npm-dependencies nodig.
FROM node:22-alpine AS static
WORKDIR /app
COPY package.json ./
COPY scripts ./scripts
COPY src ./src
RUN node scripts/generate-static.mjs

# Stap 2: serveren
FROM nginx:alpine
COPY --from=static /app/src /usr/share/nginx/html
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
