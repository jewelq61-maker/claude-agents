FROM node:20-alpine

# Install ffmpeg and fonts
RUN apk add --no-cache ffmpeg font-noto font-noto-arabic fontconfig \
    && fc-cache -f

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

ENV NODE_ENV=production
CMD ["node", "index.js"]
