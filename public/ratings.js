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
        
        const userId = localStorage.getItem('userId'); // Obtener el userId de localStorage
        const hasVoted = localStorage.getItem(`voted_${userId}_${ide}`); // Verificar si el usuario ha votado
        // Crear el HTML para las estrellas
        renderStars(ele, rate, count, hasVoted);
        
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
function renderStars(ele, rate, count, hasVoted=false) {
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

  // Cambiar el color de las estrellas si el usuario ha votado
  if (hasVoted) {
    const stars = ele.getElementsByClassName('star');
    for (const star of stars) {
      star.style.color = 'gold'; // Cambia el color a dorado si el usuario ha votado
    }
  }
}

// Función para manejar la votación
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