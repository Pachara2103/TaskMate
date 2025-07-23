FROM node:20 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy the source code
COPY . .

RUN npm run build -- --configuration production

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
