# Práctica 2

> @author: Hossam El Amraoui Leghzali

#### Puesta a punto

Antes de empezar la práctica, lo primero que hay que hacer es iniciar la base de datos usando:

```bash
docker-compose up
```

como se pudo ver en la primera práctica. Lo siguiente es rellenar la base de datos usando el seed.js usado también en la primera práctica. Para ello, se ejecuta el siguiente comando:

```bash
npm run seed
```

para, finalmente, poner a correr el servidor con la tienda online usando:

```bash
npm run tienda
```

El significado de estos dos últimos comandos se puede ver en el archivo `package.json`. El más importante es el último, que pone a correr el servidor y, a su vez, reinicia el servidor cada vez que se cambie el código, simplificando el desarrollo.

## Descripción de la práctica

Lo primero que se pide es hacer una página de portada que incluya las categorías de los productos que se venden en la tienda, mostrándose con una imagen de alguno de los productos usándolo como producto destacado.
Además, la página tendrá una selección por categorias en un menú, y un buscador para los articulos.

Usando el motor de plantilla, el cual se instala usando

```bash
npm i nunjucks chokidar
```
lo primero que se ha hecho ha sido crear un archivo base que contenga el desplegable de categorías y el buscador. Este archivo se llama `base.njk` y se encuentra en la carpeta `views`. El menú desplegable se ha incluido como:

```html
<li class="nav-item dropdown">
  <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown">
    Categorías
  </a>
  <div class="dropdown-menu" aria-labelledby="navbarDropdown">
    {% for category in categories %}
      <a class="dropdown-item" href="/categorias/{{ category.name | urlencode }}">{{ category.name | capitalize }}</a>
    {% endfor %}
  </div>
</li>
```

dentro del `<body>`, mostrando en el desplegable cada categoría que haya en la base de datos y se le pase al motor de plantillas en el archivo `router_tienda.js`.

El buscador se ha incluido como:

```html
<li class="nav-item">
  <form class="form-inline" action="/search" method="GET">
    <input class="form-control mr-sm-2" type="search" name="q" placeholder="Buscar productos..." aria-label="Search">
    <button class="btn btn-custom" type="submit">
        <i class="fas fa-search"></i>
    </button>
  </form>
</li>
```

que se encuentra en el mismo archivo `base.njk` y que, al hacer click en el botón de buscar, redirige a la página de búsqueda con la query que se haya introducido en el campo de búsqueda, página que se explicará más adelante.

### Portada

La portada se ha hecho en el archivo `index.njk` que se encuentra en la carpeta `views`. En esta página se muestra un "container" con la imagen del producto destacado (un producto cualquiera de la categoría) y el nombre de la categoría, además de un botón para ir a la página de la categoría, así con cada una. 

```html
{% block content %}
<h2>Categorías</h2>
<div class="row">
  {% for category in categories %}
    <div class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="image-container">
          <img src="{{ category.image }}" class="card-img-top" alt="{{ category.name }}">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">{{ category.name | capitalize }}</h5>
          <a href="/categorias/{{ category.name | urlencode }}" class="btn btn-custom mt-auto">Ver Productos</a>
        </div>
      </div>
    </div>
  {% endfor %}
</div>
{% endblock %}
```

Estos datos que usa (las categorías y una imagen para cada categoría) se pasan al motor de plantillas en el archivo `router_tienda.js` y se obtienen de la base de datos.

```javascript
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
```

Se sacan las categorías únicas de la base de datos usando `distinct` y, para cada categoría, se busca un producto de esa categoría y se coge su imagen. Si no hay ningún producto en esa categoría, se pone una imagen por defecto. Estos datos se pasan al motor de plantillas usando `res.render` y se muestran en la página de portada, que es la página principal de la tienda online.

Como se verá más adelante, exceptuando la imagen de cada categoría, esta información (el nombre de cada categoría) se pasará a todas las páginas de la tienda online, para que el menú desplegable contenga siempre las categorías y sea funcional. Esta parte del código funciona tal que así:

- Se obtienen las categorías únicas de la base de datos.

```javascript
const categories = await Productos.distinct('category');
```

- Se obtiene el nombre de cada categoría mediante un mapeo de las categorías únicas y usando un producto de cada categoría para obtener el nombre. El resultado se guarda en `categoryData`. El `Promise.all` se usa para esperar a que todas las promesas se resuelvan.

```javascript
const categoryData = await Promise.all(categories.map(async (category) => {
  const product = await Productos.findOne({ category });
  return {
    name: category,
  };
}));
```

- Se renderiza la página que sea con los datos obtenidos para mostrar las categorías en el menú desplegable.

```javascript
res.render('página.njk', { categories: categoryData });
```

### Categorías

