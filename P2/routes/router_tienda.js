import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
      
router.get('/portada', async (req, res)=>{
  try {
    const productos = await Productos.find({})   // todos los productos
    res.render('portada.html', { productos })    // ../views/portada.html, 
  } catch (err) {                                // se le pasa { productos:productos }
    res.status(500).send({err})
  }
})

// Ruta para mostrar los productos
router.get("/productos", async (req, res) => {
  try {
      const productos = await Productos.find({});  // Obtén todos los productos
      res.render("productos.html", { productos }); // Renderiza la vista con los datos
  } catch (err) {
      console.error(err);
      res.status(500).send("Error al obtener los productos");
  }
});

// ... más rutas aquí

export default router