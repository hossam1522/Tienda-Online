# Práctica 7

> @author: Hossam El Amraoui Leghzali

#### Puesta a punto

Gracias a la automatización del despliegue realizada en esta práctica, se puede desplegar la aplicación entera haciendo uso de un solo comando. Para ejecutar la aplicación, se debe ejecutar el siguiente comando:

```bash
docker compose -f docker-compose-prod.yml up
```

Donde `docker-compose-prod.yml` es el archivo de docker-compose que se encarga de desplegar la aplicación entera. En este archivo se definen los servicios de la aplicación, que son la tienda, la base de datos, la aplicación de React y Caddy. Caddy es un servidor web que se encarga de redirigir las peticiones a la aplicación de React y a la tienda, además de la carpeta `public` de la tienda.

```yml
services:
  tienda:
    build: .
    depends_on:
      - mongo
      - caddy
    restart: unless-stopped

  react:
    build: ./React
    depends_on:
      - caddy
    restart: unless-stopped
    
  mongo:
    image: mongo
    restart: unless-stopped
    volumes:
      - ./data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: root
      MONGO_INITDB_ROOT_PASSWORD: example

  caddy:
    image: caddy:alpine
    restart: unless-stopped
    ports: 
      - 80:80
      - 443:443
    volumes:
      - caddy-config:/config
      - caddy-data:/data
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./public:/usr/share/caddy
    
volumes:
  caddy-config:
  caddy-data:
```

## Descripción de la práctica

> [!NOTE] No se va a poner tanto código en este documento como en prácticas anteriores ya que se puede ver en los archivos de la práctica. Se explicará el funcionamiento de cada parte de la práctica y se pondrá el código más relevante. El resto del código se puede ver en los archivos de la práctica indicados en cada apartado.

Una vez desplegada la aplicación, se nos presentan 3 rutas diferentes:

### http://localhost/tienda

En esta ruta se nos presenta la tienda de la aplicación que llevamos desarrollando en las prácticas anteriores. En el `docker-compose-prod.yml` se ha configurado el servicio de la tienda para que se construya en base a un Dockerfile que se encuentra en la carpeta raíz de la práctica. En este Dockerfile se instalan las dependencias necesarias para la aplicación y se ejecuta el comando para arrancar la aplicación.

```Dockerfile
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
```

Vemos que se hace uso de un `entrypoint.sh` que se encarga de esperar a que la base de datos esté disponible antes de arrancar la aplicación. Este `entrypoint.sh` se encuentra en la carpeta raíz de la práctica.

```bash
#!/bin/sh

# Esperar a que la base de datos esté lista
echo "Esperando a que la base de datos esté lista..."
while ! nc -z $DB_HOST 27017; do
  sleep 1
done

# Sembrar la base de datos
echo "Ejecutando seed..."
npm run seed

# Configurar usuarios admin
echo "Configurando usuarios admin..."
node setAdminUsers.js

# Iniciar la aplicación
echo "Iniciando la aplicación..."
exec "$@"
```

El cual se encarga de esperar a que la base de datos esté disponible, sembrar la base de datos, configurar los usuarios admin y arrancar la aplicación.

Una vez arrancada la aplicación gracias a este Dockerfile, esta se muestra en la ruta http://localhost/tienda gracias a Caddy, el cual se encarga de redirigir las peticiones a la aplicación mediante un proxy inverso. La configuración de Caddy se encuentra en el archivo Caddyfile que se encuentra en la carpeta raíz de la práctica.

```Caddyfile
http://localhost {
    redir /tienda /tienda/
    handle_path /tienda/* {
        reverse_proxy tienda:8000
    }
}
```

### http://localhost/react

En esta ruta se nos presenta la aplicación de React que desarrollamos en la práctica anterior. En el `docker-compose-prod.yml` se ha configurado el servicio de React para que se construya en base a un Dockerfile que se encuentra en la carpeta React de la práctica. En este Dockerfile se instalan las dependencias necesarias para la aplicación y se ejecuta el comando para arrancar la aplicación.

```Dockerfile
FROM node:22-alpine3.20
WORKDIR /app
COPY package-lock.json /app
COPY package.json /app
RUN npm install
COPY . /app
EXPOSE 4173
RUN npm run build
CMD npm run preview
```

Una vez arrancada la aplicación gracias a este Dockerfile, esta se muestra en la ruta http://localhost/react gracias a Caddy, el cual se encarga de redirigir las peticiones a la aplicación mediante un proxy inverso. La configuración de Caddy se encuentra en el archivo Caddyfile que se encuentra en la carpeta raíz de la práctica.

```Caddyfile
http://localhost {
    redir /react /react/
    handle_path /react/* {
        reverse_proxy react:4173
    }
}
```

### http://localhost/public

En esta ruta se nos presenta la carpeta public de la tienda. En el `docker-compose-prod.yml` se usa un volumen para montar la carpeta `public` en el contenedor de Caddy. De esta forma, Caddy puede servir los archivos estáticos de la tienda.

```yml
caddy:
    image: caddy:alpine
    restart: unless-stopped
    ports: 
      - 80:80
      - 443:443
    volumes:
      - caddy-config:/config
      - caddy-data:/data
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./public:/usr/share/caddy
```

Una vez montada la carpeta `public` en el contenedor de Caddy, esta se muestra en la ruta http://localhost/public gracias a Caddy, mediante la configuración del archivo Caddyfile.

```Caddyfile
http://localhost {
    redir /public /public/
    handle_path /public/* {
        root * /usr/share/caddy
        file_server browse
    }
}
```

### Para nota: Incluir una página de error 404

Para realizar el apartado de la página de error 404, se ha creado un archivo `404.html` en la carpeta `public` de la tienda. Este archivo se muestra cuando se accede a una ruta que no existe en la tienda. Para mostrar este archivo, se ha añadido una configuración en el archivo Caddyfile.

```Caddyfile
http://localhost {
    root * /usr/share/caddy
    file_server
    handle_errors {
        rewrite * /404.html
        file_server
    }
}
```
De esta forma, cuando se accede a una ruta que no existe en la tienda, se muestra el archivo `404.html`.