Se ha hecho que desde el menú desplegable y la página de portada se pueda acceder a una página para cada portada que muestre los productos de esa categoría. Esta página se ha hecho en el archivo `category.njk` que se encuentra en la carpeta `views`. En esta página se muestra un "container" con los productos de la categoría, cada uno con su imagen, nombre, parte de la descripción, precio y un botón para ir a la página del producto, la cual se explicará más adelante.

```html
{% block content %}
<h2>Productos en "{{ category | capitalize }}"</h2>
<div class="row row-cols-1 row-cols-md-3 g-4">
  {% for product in products %}
    <div class="col mb-4">
      <div class="card h-100">
        <div class="image-container">
          <img src="{{ product.image }}" class="card-img-top" alt="{{ product.title }}">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title text-truncate" title="{{ product.title }}">{{ product.title }}</h5>
          <p class="card-text description">{{ product.description }}</p>
          <p class="card-text mt-auto"><strong>Precio:</strong> ${{ product.price }}</p>
          <a href="/productos/{{ product._id }}" class="btn btn-custom mt-2">Ver detalles</a>
        </div>
      </div>
    </div>
  {% else %}
    <p>No hay productos en esta categoría.</p>
  {% endfor %}
</div>
{% endblock %}
```

Estos datos que usa (los productos de la categoría) se pasan al motor de plantillas en el archivo `router_tienda.js` y se obtienen de la base de datos.

```javascript
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
```

### Productos

Se ha hecho que desde la página de categorías se pueda acceder a una página para cada producto que muestre los detalles de ese producto. Esta página se ha hecho en el archivo `product.njk` que se encuentra en la carpeta `views`. En esta página se muestra la imagen del producto, el nombre, la descripción, la categoría, el precio y un botón para añadir el producto al carrito, que se explicará más adelante.

```html
{% block content %}
    <div class="row">
        <div class="col-md-6">
            <img src="{{ product.image }}" class="img-fluid" alt="{{ product.title }}">
        </div>
        <div class="col-md-6">
            <h2>{{ product.title }}</h2>
            <p><strong>Precio:</strong> ${{ product.price }}</p>
            <p><strong>Categoría:</strong> {{ product.category | capitalize }}</p>
            <p><strong>Descripción:</strong> {{ product.description }}</p>
            <form action="/add-to-cart/{{ product._id }}" method="POST">
              <button type="submit" class="btn btn-custom">Añadir al Carrito</button>
            </form>
        </div>
    </div>
{% endblock %}
```

Estos datos que usa (los detalles del producto) se pasan al motor de plantillas en el archivo `router_tienda.js` y se obtienen de la base de datos.

```javascript
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
```

### Búsqueda

A la hora de realizar una búsqueda, se mostrará una página con los productos que contengan en su nombre o descripción el térmido de búsqueda. Esta página se ha hecho en el archivo `search.njk` que se encuentra en la carpeta `views`. En esta página se muestra un "container" con los productos que contienen el término de búsqueda, cada uno con su imagen, nombre, parte de la descripción, precio y un botón para ir a la página del producto.

```html
{% block content %}
    <h2>Resultados de búsqueda para "{{ searchTerm }}"</h2>
    {% if products.length > 0 %}
        <div class="row">
            {% for product in products %}
                <div class="col-md-4 mb-4">
                    <div class="card h-100">
                        <div class="image-container">
                            <img src="{{ product.image }}" class="card-img-top" alt="{{ product.title }}">
                        </div>
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">{{ product.title }}</h5>
                            <p class="card-text description">{{ product.description | truncate(100) }}</p>
                            <p class="card-text"><strong>Precio:</strong> ${{ product.price }}</p>
                            <a href="/productos/{{ product._id }}" class="btn btn-custom mt-auto">Ver Detalles</a>
                        </div>
                    </div>
                </div>
            {% endfor %}
        </div>
    {% else %}
        <p>No se encontraron productos que coincidan con tu búsqueda.</p>
    {% endif %}
{% endblock %}
```

Estos datos que usa (los productos que contienen el término de búsqueda) se pasan al motor de plantillas en el archivo `router_tienda.js` y se obtienen de la base de datos.

```javascript
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
```

### Carrito

Se ha hecho que desde la página de productos se pueda añadir un producto al carrito. Para ello, se ha hecho una ruta que añada el producto al carrito y se ha hecho una página que muestre los productos que hay en el carrito. Esta página se ha hecho en el archivo `carrito.njk` que se encuentra en la carpeta `views`. En esta página se muestra un "container" con los productos que hay en el carrito, cada uno con su imagen, nombre, precio y un botón para eliminar el producto del carrito,
además de un botón para cambiar la cantidad de cada producto.

