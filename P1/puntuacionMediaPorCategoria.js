import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Puntuación media por categoría de producto
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

puntuacionMediaPorCategoria()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
