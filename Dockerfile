FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN echo 'const nextConfig = { output: "standalone" }; export default nextConfig;' > next.config.mjs

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "start"]
