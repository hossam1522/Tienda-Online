// ratings.js
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
        
        // Añadir manejador de eventos para cada estrella
        for (const ele_hijo of ele.children) {
          ele_hijo.addEventListener('click', Vota);
        }
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
  for (let i = 1; i <= 5; i++) {
    if (i <= rate) {
      html_nuevo_con_las_estrellas += `<span class="star" data-star="${i}">★</span>`; // Estrella llena
    } else {
      html_nuevo_con_las_estrellas += `<span class="star" data-star="${i}">☆</span>`; // Estrella vacía
    }
  }
  
  // Añadir el número de valoraciones
  html_nuevo_con_las_estrellas += ` (${count})`;
  
  // Actualizar el contenido del elemento
  ele.innerHTML = html_nuevo_con_las_estrellas;
}

// Función para manejar la votación
function Vota(evt) {
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

  // Hacer el fetch para actualizar el rating en la base de datos
  fetch(`/api/ratings/${ide}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      rate: parseInt(pun), // Convertir la estrella seleccionada a número
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
    const { rate, count } = data.rating;
    renderStars(evt.target.parentNode, rate, count); // Actualiza el elemento de votación

    // Marcar que el usuario ha votado
    console.log('Voto registrado correctamente. Guardando estado en localStorage...');
    localStorage.setItem(`voted_${userId}_${ide}`, 'true'); // Guardar en localStorage
    
  })
  .catch(error => {
    console.error('Error al enviar la calificación:', error);
  });
}