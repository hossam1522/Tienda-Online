# Práctica 5

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


### Leer ratings de productos y mostrarlos con estrellas

Tal y como indica la descripción de la práctica, en las páginas de descripción de los productos se deben mostrar los ratings de los productos con estrellas. Lo primero que se ha hecho ha sido indicar en el archivo `productos.njk` el sitio donde se deben mostrar las estrellas. Para ello, se ha añadido el siguiente código:

```html
<span class="stars" data-_id="{{product._id}}"></span>
```

Debajo del precio, categoría y descripción del producto. Para que se muestren las estrellas, se ha creado un archivo `rating.js` en la carpeta `public/` que se encarga de hacer una petición a la API para obtener el rating de un producto y mostrarlo con estrellas, cargando el script en el archivo `productos.njk` una vez se haya cargado el DOM. El código en `rating.js` es el siguiente:

```javascript
document.addEventListener('DOMContentLoaded', () => {
  console.log('Iniciando fetch ...');
  
  const ele_stars = document.getElementsByClassName('stars');  // Todos los elementos de la clase 'stars' que haya en la página
  
  for (const ele of ele_stars) {
    const ide = ele.dataset._id;   // _id está en los atributos del dataset
    
    // Hacer el fetch para obtener el rating del producto
    fetch(`/api/ratings/${ide}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        return response.json();
      })
      .then(data => {
        // Suponiendo que la respuesta tiene la estructura { rating: { rate, count } }
        const { rate, count } = data.rating;
        
        // Crear el HTML para las estrellas
        renderStars(ele, rate, count);
        
      })
      .catch(error => {
        console.error('Error al obtener el rating:', error);
        ele.innerHTML = 'Rating no disponible'; // Mensaje de error
      });
  }
});

// Función para renderizar las estrellas
function renderStars(ele, rate, count) {
  let html_nuevo_con_las_estrellas = '';
  html_nuevo_con_las_estrellas += `${rate.toFixed(2)} `; // Añadir el rating con 2 decimales
  for (let i = 1; i <= 5; i++) {
    if (i <= rate) {
      html_nuevo_con_las_estrellas += `<span class="star voted" data-star="${i}">★</span>`; // Estrella llena
    } else {
      html_nuevo_con_las_estrellas += `<span class="star" data-star="${i}">☆</span>`; // Estrella vacía
    }
  }
  
  // Añadir el número de valoraciones
  html_nuevo_con_las_estrellas += ` (${count})`;
  
  // Actualizar el contenido del elemento
  ele.innerHTML = html_nuevo_con_las_estrellas;

}
```

Donde se hace un fetch a la API para obtener el rating de un producto y se renderizan las estrellas en el lugar indicado mediante la función `renderStars`, que se encarga de crear el HTML necesario para mostrar las estrellas y el número de valoraciones.

### Votación al hacer click en las estrellas

Para la votación al hacer click en las estrellas, se ha añadido un evento `click` a cada estrella que se renderiza en la función `renderStars`. El código añadido es el siguiente:

```javascript
// Añadir manejador de eventos para cada estrella
for (const ele_hijo of ele.children) {
  ele_hijo.addEventListener('click', Vota);
}
```

Justo después de la llamada a `renderStars`. Para poder votar, se ha decidido que el usuario tiene que estar autenticado y que solo pueda votar una vez por producto. Para ello, se ha añadido una key en el objeto `localStorage` que incluye el id del usuario y id del producto, además de un booleano que indica si ya ha votado o no. Esto realmente se debería hacer en el servidor, pero para simplificar la práctica se ha hecho en el cliente. El código para votar es el siguiente:

```javascript
function Vota(evt) {
  evt.preventDefault(); // Evitar el comportamiento predeterminado del evento

  const ide = evt.target.parentNode.dataset._id; // ID del producto
  const pun = evt.target.dataset.star; // Estrella seleccionada

  // Obtener el userId de localStorage
  const userId = localStorage.getItem('userId');

  if (!userId) {
    alert('Debes iniciar sesión para votar.');
    return; // Salir si no hay usuario
  }

  // Verificar si el usuario ya ha votado
  if (localStorage.getItem(`voted_${userId}_${ide}`)) {
    alert('Ya has votado por este producto en esta sesión.');
    return; // Salir si ya ha votado
  }

  // Guardar el estado anterior para revertir en caso de error
  const previousState = {
    rate: parseInt(evt.target.parentNode.dataset.currentRate), // Estado actual
    count: parseInt(evt.target.parentNode.dataset.currentCount) // Conteo actual
  };

  // Actualizar la interfaz de usuario inmediatamente
  const newRate = parseInt(pun);
  const newCount = previousState.count + 1; // Incrementar el conteo
  const updatedRate = ((previousState.rate * previousState.count) + newRate) / newCount; // Calcular el nuevo rating promedio
  const roundedRate = Math.round(updatedRate * 100) / 100; // Redondear a 2 decimales

  // Actualizar la visualización de las estrellas
  const ele = evt.target.parentNode; // Obtener el elemento padre
  if (ele) {
    renderStars(ele, roundedRate, newCount, true); // Actualiza la visualización
  } else {
    console.error('Elemento no encontrado para actualizar las estrellas.');
    return; // Salir si el elemento no existe
  }

  // Hacer el fetch para actualizar el rating en la base de datos
  fetch(`/api/ratings/${ide}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rate: newRate, // Convertir la estrella seleccionada a número
    })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Error al actualizar el rating');
    }
    return response.json();
  })
  .then(data => {
    // Actualizar las estrellas y el número de votos con la respuesta
    console.log('Voto registrado correctamente. Guardando estado en localStorage...');
    localStorage.setItem(`voted_${userId}_${ide}`, 'true'); // Guardar en localStorage
    
    const { rate, count } = data.rating;
    renderStars(ele, rate, count, true); // Actualiza el elemento de votación
  })
  .catch(error => {
    console.error('Error al enviar la calificación:', error);
    // Revertir al estado anterior en caso de error
    if (ele) {
      renderStars(ele, previousState.rate, previousState.count, false); // Revertir a la visualización anterior
    }
  });
}
```

Donde se comprueba si el usuario está autenticado mediante otra key en el objeto `localStorage` que se guarda al iniciar sesión y se borra una vez que se cierra sesión. Si el usuario no está autenticado o ya ha votado, se muestra un mensaje de error y no se hace nada. 

#### Actualización optimística (Apartado para nota extra)

Se puede comprobar en el código que se ha hecho una actualización optimística de la interfaz de usuario, es decir, se actualiza la interfaz de usuario inmediatamente después de hacer click en una estrella, guardando el estado anterior para revertir en caso de error. Una vez se haya hecho la petición a la API y se haya actualizado el rating en la base de datos, se actualiza la interfaz de usuario con el rating real. En caso de error, se revierte al estado anterior.

#### Cambio de color de las estrellas al votar

Como se indica en la descripción de la práctica, se ha añadido un cambio de color al votar. Para ello, se ha añadido el siguiente código en el archivo `rating.js`, en la función `renderStars`:

```javascript
// Cambiar el color de las estrellas si el usuario ha votado
if (hasVoted) {
  const stars = ele.getElementsByClassName('star');
  for (const star of stars) {
    star.style.color = 'gold'; // Cambia el color a dorado si el usuario ha votado
  }
}
```

Siendo `hasVoted` un argumento que se le pasa a la función `renderStars` que indica si el usuario ha votado o no. Este se obtiene comprobando si existe una key en el objeto `localStorage` con el formato `voted_${userId}_${productId}`. Si el usuario ha votado, se cambia el color de las estrellas a dorado.