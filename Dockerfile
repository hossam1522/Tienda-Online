FROM node:22-alpine3.20
WORKDIR /app
COPY package-lock.json /app
COPY package.json /app
RUN npm ci --only=production && npm cache clean --force
COPY . /app
EXPOSE 8000
ENV IN=production
ENV USER_DB=root
ENV PASS=example
ENV SECRET_KEY="EsTa MisMa:i8775tyjk,"
ENV DB_HOST=172.17.0.1
CMD npm run tienda