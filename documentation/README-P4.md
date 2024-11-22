# Práctica 4

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

> [!NOTE] No se va a poner tanto código en este documento como en prácticas anteriores ya que se puede ver en los archivos de la práctica. Se explicará el funcionamiento de cada parte de la práctica y se pondrá el código más relevante. El resto del código se puede ver en los archivos de la práctica indicados en cada apartado.

Esta práctica consiste en hacer una API RESTful para la tienda online para modificar el rating de cada producto. Como mi modelo inicial no incluía el rating de los productos, he tenido que modificar el modelo de productos para añadir un campo `rating` que es un número entre 0 y 5, además de un campo `count` que es el número de veces que se ha valorado el producto. Lo añadido ha sido lo siguiente:

```javascript
rating: {
  rate: {
    type: Number,
    required: true,
    min: 0, // Valor mínimo
    max: 5  // Valor máximo
  },
  count: {
    type: Number,
    required: true,
    default: 0 // Valor por defecto
  }
}
```

### Habilitar endpoints

Lo primero que pide la práctica es habilitar una serie de endpoints, los cuales son:
- `GET /api/ratings` para obtener todos los ratings
- `GET /api/ratings/:id` para obtener el rating de un producto identificado por su id
- `PUT /api/ratings/:id` para modificar un rating a un producto identificado por su id

Esto se ha hecho creando un nuevo archivo de rutas llamado `router_api.js` que contiene las rutas relacionadas con la API RESTful. Para más información sobre la implementación de estos endpoints, se puede ver el archivo `router_api.js`.

### Router

Para que funcione la decodificación de los parámetros que se envian en el body, se ha tenido que añadir el siguiente middleware en el archivo `tienda.js`:

```javascript
app.use(express.json());
```

### Testing

Como dice la práctica, se ha descargado la extensión de Visual Studio Code llamada `REST Client` para poder hacer las pruebas de los endpoints. Se ha creado un archivo llamado `test-api.http` que contiene las pruebas de los endpoints. Para ejecutar las pruebas, se puede hacer clic en el botón `Send Request` que aparece al lado de cada petición. 

### Paginador de productos

Para la parte opcional de la práctica, se pide añadir un paginador al primer endpoint de la API RESTful. Para ello, se ha modificado ese endpoint en el archivo `router_api.js` de la siguiente manera:

```javascript
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
```

Haciendo así que si se indica un parámetro `desde` en la URL, se salten los primeros `desde` productos y, si se indica un parámetro `hasta`, se limiten los productos a `hasta` productos. En caso de no indicar nada, se devuelven todos los productos, ya que coge como valor por defecto `0` para `desde` y `undefined` para `hasta`.

Para probar el paginador, se puede hacer una petición GET a `/api/ratings?desde=0&hasta=4` para obtener los 5 primeros productos. Esto se puede ver en el archivo `test-api.http`.

### Logger

Para la parte opcional de la práctica, se ha añadido un logger que guarda los mensajes de información y de error en una carpeta llamada `logs`. Para ello, se ha creado un archivo llamado `logger.js` que contiene el logger y se ha importado en los archivos necesarios. El código del logger es el siguiente:
  
```javascript
// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info', // Nivel de logging
  format: winston.format.combine(
    winston.format.timestamp(), // Agregar timestamp
    winston.format.json() // Formato JSON
  ),
  transports: [
    new winston.transports.Console(), // Log a la consola
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }), // Log de errores a un archivo
    new winston.transports.File({ filename: 'logs/combined.log' }) // Log combinado a un archivo
  ],
});

// Crear el directorio de logs si no existe
import fs from 'fs';
const dir = './logs';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

export default logger;
```

En tienda.js, se ha importado el logger y se ha añadido un middleware para que todos los mensajes de información y de error se guarden en los archivos correspondientes:

```javascript
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim()), // Log de información
  },
}));
```

Y, finalmente, para cada una de las rutas, se ha añadido un logger para que se guarden los mensajes de información y de error en los archivos correspondientes. Por ejemplo, para la ruta `/login`, se ha añadido el siguiente logger en caso de intento de inicio de sesion:

```javascript
logger.info(`Solicitud POST a /login con usuario ${username}`);
```

Y en caso de error, se ha añadido el siguiente logger:

```javascript
logger.error('Error al procesar la solicitud POST a /login:', error);
```

Y así con cada una de las rutas de la tienda online.