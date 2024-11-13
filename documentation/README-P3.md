# Práctica 3

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

Además, debido a la segunda parte de la práctica (práctica 3.2), se ha creado un nuevo archivo llamado `setAdminUsers.js` que se encarga de asignar el rol de administrador a los usuarios indicados en 
```javascript
const adminUserIds = [4,10]; // Reemplaza con los IDs reales
```
Y a los demás usuarios se les asigna el rol de cliente (es decir, rol de admini en falso). Para ejecutar este script, se usa el siguiente comando:

```bash
node --env-file=.env setAdminUsers.js
```

para, finalmente, poner a correr el servidor con la tienda online usando:

```bash
npm run tienda
```

El significado de los comandos se puede ver en el archivo `package.json`. El más importante es el último, que pone a correr el servidor y, a su vez, reinicia el servidor cada vez que se cambie el código, simplificando el desarrollo.

## Descripción de la práctica

> Nota: no se va a poner tanto código en este documento como en prácticas anteriores ya que se puede ver en los archivos de la práctica. Se explicará el funcionamiento de cada parte de la práctica y se pondrá el código más relevante. El resto del código se puede ver en los archivos de la práctica indicados en cada apartado.

En esta práctica, de primeras, se pide añadir autentificación a la tienda online de la práctica anterior. Lo primero que se ha hecho ha sido crear un nuevo archivo de rutas llamado `router_usuarios.js` que contiene las rutas relacionadas con lo que tiene que ver con los usuarios. En este caso, contiene las rutas:

#### login (get)

Esta ruta se encarga de mostrar el formulario de login. Una vez el usuario se loguea, se le redirige a la página principal.

#### login (post)

Se encarga de recibir los datos del formulario de login y comprobar si el usuario existe en la base de datos. Debido al apartado para nota extra de la práctica (Usar contraseñas cifradas), se ha tenido que modificar el archivo `seed.js` para cifrar las contraseñas de los usuarios. 

Entonces, en esta ruta, se comprueba si el usuario existe y si la contraseña es correcta usando la función `compare` de `bcrypt`, que compara la contraseña introducida con la contraseña cifrada en la base de datos. Si todo es correcto, se crea un token JWT con la información del usuario y se le envía al cliente.

Una vez el cliente recibe el token JWT, lo guarda en la sesión local y redirige a una página de bienvenida con un botón para ir a la página principal.

#### welcome

Esta ruta se encarga de mostrar la página de bienvenida con un botón para ir a la página principal.

#### logout

Esta ruta se encarga de borrar el token de la sesión local y redirigir a una página de despedida con un botón para ir a la página principal.

### Middleware de autentificación

En el archivo `tienda.js`, se ha creado un middleware de autentificación que se encarga de comprobar la cookie del token JWT. Si el token es correcto, se añade el usuario a la request además de si este es administrador o no:

```javascript
const autentificación = (req, res, next) => {
  const token = req.cookies.access_token;
  if (token) {
    try {
      const data = jwt.verify(token, process.env.JWT_SECRET);
      req.session.user = { username: data.username, admin: data.admin };
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  }
  next();
};

app.use(autentificación);
```

### Modificación de la plantilla base

Como se pide en la primera parte de la práctica, cuando un usuario está logueado, en la barra de navegación se debe mostrar un botón de `Salir` para cerrar la sesión. En caso de que no esté logueado, se debe mostrar un botón de `Identificarse` para ir a la página de login. Esto se ha hecho modificado el archivo `views/base.njk`:

```html
<!-- Identificarse o Salir -->
{% if user %}
    <li class="nav-item">
        <a class="nav-link" href="/logout">Salir</a>
    </li>
{% else %}
    <li class="nav-item">
        <a class="nav-link" href="/login">Identificarse</a>
    </li>
{% endif %}
```

### Usuarios administradores

Como se ha comentado al principio, se ha creado un script que se encarga de asignar el rol de administrador a los usuarios indicados en el array `adminUserIds` y el rol de cliente a los demás usuarios. Para ello, se ha creado un nuevo archivo llamado `setAdminUsers.js` que se encarga de hacer eso. También ha sido necesario modificar el modelo de usuario para añadir un campo `admin` que indica si el usuario es administrador o no, añadiendo:

```javascript
admin: {
  type: Boolean,
  default: false,
  required: false
}
```

Este valor, como se puede ver en el apartado de Middleware de autentificación, se añade a la request para saber si el usuario es administrador o no.

### Formulario para cambiar el precio y título de un producto

En la segunda parte de la práctica, se pide añadir un formulario para cambiar el precio y título de un producto. Para ello, se ha modificado el archivo `productos.njk` para incluir o el formulario o el botón de añadir al carrito, dependiendo de si detecta que la sesión actual corresponde a un usuario administrador o no:

```html
{% if user and user.admin %}
<!-- Formulario para administradores -->
<form action="/update-product/{{ product._id }}" method="POST">
    <div class="mb-3">
        <label for="title" class="form-label">Nuevo título:</label>
        <input type="text" class="form-control" id="title" name="title" value="{{ product.title }}">
    </div>
    <div class="mb-3">
        <label for="price" class="form-label">Nuevo precio:</label>
        <input type="number" class="form-control" id="price" name="price" value="{{ product.price }}" step="0.01">
    </div>
    <button type="submit" class="btn btn-primary">Actualizar Producto</button>
</form>
{% else %}
<!-- Botón para usuarios normales -->
<form action="/add-to-cart/{{ product._id }}" method="POST">
    <button type="submit" class="btn btn-custom">Añadir al Carrito</button>
</form>
{% endif %}
```

Como se puede ver, si el usuario es administrador, se muestra el formulario para cambiar el precio y título del producto. En caso contrario, se muestra el botón para añadir al carrito.

En caso de modificar el producto, se ha creado una nueva ruta en el archivo `router_productos.js` que se encarga de recibir los datos del formulario y modificar el producto en la base de datos:

```javascript
// Ruta para actualizar un producto (solo para administradores)
router.post('/update-product/:productId', async (req, res) => {
  try {
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
    res.redirect(`/productos/${productId}`);
  } catch (err) {
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
```
modificando el producto con los datos recibidos del formulario y validando los datos antes de modificar el producto.

### Validación para que el titulo del producto comience por mayúscula

Como se puede ver en el código anterior, se ha añadido una validación para que el título del producto comience por mayúscula, tal y como pide la práctica. Esto se ha hecho añadiendo una validación en el modelo de producto:

```javascript
title: {
  type: String,
  required: true,
  validate: {
    validator: function(v) {
      return /^[A-Z]/.test(v);
    },
    message: props => `${props.value} debe comenzar con una letra mayúscula!`
  }
}
```
y validar los datos antes de modificar el producto en la ruta de `update-product`. En caso de que el título no comience por mayúscula, se muestra una página de error con el mensaje de error, pudiendo ver el código en el archivo `error.njk`.