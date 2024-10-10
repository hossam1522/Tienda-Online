import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Productos con descripción que contenga "winter" ordenados por precio
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

productosConWinterOrdenadosPorPrecio()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
