import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
      
//router.get('/', async (req, res)=>{
//  try {
//    const productos = await Productos.find({})   // todos los productos
//    res.render('portada.html', { productos })    // ../views/portada.html, 
//  } catch (err) {                                // se le pasa { productos:productos }
//    res.status(500).send({err})
//  }
//})

// Configura Nunjucks


// Ruta para la página principal
router.get('/', async (req, res) => {
  try {
    // Obtener categorías únicas
    const categories = await Productos.distinct('category');

    // Obtener una imagen representativa para cada categoría
    const categoryData = await Promise.all(categories.map(async (category) => {
      const product = await Productos.findOne({ category });
      return {
        name: category,
        image: product ? product.image : 'https://via.placeholder.com/350x200'
      };
    }));

    res.render('index.njk', { categories: categoryData });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/categorias/:category', async (req, res) => {
  try {
    const category = decodeURIComponent(req.params.category);
    const products = await Productos.find({ category });
    res.render('category.njk', { category, products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});


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