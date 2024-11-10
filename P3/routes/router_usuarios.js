import express from "express";
import Productos from "../model/productos.js";
import Usuarios from "../model/usuarios.js";
const router = express.Router();
import jwt from "jsonwebtoken"
import bcrypt from 'bcrypt';
//const token = jwt.sign({usuario: user.username}, process.env.SECRET_KEY)

// Para mostrar formulario de login
router.get('/login', async(req, res)=>{
  // Obtener categorías únicas
  const categories = await Productos.distinct('category');

  // Obtener nombre de cada categoría
  const categoryData = await Promise.all(categories.map(async (category) => {
    const product = await Productos.findOne({ category });
    return {
      name: category
    };
  }));
  res.render("login.njk", {categories: categoryData})
})

// Para recoger datos del formulario de login 
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar el usuario en la base de datos
    const user = await Usuarios.findOne({ username });

    if (!user) {
      return res.redirect('/login?error=Usuario no encontrado');
    }

    // Verificar la contraseña
    // const isValidPassword = password === user.password;
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.redirect('/login?error=Contraseña incorrecta');
    }

    // Generar token JWT
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    //console.log('Token generado:', token);

    req.session.user = { username: user.username };

    // Establecer cookie y redirigir a la página de bienvenida
    res.cookie("access_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    }).redirect('/welcome');

  } catch (error) {
    console.error('Error en el proceso de login:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ruta para la página de bienvenida
router.get('/welcome', async (req, res) => {
  try {
    // Verificar el token de la cookie
    const token = req.cookies.access_token;
    if (!token) {
      return res.redirect('/login');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Usuarios.findById(decodedToken.userId);

    if (!user) {
      return res.redirect('/login');
    }

    // Obtener categorías para el menú
    const categories = await Productos.distinct('category');
    const categoryData = categories.map(category => ({ name: category }));

    req.session.cart = [];

    res.render("bienvenida.njk", {
      username: user.username,
      categories: categoryData
    });
  } catch (error) {
    console.error('Error al cargar la página de bienvenida:', error);
    res.clearCookie("access_token");
    res.redirect('/login');
  }
});

/* router.get('/logout', (req, res) => {
  const usuario = req.username 
  res.clearCookie('access_token').render("despedida.njk", {usuario})
}) */

router.get('/logout', (req, res) => {
  const usuario = req.session.user ? req.session.user.username : null;
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al destruir la sesión:', err);
    }
    res.clearCookie('access_token').render("despedida.njk", {usuario});
  });
});

export default router;