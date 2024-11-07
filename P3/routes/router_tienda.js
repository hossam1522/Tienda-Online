import express from "express";
import Productos from "../model/productos.js";
const router = express.Router();
   
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
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para mostrar los productos
router.get('/productos/:productId', async (req, res) => {
  try {
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

    res.render('productos.njk', {
      product,
      categories: categoryData,
      title: `${product.title} - Store`
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para la búsqueda
router.get('/search', async (req, res) => {
  try {
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
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para añadir al carrito
router.post('/add-to-cart/:productId', async (req, res) => {
  try {
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
    
    res.redirect('/carrito');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error del servidor');
  }
});

// Ruta para actualizar cantidad en el carrito
router.post('/update-cart', (req, res) => {
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
  res.redirect('/carrito');
});

// Ruta para eliminar del carrito
router.post('/remove-from-cart', (req, res) => {
  const { productId } = req.body;
  const cart = req.session.cart || [];
  const productIndex = cart.findIndex(item => item.id === productId);
  
  if (productIndex > -1) {
    cart.splice(productIndex, 1);
  }
  
  req.session.cart = cart;
  res.redirect('/carrito');
});

// Ruta para ver el carrito
router.get('/carrito', async(req, res) => {
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
  const usuario = req.username;
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