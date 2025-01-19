import express from "express";
import Productos from "../model/productos.js";
import logger from "../logger.js";
const router = express.Router();

const base = '/tienda/';
   
// Ruta para la página principal
router.get('/', async (req, res) => {
  try {
    logger.info('Solicitud GET a /');

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
    logger.error('Error al procesar la solicitud GET a /', err);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

router.get('/categorias/:category', async (req, res) => {
  try {
    logger.info('Solicitud GET a /categorias/' + req.params.category);

    // Obtener categorías únicas
    const categories = await Productos.distinct('category');

    // Obtener nombre para cada categoría
    const categoryData = await Promise.all(categories.map(async (category) => {
      const product = await Productos.findOne({ category });
      return {
        name: category,
      };
    }));

    const category = decodeURIComponent(req.params.category);
    const products = await Productos.find({ category });
    res.render('category.njk', { category, products, categories: categoryData });
  } catch (err) {
    logger.error('Error al procesar la solicitud GET a /categorias/' + req.params.category, err);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para mostrar los productos
router.get('/productos/:productId', async (req, res) => {
  try {
    logger.info('Solicitud GET a /productos/' + req.params.productId);
    const categories = await Productos.distinct('category');
    const categoryData = await Promise.all(categories.map(async (category) => {
      const product = await Productos.findOne({ category });
      return {
        name: category
      };
    }));

    const { category, productId } = req.params;
    const product = await Productos.findById(productId);

    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }

    // Obtener información del usuario de la sesión
    const user = req.session.user || null;

    res.render('productos.njk', {
      product,
      categories: categoryData,
      title: `${product.title} - Store`,
      user
    });
  } catch (err) {
    logger.error('Error al procesar la solicitud GET a /productos/' + req.params.productId, err);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para actualizar un producto (solo para administradores)
router.post('/update-product/:productId', async (req, res) => {
  try {
    logger.info('Solicitud POST a /update-product/' + req.params.productId);
    // Verificar si el usuario es administrador
    if (!req.session.user || !req.session.user.admin) {
      return res.status(403).send('Acceso denegado');
    }

    const { productId } = req.params;
    const { title, price } = req.body;

    // Actualizar el producto con validaciones
    const updatedProduct = await Productos.findByIdAndUpdate(
      productId,
      { title, price: parseFloat(price) },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).send('Producto no encontrado');
    }

    // Redirigir de vuelta a la página del producto
    res.redirect(`${base}productos/${productId}`);
  } catch (err) {
    logger.error('Error al procesar la solicitud POST a /update-product/' + req.params.productId, err);
    console.error(err);
    if (err.name === 'ValidationError') {
      // Manejar errores de validación
      let errorMessages = Object.values(err.errors).map(e => e.message);
      return res.status(400).render('error.njk', { 
        errors: errorMessages,
        title: 'Error de Validación'
      });
    }
    res.status(500).send('Error del servidor');
  }
});

// Ruta para la búsqueda
router.get('/search', async (req, res) => {
  try {
    logger.info('Solicitud GET a /search');
    const searchTerm = req.query.q;
    const categories = await Productos.distinct('category');
    const categoryData = await Promise.all(categories.map(async (category) => {
      const product = await Productos.findOne({ category });
      return {
        name: category
      };
    }));

    // Buscar productos que coincidan con el término de búsqueda
    const products = await Productos.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    });

    res.render('search.njk', { 
      searchTerm, 
      products, 
      categories: categoryData,
      title: `Resultados de búsqueda para "${searchTerm}"`
    });
  } catch (err) {
    logger.error('Error al procesar la solicitud GET a /search', err);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para añadir al carrito
router.post('/add-to-cart/:productId', async (req, res) => {
  try {
    logger.info('Solicitud POST a /add-to-cart/' + req.params.productId);
    const productId = req.params.productId;
    const product = await Productos.findById(productId);
    if (!product) {
      return res.status(404).send('Producto no encontrado');
    }
    
    if (!req.session.cart) {
      req.session.cart = [];
    }
    
    const existingProductIndex = req.session.cart.findIndex(item => item.id === productId);
    
    if (existingProductIndex > -1) {
      req.session.cart[existingProductIndex].quantity += 1;
    } else {
      req.session.cart.push({
        id: product._id,
        title: product.title,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }
    
    // Guarda los cambios en la sesión
    req.session.save((err) => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
      }
      res.redirect(`${base}carrito`);
    });
  } catch (err) {
    logger.error('Error al procesar la solicitud POST a /add-to-cart/' + req.params.productId, err);
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para actualizar cantidad en el carrito
router.post('/update-cart', (req, res) => {
  logger.info('Solicitud POST a /update-cart');
  const { productId, quantity } = req.body;
  const cart = req.session.cart || [];
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex > -1) {
    cart[productIndex].quantity = parseInt(quantity);
    if (cart[productIndex].quantity <= 0) {
      cart.splice(productIndex, 1);
    }
  }
  
  req.session.cart = cart;
  // Guarda los cambios en la sesión
  req.session.save((err) => {
    if (err) {
      console.error('Error al guardar la sesión:', err);
    }
    res.redirect(`${base}carrito`);
  });
});

// Ruta para eliminar del carrito
router.post('/remove-from-cart', (req, res) => {
  logger.info('Solicitud POST a /remove-from-cart');
  const { productId } = req.body;
  const cart = req.session.cart || [];
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex > -1) {
    cart.splice(productIndex, 1);
  }
  
  req.session.cart = cart;
  // Guarda los cambios en la sesión
  req.session.save((err) => {
    if (err) {
      console.error('Error al guardar la sesión:', err);
    }
    // Redirigir de vuelta al carrito con base + '/carrito'
    res.redirect(`${base}carrito`);
  });
});

// Ruta para ver el carrito
router.get('/carrito', async(req, res) => {
  logger.info('Solicitud GET a /carrito');
  // Obtener categorías únicas
  const categories = await Productos.distinct('category');

  // Obtener nombre de cada categoría
  const categoryData = await Promise.all(categories.map(async (category) => {
    const product = await Productos.findOne({ category });
    return {
      name: category
    };
  }));

  const cart = req.session.cart || [];
  const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const usuario = req.session.user ? req.session.user.username : null;
  res.render('carrito.njk', { 
    cart, 
    totalPrice: totalPrice.toFixed(2),
    title: 'Carrito de Compras',
    categories: categoryData,
    usuario
  });
});


// ... más rutas aquí

export default router