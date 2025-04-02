import React, { useState, useEffect } from "react";
import MenuLateral from "./menulateral";

function Asistencia() {
  const [trabajadorId, setTrabajadorId] = useState("");
  const [asistencias, setAsistencias] = useState([]);
  const [ubicacion, setUbicacion] = useState({ latitud: null, longitud: null });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion({ latitud: pos.coords.latitude, longitud: pos.coords.longitude }),
      (err) => console.error("Error obteniendo ubicación:", err)
    );
  }, []);

  const handleCheckIn = async () => {
    if (!trabajadorId || !ubicacion.latitud) {
      alert("Falta el ID del trabajador o la ubicación.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/asistencia/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: trabajadorId, ...ubicacion }),
      });
      const data = await res.json();
      res.ok ? alert(data.mensaje) : alert(data.error);
      obtenerAsistencias();
    } catch (error) {
      alert("Error en el check-in.");
    }
  };

  const handleCheckOut = async () => {
    if (!trabajadorId || !ubicacion.latitud) {
      alert("Falta el ID del trabajador o la ubicación.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/asistencia/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trabajador_id: trabajadorId, ...ubicacion }),
      });
      const data = await res.json();
      res.ok ? alert(data.mensaje) : alert(data.error);
      obtenerAsistencias();
    } catch (error) {
      alert("Error en el check-out.");
    }
  };

  const obtenerAsistencias = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/asistencia/todas");
      const data = await res.json();
      setAsistencias(data);
    } catch (error) {
      alert("Error obteniendo asistencias.");
    }
  };

  return (
    <div>
      <MenuLateral>
      <h2>Registro de Asistencia</h2>
      <label>
        ID del Trabajador:
        <input type="text" value={trabajadorId} onChange={(e) => setTrabajadorId(e.target.value)} />
      </label>
      <button onClick={handleCheckIn}>Check-in</button>
      <button onClick={handleCheckOut}>Check-out</button>
      <button onClick={obtenerAsistencias}>Mostrar Asistencias</button>

      <h3>Asistencias Registradas</h3>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Trabajador</th>
            <th>Check-in</th>
            <th>Check-out</th>
          </tr>
        </thead>
        <tbody>
          {asistencias.map((asistencia) => (
            <tr key={asistencia.id}>
              <td>{asistencia.id}</td>
              <td>{asistencia.trabajador_id}</td>
              <td>{asistencia.check_in || "Pendiente"}</td>
              <td>{asistencia.check_out || "Pendiente"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </MenuLateral>
    </div>
  );
}

export default Asistencia;
