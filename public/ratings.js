// ratings.js
// Se ejecuta cuando la página está completamente cargada
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
        let html_nuevo_con_las_estrellas = '';
        for (let i = 1; i <= 5; i++) {
          if (i <= rate) {
            html_nuevo_con_las_estrellas += '★'; // Estrella llena
          } else {
            html_nuevo_con_las_estrellas += '☆'; // Estrella vacía
          }
        }
        
        // Añadir el número de valoraciones
        html_nuevo_con_las_estrellas += ` (${count})`;
        
        // Actualizar el contenido del elemento
        ele.innerHTML = html_nuevo_con_las_estrellas;
      })
      .catch(error => {
        console.error('Error al obtener el rating:', error);
        ele.innerHTML = 'Rating no disponible'; // Mensaje de error
      });
  }
});