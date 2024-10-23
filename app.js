// Obtener la fecha de inicio y fin del mes seleccionado
function obtenerRangoFechas(mes, anio) {
    const primerDia = new Date(anio, mes, 1).toISOString().split('T')[0];
    const ultimoDia = new Date(anio, mes + 1, 0).toISOString().split('T')[0];
    return { primerDia, ultimoDia };
  }
  
  // Función para obtener los datos de la API según el rango de fechas
  async function obtenerSismos(mes, anio) {
    const { primerDia, ultimoDia } = obtenerRangoFechas(mes, anio);
  
    // URL de la API de USGS filtrada para Costa Rica y el rango de fechas seleccionado
    const apiURL = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${primerDia}&endtime=${ultimoDia}&minlatitude=8.0&maxlatitude=11.5&minlongitude=-87.0&maxlongitude=-82.0`;
  
    // Realizar la solicitud a la API
    const respuesta = await fetch(apiURL);
    const datos = await respuesta.json();
    mostrarSismos(datos);
  }
  
  // Inicializar el mapa centrado en Costa Rica
  const mapa = L.map('mapa').setView([9.7489, -83.7534], 7);
  
  // Añadir capa de mapa (de OpenStreetMap)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapa);
  
  // Función para mostrar los sismos en la página y el mapa
  function mostrarSismos(datos) {
    const listaSismos = document.getElementById('lista-sismos');
    listaSismos.innerHTML = ''; // Limpiar lista anterior
    mapa.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        mapa.removeLayer(layer); // Limpiar marcadores anteriores
      }
    });
  
    datos.features.forEach((sismo, index) => {
      const { place, mag, time } = sismo.properties;
      const [long, lat] = sismo.geometry.coordinates;
      const fecha = new Date(time).toLocaleString();
  
      // Crear elemento de la lista
      const idSismo = `sismo-${index}`;
      const listItem = document.createElement('li');
      listItem.classList.add('list-group-item');
      listItem.id = idSismo;
      listItem.innerHTML = `<strong>Lugar:</strong> ${place}, 
                            <strong>Magnitud:</strong> ${mag}, 
                            <strong>Fecha:</strong> ${fecha}`;
      listaSismos.appendChild(listItem);
  
      // Añadir marcador en el mapa
      const marcador = L.marker([lat, long]).addTo(mapa)
        .bindPopup(`<strong>${place}</strong><br>Magnitud: ${mag}`);
  
      // Evento de clic en el marcador para resaltar el sismo en la lista
      marcador.on('click', () => {
        // Remover la clase de resaltado de cualquier otro sismo
        document.querySelectorAll('.sismo-seleccionado').forEach(item => {
          item.classList.remove('sismo-seleccionado');
        });
  
        // Añadir la clase de resaltado al sismo seleccionado
        const itemSeleccionado = document.getElementById(idSismo);
        itemSeleccionado.classList.add('sismo-seleccionado');
  
        // Hacer scroll para que el sismo seleccionado sea visible en la lista
        itemSeleccionado.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });
  }
  
  // Mostrar los sismos del mes actual al cargar la página
  window.onload = () => {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const anioActual = hoy.getFullYear();
    obtenerSismos(mesActual, anioActual);
  };
  
  // Manejar el formulario de búsqueda por mes y año
  document.getElementById('formulario-busqueda').addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Obtener el mes y año seleccionados por el usuario
    const mesSeleccionado = parseInt(document.getElementById('mes').value);
    const anioSeleccionado = parseInt(document.getElementById('anio').value);
  
    // Obtener y mostrar los sismos del mes y año seleccionados
    obtenerSismos(mesSeleccionado, anioSeleccionado);
  });
  
  