import { MongoClient } from "mongodb";

console.log("🏁 setAdminUsers.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Función para establecer usuarios como administradores
async function setAdminUsers(adminUserIds) {
  try {
    await client.connect();
    console.log("Conectado correctamente al servidor");

    const database = client.db(dbName);
    const usuarios = database.collection("usuarios");

    // Actualizar usuarios
    const result = await usuarios.updateMany(
      { id: { $in: adminUserIds } },
      { $set: { admin: true } }
    );

    console.log(`${result.modifiedCount} usuarios actualizados como administradores.`);
    return `${result.modifiedCount} usuarios actualizados como administradores.`;
  } catch (err) {
    console.error("Error al actualizar usuarios:", err);
    throw err;
  } finally {
    await client.close();
  }
}

// Lista de IDs de usuarios que quieres hacer administradores
const adminUserIds = [4,10]; // Reemplaza con los IDs reales

// Ejecutar la función
setAdminUsers(adminUserIds)
  .then((r) => console.log(`Todo bien: ${r}`))
  .catch((err) => console.error("Algo mal: ", err));

console.log("Lo primero que pasa");
