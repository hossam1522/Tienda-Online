import { MongoClient } from "mongodb";

console.log("🏁 setAdminUsers.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Función para establecer usuarios como administradores y no administradores
async function setAdminUsers(adminUserIds) {
  try {
    await client.connect();
    console.log("Conectado correctamente al servidor");

    const database = client.db(dbName);
    const usuarios = database.collection("usuarios");

    // Actualizar usuarios especificados como administradores
    const resultAdmin = await usuarios.updateMany(
      { id: { $in: adminUserIds } },
      { $set: { admin: true } }
    );

    // Actualizar el resto de usuarios como no administradores
    const resultNonAdmin = await usuarios.updateMany(
      { id: { $nin: adminUserIds } },
      { $set: { admin: false } }
    );

    console.log(`${resultAdmin.modifiedCount} usuarios actualizados como administradores.`);
    console.log(`${resultNonAdmin.modifiedCount} usuarios actualizados como no administradores.`);
    
    return `${resultAdmin.modifiedCount} usuarios actualizados como administradores, ${resultNonAdmin.modifiedCount} como no administradores.`;
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
