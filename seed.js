import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;
const DB_HOST = process.env.DB_HOST;

const url = `mongodb://${USER_DB}:${PASS}@${DB_HOST}:27017`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Función para hashear contraseña
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// Función para insertar datos en una colección
async function Inserta_datos_en_colección(colección, url) {
  try {
    const database = client.db(`${dbName}`);
    const productos = database.collection(`${colección}`);

    // Comprobar si la colección está vacía
    const documentosEnColeccion = await productos.countDocuments();

    if (documentosEnColeccion > 0) {
      return `La colección ${colección} ya tiene ${documentosEnColeccion} documentos. No se insertarán nuevos datos.`;
    }

    // Si la colección está vacía, se procede a insertar los datos
    try {
      let datos = await fetch(url).then((res) => res.json());

      // Si la colección es 'usuarios', hashear las contraseñas
      if (colección === 'usuarios') {
        datos = await Promise.all(datos.map(async (user) => {
          user.password = await hashPassword(user.password);
          user.isPasswordHashed = true; // Añadir un campo para indicar que la contraseña está hasheada
          return user;
        }));
      }

      // Insertar datos en la colección
      const result = await productos.insertMany(datos);

      // Mostrar resultados
      return `${result.insertedCount} datos insertados en la colección ${colección}`;
    } catch (err) {
      err.errorResponse += ` en fetch ${colección}`;
      throw err;
    }
  } catch (err) {
    err.errorResponse += ` en inserción ${colección}`;
    throw err;
  }
}

// Inserción consecutiva
Inserta_datos_en_colección("productos", "https://fakestoreapi.com/products")
  .then((r) => console.log(`Todo bien: ${r}`)) // OK
  .then(() =>
    Inserta_datos_en_colección("usuarios", "https://fakestoreapi.com/users"),
  )
  .then((r) => console.log(`Todo bien: ${r}`)) // OK
  // Cerrar conexión
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error

console.log("Lo primero que pasa");
