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
