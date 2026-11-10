FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Gateway URL the browser calls. Baked into the bundle at build time.
ARG VITE_API_URL
RUN test -n "$VITE_API_URL" || (echo 'Pass --build-arg VITE_API_URL=<gateway url>' >&2; exit 1)
RUN npm run build

FROM nginx:1.27-alpine
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
