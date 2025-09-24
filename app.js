// REEMPLAZA por la URL de tu WebApp de Apps Script cuando la tengas
const WEBAPP_URL = "REPLACE_WITH_YOUR_WEBAPP_URL";

async function api(action, body = {}) {
  const payload = Object.assign({ action }, body);
  const res = await fetch(WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return res.json();
}

async function init() {
  try {
    const raw = await api("getAvailability"); // espera: array de rows [Lugar, Fecha, Hora]
    const rawCitas = await api("getCitas");   // array con filas de la hoja Citas

    window._availability = raw || [];
    window._citas = rawCitas || [];

    const lugares = [...new Set(window._availability.map(r => r[0]))];
    const selLugar = document.getElementById("lugar");
    selLugar.innerHTML = "<option value=''>-- Selecciona lugar --</option>" + lugares.map(l => `<option value="${l}">${l}</option>`).join("");

    selLugar.addEventListener("change", onLugarChange);
    document.getElementById("btnReservar").addEventListener("click", reservar);
  } catch (err) {
    showMessage("Error al cargar disponibilidad: " + err.message, false);
  }
}

function onLugarChange(e) {
  const lugar = e.target.value;
  const fechas = [...new Set(window._availability.filter(r => r[0] === lugar).map(r => r[1]))];
  const selFecha = document.getElementById("fecha");
  selFecha.disabled = false;
  selFecha.innerHTML = "<option value=''>-- Selecciona fecha --</option>" + fechas.map(f => `<option value="${f}">${f}</option>`).join("");
  selFecha.onchange = () => onFechaChange(lugar, selFecha.value);
  // reset hora
  document.getElementById("hora").innerHTML = "<option>Seleccione fecha</option>";
  document.getElementById("hora").disabled = true;
}

function onFechaChange(lugar, fecha) {
  const horas = window._availability.filter(r => r[0] === lugar && r[1] === fecha).map(r => r[2]);
  // filtrar horas ocupadas
  const ocupadas = window._citas.filter(c => c[4] === lugar && c[5] === fecha).map(c => c[6]);
  const libres = horas.filter(h => !ocupadas.includes(h));
  const selHora = document.getElementById("hora");
  selHora.disabled = false;
  selHora.innerHTML = "<option value=''>-- Selecciona hora --</option>" + libres.map(h => `<option value="${h}">${h}</option>`).join("");
}

function showMessage(msg, ok = true) {
  const el = document.getElementById("mensaje");
  el.textContent = msg;
  el.style.color = ok ? "green" : "crimson";
}

async function reservar() {
  const lugar = document.getElementById("lugar").value;
  const fecha = document.getElementById("fecha").value;
  const hora  = document.getElementById("hora").value;
  const nombre = document.getElementById("nombre").value.trim();
  const cedula = document.getElementById("cedula").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  if (!lugar || !fecha || !hora || !nombre || !cedula || !telefono) {
    showMessage("Completa todos los campos.", false); return;
  }

  const res = await api("bookAppointment", { name: nombre, cedula, phone: telefono, lugar, fecha, hora });
  if (res && (res.status === "success" || res.success)) {
    showMessage(res.message || "Cita reservada ✅", true);
    // recargar disponibilidad y citas para reflejar cambio
    const raw = await api("getAvailability");
    const rawCitas = await api("getCitas");
    window._availability = raw || [];
    window._citas = rawCitas || [];
    // limpiar inputs
    document.getElementById("nombre").value = "";
    document.getElementById("cedula").value = "";
    document.getElementById("telefono").value = "";
    document.getElementById("lugar").value = "";
    document.getElementById("fecha").innerHTML = "<option>Seleccione lugar</option>";
    document.getElementById("hora").innerHTML = "<option>Seleccione fecha</option>";
    document.getElementById("fecha").disabled = true;
    document.getElementById("hora").disabled = true;
  } else {
    showMessage(res.message || "Error al reservar", false);
  }
}

// arrancar
window.addEventListener("load", init);
