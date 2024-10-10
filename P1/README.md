# Ejecución de la práctica

Existe un documento en la práctica llamado `docker-compose.yml` que contiene la configuración de los servicios necesarios para ejecutar la práctica. Para ejecutar la práctica, se debe ejecutar el siguiente comando en la carpeta donde se encuentra el archivo `docker-compose.yml`:

```console
docker-compose up
```

Además, se ha modificado el archivo `package.json` para añadir scripts que permiten ejecutar cada una de las consultas pedidas en la práctica de manera independiente. Para ejecutar cada consulta, se debe usar el siguiente comando:

```console
npm run <nombre_del_script>
```

Donde `<nombre_del_script>` es el nombre del script que se quiere ejecutar. A continuación, en cada una de las secciones de la práctica, se explicará cómo se ha realizado cada consulta y cómo se puede ejecutar con su respectivo comando y nombre del script.

Cabe destacar que hay que tener instalados en el sistema todos los requerimientos necesarios pedidos tanto en la práctica anterior como en esta práctica para poder ejecutar los comandos.

# Realización de la práctica

Antes de nada, se ha modificado el archivo `seed.js` para insertar los datos correspondientes a esta práctica, siempre comprobando que estos datos no se hayan insertado previamente. Antes de poder realizar las consultas, se debe ejecutar el siguiente comando para insertar los datos en la base de datos:

```console
npm run seed
```

A continuación, se va a explicar cómo se han realizado cada una de las consultas pedidas en la práctica:

## Productos de más de 100€

```javascript
async function productosMasDeCien() {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection("productos");

    const result = await productos.find({ price: { $gt: 100 } }).toArray();

    console.log("Productos con precio mayor a 100:");
    console.log(result);
  } catch (err) {
    err.errorResponse += ` en función productosMasDeCien`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `find` de la colección `productos` de la base de datos. En este caso, se ha utilizado el operador `$gt` para seleccionar aquellos documentos cuyo campo `price` sea mayor a 100. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run productosMasDeCien
```

## Productos que contengan 'winter' en la descripción, ordenados por precio

```javascript
async function productosConWinterOrdenadosPorPrecio() {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection("productos");

    const result = await productos
      .find({ description: /winter/i }) // Búsqueda insensible a mayúsculas
      .sort({ price: 1 }) // Orden ascendente por precio
      .toArray();

    console.log(
      "Productos con descripción que contenga 'winter' ordenados por precio:",
    );
    console.log(result);
  } catch (err) {
    err.errorResponse += ` en función productosConWinterOrdenadosPorPrecio`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `find` de la colección `productos` de la base de datos. En este caso, se ha utilizado una expresión regular para seleccionar aquellos documentos cuyo campo `description` contenga la palabra 'winter' (insensible a mayúsculas). Además, se ha utilizado el método `sort` para ordenar los resultados de forma ascendente según el campo `price`. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run productosConWinterOrdenadosPorPrecio
```

## Productos de joyería ordenados por rating

```javascript
async function productosJoyeríaPorRating() {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection("productos");

    const result = await productos
      .find({ category: "jewelery" })
      .sort({ "rating.rate": -1 }) // Orden descendente por rating
      .toArray();

    console.log("Productos de joyería ordenados por rating:");
    console.log(result);
  } catch (err) {
    err.errorResponse += ` en función productosJoyeríaPorRating`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `find` de la colección `productos` de la base de datos. En este caso, se ha utilizado el operador `$eq` para seleccionar aquellos documentos cuyo campo `category` sea igual a 'jewelery'. Además, se ha utilizado el método `sort` para ordenar los resultados de forma descendente según el campo `rating.rate`. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run productosJoyeríaPorRating
```

## Reseñas totales (count en rating)

```javascript
async function totalReseñas() {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection("productos");

    const result = await productos
      .aggregate([
        { $group: { _id: null, totalReseñas: { $sum: "$rating.count" } } },
      ])
      .toArray();

    console.log("Total de reseñas:");
    console.log(result[0].totalReseñas);
  } catch (err) {
    err.errorResponse += ` en función totalReseñas`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `aggregate` de la colección `productos` de la base de datos. En este caso, se ha utilizado el operador `$group` para agrupar todos los documentos en un único grupo y sumar el campo `rating.count` de cada documento. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run totalReseñas
```

## Puntuación media por categoría de producto

```javascript
async function puntuacionMediaPorCategoria() {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection("productos");

    const result = await productos
      .aggregate([
        {
          $group: {
            _id: "$category",
            puntuacionMedia: { $avg: "$rating.rate" },
          },
        },
      ])
      .toArray();

    console.log("Puntuación media por categoría de producto:");
    console.log(result);
  } catch (err) {
    err.errorResponse += ` en función puntuacionMediaPorCategoria`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `aggregate` de la colección `productos` de la base de datos. En este caso, se ha utilizado el operador `$group` para agrupar los documentos según el campo `category` y calcular la media del campo `rating.rate` de cada grupo. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run puntuacionMediaPorCategoria
```

## Usuarios sin digitos en el password

