FROM node:22-alpine
WORKDIR /app
COPY public ./public
COPY scripts ./scripts
ENV HOST=0.0.0.0 PORT=8080
USER node
EXPOSE 8080
CMD ["node", "scripts/serve.cjs"]
