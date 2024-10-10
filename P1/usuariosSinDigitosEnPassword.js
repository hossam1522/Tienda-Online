import { MongoClient } from "mongodb";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Usuarios sin dígitos en la contraseña
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

usuariosSinDigitosEnPassword()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
