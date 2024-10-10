import { MongoClient } from "mongodb";
import fetch from "node-fetch";
import fs from "fs-extra";
import path from "path";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

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

descargarImagenesProductos()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
