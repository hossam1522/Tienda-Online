import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Total de reseñas
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

totalReseñas()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
