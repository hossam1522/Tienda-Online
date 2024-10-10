import { MongoClient } from "mongodb";
import { exec } from "child_process";
import fs from "fs-extra";
import path from "path";

console.log("🏁 seed.js ----------------->");

// del archivo .env
const USER_DB = process.env.USER_DB;
const PASS = process.env.PASS;

const url = `mongodb://${USER_DB}:${PASS}@localhost:27017/`;
const client = new MongoClient(url);

// Database Name
const dbName = "Tienda_online";

// Copia de seguridad de la base de datos
async function backupDatabase() {
  const backupBaseDir = "./backups"; // Carpeta base donde estarán los backups numerados

  // Asegurarse de que la carpeta base de backups existe
  await fs.ensureDir(backupBaseDir);

  // Obtener todas las carpetas de backups existentes
  const backupFolders = await fs.readdir(backupBaseDir);

  // Filtrar solo los directorios que sigan el patrón "backup_x"
  const existingBackups = backupFolders
    .filter((folder) => folder.startsWith("backup_"))
    .map((folder) => parseInt(folder.split("_")[1], 10)) // Extraer el número del backup
    .filter((num) => !isNaN(num)); // Asegurarse de que es un número válido

  // Obtener el siguiente número secuencial
  const nextBackupNumber =
    existingBackups.length > 0 ? Math.max(...existingBackups) + 1 : 1;

  // Nombre de la nueva carpeta de backup
  const newBackupDir = path.join(backupBaseDir, `backup_${nextBackupNumber}`);

  // Ejecutar mongodump para crear la nueva copia de seguridad
  const backupCommand = `mongodump --db=${dbName} --out=${newBackupDir} --uri=${url} --authenticationDatabase=admin`;

  exec(backupCommand, (err, stdout) => {
    if (err) {
      //console.error(`Error en la copia de seguridad: ${err.message}`);
      //return;

      err.errorResponse += ` en función backupDatabase`;
      throw err;
    }

    console.log(`Copia de seguridad completada con éxito en ${newBackupDir}`);
  });
}

backupDatabase()
  .then(() => console.log(`Todo bien`)) // OK
  .finally(() => client.close())
  .catch((err) => console.error("Algo mal: ", err.errorResponse)); // error
