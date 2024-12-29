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
ENV JWT_SECRET="EsTa MisMa:i8775tyjk,"
ENV DB_HOST=mongo
COPY entrypoint.sh /app/entrypoint.sh
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "run", "tienda"]