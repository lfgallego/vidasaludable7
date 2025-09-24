// URL de tu Apps Script WebApp
const API_URL = "https://script.google.com/macros/s/AKfycbzvOoR8WVG_JxjAEozv_QH7p2FNu40zyONrO1tKQ1RETR4Wy6d7hajq94eu4C1LxwyZ5w/exec";

let disponibilidad = [];

// Cargar disponibilidad desde Google Sheets
async function cargarDisponibilidad() {
  try {
    const res = await fetch(`${API_URL}?action=getDisponibilidad`);
    disponibilidad = await res.json();

    // Llenar el select de lugares
    const lugares = [...new Set(disponibilidad.map(d => d.lugar))];
    const lugarSelect = document.getElementById("lugar");
    lugarSelect.innerHTML = `<option value="">Seleccione un lugar</option>`;
    lugares.forEach(lugar => {
      lugarSelect.innerHTML += `<option value="${lugar}">${lugar}</option>`;
    });
  } catch (err) {
    console.error("Error cargando disponibilidad:", err);
    alert("No se pudo cargar la disponibilidad. Intenta más tarde.");
  }
}

// Cuando el usuario elige un lugar, mostrar las fechas disponibles
function actualizarFechas() {
  const lugar = document.getElementById("lugar").value;
  const fechas = [...new Set(disponibilidad.filter(d => d.lugar === lugar).map(d => d.fecha))];

  const fechaSelect = document.getElementById("fecha");
  fechaSelect.innerHTML = `<option value="">Seleccione una fecha</option>`;
  fechas.forEach(fecha => {
    fechaSelect.innerHTML += `<option value="${fecha}">${fecha}</option>`;
  });

  // Limpiar horas
  document.getElementById("hora").innerHTML = `<option value="">Seleccione una hora</option>`;
}

// Cuando el usuario elige una fecha, mostrar las horas disponibles
function actualizarHoras() {
  const lugar = document.getElementById("lugar").value;
  const fecha = document.getElementById("fecha").value;

  const horas = disponibilidad
    .filter(d => d.lugar === lugar && d.fecha === fecha)
    .map(d => d.hora);

  const horaSelect = document.getElementById("hora");
  horaSelect.innerHTML = `<option value="">Seleccione una hora</option>`;
  horas.forEach(hora => {
    horaSelect.innerHTML += `<option value="${hora}">${hora}</option>`;
  });
}

// Reservar una cita
async function reservarCita(e) {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const cedula = document.getElementById("cedula").value;
  const telefono = document.getElementById("telefono").value;
  const lugar = document.getElementById("lugar").value;
  const fecha = document.getElementById("fecha").value;
  const hora = document.getElementById("hora").value;

  if (!nombre || !cedula || !telefono || !lugar || !fecha || !hora) {
    alert("Por favor, complete todos los campos.");
    return;
  }

  try {
    const url = `${API_URL}?action=bookCita&nombre=${encodeURIComponent(nombre)}&cedula=${encodeURIComponent(cedula)}&telefono=${encodeURIComponent(telefono)}&lugar=${encodeURIComponent(lugar)}&fecha=${encodeURIComponent(fecha)}&hora=${encodeURIComponent(hora)}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.success) {
      alert("✅ Cita registrada con éxito");
      document.getElementById("form-cita").reset();
    } else {
      alert("⚠️ No se pudo registrar la cita. Intenta más tarde.");
    }
  } catch (err) {
    console.error("Error registrando cita:", err);
    alert("Ocurrió un error al registrar la cita.");
  }
}

// Inicializar la página
window.onload = () => {
  cargarDisponibilidad();

  document.getElementById("lugar").addEventListener("change", actualizarFechas);
  document.getElementById("fecha").addEventListener("change", actualizarHoras);
  document.getElementById("form-cita").addEventListener("submit", reservarCita);
};
