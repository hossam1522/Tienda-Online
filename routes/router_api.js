import express from "express";
import Productos from "../model/productos.js";

const router = express.Router();

// Obtener todos los ratings
router.get('/api/ratings', async (req, res) => {
  try {
    const products = await Productos.find({}, 'id title rating'); // Solo obtener id, title y rating
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Obtener el rating de un producto específico
router.get('/api/ratings/:id', async (req, res) => {
  try {
    const product = await Productos.findOne({ _id: req.params.id }, '_id title rating');
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Modificar el rating de un producto específico
router.put('/api/ratings/:id', async (req, res) => {
  const { rate, count } = req.body; // Asegúrate de que el rating se envíe en el cuerpo de la solicitud
  try {
    const product = await Productos.findOneAndUpdate(
      { id: req.params.id },
      { rating: { rate, count } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).send('Error de validación');
    }
    res.status(500).send('Error del servidor');
  }
});

export default router;