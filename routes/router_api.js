import express from "express";
import Productos from "../model/productos.js";
import logger from "../logger.js";

const router = express.Router();

// Obtener todos los ratings con paginación
router.get('/api/ratings', async (req, res) => {
  const { desde = 0, hasta } = req.query; // 'hasta' puede ser indefinido
  try {
    logger.info(`Solicitud GET a /api/ratings?desde=${desde}&hasta=${hasta}`);
    const query = Productos.find({}, '_id title rating').skip(Number(desde)); // Salta los primeros 'desde' productos

    // Si 'hasta' está definido, aplica limit
    if (hasta) {
      query.limit(Number(hasta)+1); // Limita a 'hasta' productos
    }

    const products = await query; // Ejecuta la consulta
    res.json(products);
  } catch (err) {
    logger.error(`Error al obtener ratings: ${err}`);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Obtener el rating de un producto específico
router.get('/api/ratings/:id', async (req, res) => {
  try {
    logger.info(`Solicitud GET a /api/ratings/${req.params.id}`);
    const product = await Productos.findOne({ _id: req.params.id }, '_id title rating');
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    res.json(product);
  } catch (err) {
    logger.error(`Error al obtener rating de producto: ${err}`);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Modificar el rating de un producto específico
router.put('/api/ratings/:id', async (req, res) => {
  const { rate } = req.body; // Solo necesitas el nuevo rating
  try {
    logger.info(`Solicitud PUT a /api/ratings/${req.params.id}`);
    
    // Buscar el producto actual
    const product = await Productos.findOne({ _id: req.params.id });
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // Sumar el nuevo rating al existente
    const newCount = product.rating.count + 1; // Incrementar el conteo
    const newRate = ((product.rating.rate * product.rating.count) + rate) / newCount; // Calcular el nuevo rating promedio

    // Redondear el nuevo rating a 2 decimales
    const roundedRate = Math.round(newRate * 100) / 100; // Redondear a 2 decimales

    // Actualizar el producto con el nuevo rating y conteo
    const updatedProduct = await Productos.findOneAndUpdate(
      { _id: req.params.id },
      { rating: { rate: roundedRate, count: newCount } },
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (err) {
    logger.error(`Error al modificar rating de producto: ${err}`);
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).send('Error de validación');
    }
    res.status(500).send('Error del servidor');
  }
});

export default router;