```javascript
async function usuariosSinDigitosEnPassword() {
  try {
    const database = client.db(`${dbName}`);
    const usuarios = database.collection("usuarios");

    const result = await usuarios.find({ password: { $not: /\d/ } }).toArray();

    console.log("Usuarios sin dígitos en la contraseña:");
    console.log(result);
  } catch (err) {
    err.errorResponse += ` en función usuariosSinDigitosEnPassword`;
    throw err;
  }
}
```

Para realizar esta consulta, se ha utilizado el método `find` de la colección `usuarios` de la base de datos. En este caso, se ha utilizado el operador `$not` para seleccionar aquellos documentos cuyo campo `password` no contenga dígitos. Finalmente, se ha utilizado el método `toArray` para obtener un array con los resultados.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run usuariosSinDigitosEnPassword
```

## Hacer una copia de seguridad de la BD (mongodump) 

```javascript
async function backupDatabase() {
  const backupBaseDir = "./backups"; // Carpeta base donde estarán los backups numerados

  // Asegurarse de que la carpeta base de backups existe
  await fs.ensureDir(backupBaseDir);

  // Obtener todas las carpetas de backups existentes
  const backupFolders = await fs.readdir(backupBaseDir);

  // Filtrar solo los directorios que sigan el patrón "backup_x"
  const existingBackups = backupFolders
    .filter((folder) => folder.startsWith("backup_"))
    .map((folder) => parseInt(folder.split("_")[1], 10)) // Extraer el número del backup
    .filter((num) => !isNaN(num)); // Asegurarse de que es un número válido

  // Obtener el siguiente número secuencial
  const nextBackupNumber =
    existingBackups.length > 0 ? Math.max(...existingBackups) + 1 : 1;

  // Nombre de la nueva carpeta de backup
  const newBackupDir = path.join(backupBaseDir, `backup_${nextBackupNumber}`);

  // Ejecutar mongodump para crear la nueva copia de seguridad
  const backupCommand = `mongodump --db=${dbName} --out=${newBackupDir} --uri=${url} --authenticationDatabase=admin`;

  exec(backupCommand, (err, stdout) => {
    if (err) {
      //console.error(`Error en la copia de seguridad: ${err.message}`);
      //return;

      err.errorResponse += ` en función backupDatabase`;
      throw err;
    }

    console.log(`Copia de seguridad completada con éxito en ${newBackupDir}`);
  });
}
```

Para realizar esta consulta, se ha utilizado el comando `mongodump` de MongoDB. En este caso, se ha utilizado el comando `mongodump` para realizar una copia de seguridad de la base de datos especificada en la variable `dbName`. Además, se ha utilizado la opción `--out` para especificar la ruta donde se almacenará la copia de seguridad, que será dentro de una carpeta que se crea en la carpeta base previamente si no existe, llamada `./backups/`. Finalmente, se ha utilizado la opción `--uri` para especificar la URL de conexión a la base de datos y la opción `--authenticationDatabase` para especificar la base de datos de autenticación. 

Además, cada vez que se realice una copia de seguridad, se creará una nueva carpeta de backup con el nombre `backup_x`, donde `x` es un número secuencial que se incrementa en cada copia de seguridad, en vez de sobreescribir la carpeta de backup existente. Todo esto dentro de la carpeta `./backups/`.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run backupDatabase
```

## Bajarse también los archivos de imagen de los productos, y guardarlos en una carpeta. 

```javascript
async function descargarImagenesProductos() {
  const database = client.db("Tienda_online");
  const productos = database.collection("productos");

  // Obtener todos los productos
  const result = await productos.find({}).toArray();

  // Carpeta de destino para las imágenes
  const carpetaImagenes = "./imagenes_productos";

  // Asegurar que la carpeta existe
  await fs.ensureDir(carpetaImagenes);

  for (const producto of result) {
    const imagenUrl = producto.image;
    const nombreImagen = path.basename(imagenUrl); // Obtener el nombre del archivo de la URL

    const rutaArchivo = path.join(carpetaImagenes, nombreImagen);

    // Verificar si la imagen ya existe
    if (await fs.pathExists(rutaArchivo)) {
      //console.log(`La imagen ${nombreImagen} ya existe, no se descargará.`);
    } else {
      console.log(`Descargando la imagen: ${nombreImagen}`);
      try {
        const response = await fetch(imagenUrl);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer); // Convertir a buffer para evitar errores
        await fs.writeFile(rutaArchivo, buffer);
        //console.log(`Imagen ${nombreImagen} descargada y guardada.`);
      } catch (error) {
        console.error(`Error al descargar la imagen ${nombreImagen}:`, error);
      }
    }
  }
}
```

Para realizar esta consulta, se ha utilizado el método `find` de la colección `productos` de la base de datos para obtener todos los productos. Luego, se ha recorrido cada producto y se ha obtenido la URL de la imagen del producto. A continuación, se ha descargado la imagen utilizando la librería `node-fetch` y se ha guardado en una carpeta local llamada `./imagenes_productos/`. Para evitar descargar la misma imagen varias veces, se ha comprobado si la imagen ya existe en la carpeta antes de descargarla.

Para ejecutar esta consulta, hace falta usar el siguiente comando:

```console
npm run descargarImagenesProductos
```