import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Productos de joyería ordenados por rating
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

productosJoyeríaPorRating()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
