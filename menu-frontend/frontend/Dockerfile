# ---------- Builder Stage ----------
FROM node:18-slim AS builder

WORKDIR /app

COPY package.json ./
COPY package-lock.json* ./

RUN npm install --frozen-lockfile --silent

# Copy full source code
COPY . .

# ✅ Inject the backend URL during build
ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

RUN npm run build


# ---------- Production Stage ----------
FROM node:18-slim

WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
