import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Productos con precio mayor a 100
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

productosMasDeCien()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
