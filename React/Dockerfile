FROM node:22-alpine3.20
WORKDIR /app
COPY package-lock.json /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 4173
RUN npm run build
CMD npm run preview