```html
{% block content %}
<h2>Carrito de Compras</h2>
{% if cart and cart.length > 0 %}
    <table class="table">
        <thead>
            <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            {% for item in cart %}
            <tr>
                <td>
                  <div class="cart-image-container">
                    <img src="{{ item.image }}" alt="{{ item.title }}" class="cart-image">
                  </div>
                </td>
                <td><a href="/productos/{{ item.id }}">{{ item.title }}</a></td>
                <td>${{ item.price }}</td>
                <td>
                    <form action="/update-cart" method="POST" class="form-inline">
                        <input type="hidden" name="productId" value="{{ item.id }}">
                        <input type="number" name="quantity" value="{{ item.quantity }}" min="1" class="form-control form-control-sm" style="width: 60px;">
                        <button type="submit" class="btn btn-sm btn-secondary ml-2">Actualizar</button>
                    </form>
                </td>
                <td>${{ (item.price * item.quantity) | round(2) }}</td>
                <td>
                    <form action="/remove-from-cart" method="POST">
                        <input type="hidden" name="productId" value="{{ item.id }}">
                        <button type="submit" class="btn btn-sm btn-danger">Eliminar</button>
                    </form>
                </td>
            </tr>
            {% endfor %}
        </tbody>
    </table>
    <p class="text-right"><strong>Total: ${{ totalPrice }}</strong></p>
{% else %}
    <p>Tu carrito está vacío.</p>
{% endif %}
{% endblock %}
```

Como se puede ver en el HTML, para cada acción se ha hecho un formulario que se envía a una ruta que se encarga de realizar la acción. Estas rutas se han hecho en el archivo `router_tienda.js` y se encargan de distintas cosas.

#### Añadir al carrito

```javascript
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
```

Este código se encarga de añadir un producto al carrito. Primero se obtiene el producto que se quiere añadir al carrito y se comprueba que exista. Después, se comprueba si ya existe el producto en el carrito y, si es así, se aumenta la cantidad en uno. Si no existe, se añade el producto al carrito con una cantidad de uno. Finalmente, se redirige a la página del carrito.

#### Actualizar el carrito

```javascript
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
```

Este código se encarga de actualizar el carrito. Primero se obtiene el producto que se quiere actualizar y la cantidad a la que se quiere actualizar. Después, se busca el producto en el carrito y se actualiza la cantidad. Si la cantidad es menor o igual a cero, se elimina el producto del carrito. Finalmente, se redirige a la página del carrito.

#### Eliminar del carrito

```javascript
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
```

Este código se encarga de eliminar un producto del carrito. Primero se obtiene el producto que se quiere eliminar. Después, se busca el producto en el carrito y se elimina. Finalmente, se redirige a la página del carrito.

### Ver el carrito

```javascript
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
  res.render('carrito.njk', { 
    cart, 
    totalPrice: totalPrice.toFixed(2),
    title: 'Carrito de Compras',
    categories: categoryData
  });
});
```

Este código se encarga de mostrar los productos que hay en el carrito. Primero se obtienen las categorías únicas de la base de datos y se obtiene el nombre de cada categoría. Después, se obtiene el carrito de la sesión y se calcula el precio total del carrito. Finalmente, se renderiza la página del carrito con los datos obtenidos.

Además, para ver el carrito al lado de la barra de navegación, se ha añadido lo siguiente en el archivo `base.njk`:

```html
<li class="nav-item">
  <a class="nav-link {% if not session.cart or session.cart.length == 0 %}disabled{% endif %}" href="/carrito">
      <i class="fas fa-shopping-cart"></i> Carrito
      <span class="badge badge-pill badge-primary" id="cart-count">
        {% if session.cart %}{{ session.cart.length }}{% else %}0{% endif %}
      </span>
  </a>
</li>
```

Este código se encarga de mostrar un carrito junto al número de productos que hay en el carrito al lado del botón de carrito en la barra de navegación. Si no hay productos en el carrito, el botón se deshabilita. Esto último se ha añadido por el apartado de "Para nota". Al darle al botón de carrito, se redirige a la página del carrito siempre y cuando haya productos en el carrito.

### Sesiones

Como se comenta en la práctica, se han metido sesiones temporales usando

```javascript
app.use(session({
	secret: 'my-secret',      // a secret string used to sign the session ID cookie
	resave: false,            // don't save session if unmodified
	saveUninitialized: false  // don't create session until something stored
}))
```

Además, para que esta sesión temporal se mantenga en todas las páginas, se ha hecho un middleware que se encarga de pasar la sesión a todas las páginas.

```javascript
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
```

Este middleware se ha puesto en el archivo `tienda.js` y se encarga de pasar la sesión a todas las páginas.

Es necesario el siguiente módulo para que funcione:

```bash
npm i express-session
```

### Esquema Mongoose

El esquema de Mongoose se ha hecho en el archivo `models/Productos.js` y se ha hecho de la siguiente manera:

```javascript
const ProductosSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  category: {
    type: String
  },
  image: {
    type: String
  }
});
```

Esto se ha hecho para que los productos tengan un id, un título, un precio, una descripción, una categoría y una imagen, todo con su nombre tal y como viene indicado en la API de la práctica (https://fakestoreapi.com/products) para que se puedan coger todos los datos correctamente.