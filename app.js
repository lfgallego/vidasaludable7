// URL de tu Apps Script WebApp
const API_URL = "https://script.google.com/macros/s/AKfycbzvOoR8WVG_JxjAEozv_QH7p2FNu40zyONrO1tKQ1RETR4Wy6d7hajq94eu4C1LxwyZ5w/exec";

let disponibilidad = [];

const loaderContainer = document.getElementById("loader-container");
const mainContent = document.getElementById("main-content");
const btnReservar = document.getElementById("btnReservar");
const btnSpinner = document.getElementById("btn-spinner");

// Funciones de control de UI
function showLoader() {
  loaderContainer.classList.remove('hidden');
  mainContent.style.display = 'none';
}

function hideLoader() {
  loaderContainer.classList.add('hidden');
  mainContent.style.display = 'block';
}

function showButtonLoading() {
  btnReservar.disabled = true;
  btnSpinner.style.display = 'inline-block';
}

function hideButtonLoading() {
  btnReservar.disabled = false;
  btnSpinner.style.display = 'none';
}

// Cargar disponibilidad desde Google Sheets
async function cargarDisponibilidad() {
  try {
    const res = await fetch(`${API_URL}?action=getDisponibilidad`);
    const data = await res.json();

    if (data.status === "ok") {
      disponibilidad = data.data;

      const lugares = [...new Set(disponibilidad.map(d => d.lugar))];
      const lugarSelect = document.getElementById("lugar");
      lugarSelect.innerHTML = `<option value="">Seleccione un lugar</option>`;
      lugares.forEach(lugar => {
        lugarSelect.innerHTML += `<option value="${lugar}">${lugar}</option>`;
      });
    } else {
      console.error("Error del script:", data.message);
      alert("No se pudo cargar la disponibilidad. Intenta más tarde.");
    }
  } catch (err) {
    console.error("Error cargando disponibilidad:", err);
    alert("Ocurrió un error al cargar la disponibilidad.");
  } finally {
    // Ocultar el loader al final
    hideLoader();
  }
}

// Reservar una cita (con POST)
async function reservarCita(e) {
  e.preventDefault();
  showButtonLoading(); // Mostrar el spinner

  const nombre = document.getElementById("nombre").value;
  const cedula = document.getElementById("cedula").value;
  const telefono = document.getElementById("telefono").value;
  const lugar = document.getElementById("lugar").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!nombre || !cedula || !telefono || !lugar || !fecha || !hora) {
    alert("Por favor, complete todos los campos.");
    hideButtonLoading(); // Ocultar el spinner si faltan datos
    return;
  }

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ nombre, cedula, telefono, lugar, fecha, hora })
    });
    
    const data = await res.json();

    if (data.status === "ok") {
      alert("✅ Cita registrada con éxito");
      document.getElementById("form-cita").reset();
    } else {
      console.error("Error del script:", data.message);
      alert("⚠️ No se pudo registrar la cita. Intenta más tarde.");
    }
  } catch (err) {
    console.error("Error registrando cita:", err);
    alert("Ocurrió un error al registrar la cita.");
  } finally {
    hideButtonLoading(); // Ocultar el spinner al final de la petición
  }
}

// Funciones de actualización de selects
function actualizarFechas() {
  const lugar = document.getElementById("lugar").value;
  const fechas = [...new Set(disponibilidad.filter(d => d.lugar === lugar).map(d => d.fecha))];

  const fechaSelect = document.getElementById("fecha");
  fechaSelect.innerHTML = `<option value="">Seleccione una fecha</option>`;
  fechas.forEach(fecha => {
    fechaSelect.innerHTML += `<option value="${fecha}">${fecha}</option>`;
  });
  
  document.getElementById("fecha").disabled = false;
  document.getElementById("hora").innerHTML = `<option value="">Seleccione una hora</option>`;
  document.getElementById("hora").disabled = true;
}

function actualizarHoras() {
  const lugar = document.getElementById("lugar").value;
  const fecha = document.getElementById("fecha").value;
  const horas = disponibilidad.filter(d => d.lugar === lugar && d.fecha === fecha).map(d => d.hora);

  const horaSelect = document.getElementById("hora");
  horaSelect.innerHTML = `<option value="">Seleccione una hora</option>`;
  horas.forEach(hora => {
    horaSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
  });
  
  document.getElementById("hora").disabled = false;
}

// Inicializar la página
window.onload = () => {
  cargarDisponibilidad();
  document.getElementById("lugar").addEventListener("change", actualizarFechas);
  document.getElementById("fecha").addEventListener("change", actualizarHoras);
  document.getElementById("form-cita").addEventListener("submit", reservarCita);
};
