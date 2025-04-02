import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";
import "../estilos/obras.css";

const API_URL = "http://localhost:5000/api/solicitudes";

const SolicitudMaterial = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [trabajadorId, setTrabajadorId] = useState("");
  const [trabajadores, setTrabajadores] = useState([]);
  const [cantidad, setCantidad] = useState("");
  const [zonas, setZonas] = useState([]);
  const [idZona, setIdZona] = useState("");
  const [nombre, setNombre] = useState(""); // Nuevo campo para el nombre del material
  const [estadoEditando, setEstadoEditando] = useState(null); // Estado para editar solicitudes

  useEffect(() => {
    obtenerSolicitudes();
    obtenerZonas();
    obtenerTrabajadores();
  }, []);

  // Obtener solicitudes
  const obtenerSolicitudes = async () => {
    try {
      const res = await fetch(`${API_URL}/mostrarsolicitudes`);
      const data = await res.json();
      setSolicitudes(data);
    } catch (error) {
      console.error("Error al obtener solicitudes", error);
    }
  };

  // Obtener zonas
  const obtenerZonas = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/api/zonas/mostrarzonas");
      const data = await res.json();
      setZonas(data);
    } catch (error) {
      console.error("Error al obtener zonas:", error);
    }
  };

  // Obtener trabajadores
  const obtenerTrabajadores = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/usuarios/mostrarusuarios");
      const data = await res.json();
      setTrabajadores(data);
    } catch (error) {
      console.error("Error al obtener trabajadores:", error);
    }
  };

  // Crear solicitud
  const crearSolicitud = async (e) => {
    e.preventDefault();

    if (!trabajadorId || !cantidad || !idZona || !nombre) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const nuevaSolicitud = {
      trabajador_id: trabajadorId,
      cantidad,
      id_zona: idZona,
      nombre, // Nuevo campo
    };

    try {
      const res = await fetch(`${API_URL}/crearsolicitud`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSolicitud),
      });

      if (res.ok) {
        alert("Solicitud creada exitosamente");
        setTrabajadorId("");
        setCantidad("");
        setIdZona("");
        setNombre(""); // Limpiar el campo nombre
        obtenerSolicitudes();
      }
    } catch (error) {
      console.error("Error al crear la solicitud", error);
    }
  };

  // Modificar estado de la solicitud
  const modificarEstado = async (solicitudId, nuevoEstado) => {
    try {
      const res = await fetch(`${API_URL}/modificarsolicitud/${solicitudId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (res.ok) {
        alert("Estado de la solicitud actualizado exitosamente");
        obtenerSolicitudes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al modificar el estado de la solicitud", error);
    }
  };

  // Aprobar solicitud
  const aprobarSolicitud = async (solicitudId) => {
    try {
      const res = await fetch(`${API_URL}/aprobar-solicitud/${solicitudId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: "Aprobado" }),
      });

      if (res.ok) {
        alert("Solicitud aprobada y material creado exitosamente");
        obtenerSolicitudes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al aprobar la solicitud", error);
    }
  };

  return (
    <MenuLateral>
      <div className="contenedor-formulario">
        <h2>Solicitudes de Material</h2>

        {/* Formulario para crear solicitud */}
        <form className="formulario-horizontal" onSubmit={crearSolicitud}>
          <div className="fila">
            <div className="campo">
              <label>Trabajador:</label>
              <select value={trabajadorId} onChange={(e) => setTrabajadorId(e.target.value)}>
                <option value="">Seleccione un trabajador</option>
                {trabajadores.map((trabajador) => (
                  <option key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre} {trabajador.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Cantidad:</label>
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Zona:</label>
              <select value={idZona} onChange={(e) => setIdZona(e.target.value)}>
                <option value="">Seleccione una zona</option>
                {zonas.map((zona) => (
                  <option key={zona.id} value={zona.id}>{zona.nombre}</option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Nombre del Material:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          </div>

          <div className="boton-container">
            <button type="submit" className="btn-crear">Crear Solicitud</button>
          </div>
        </form>

        {/* Lista de solicitudes */}
        <div className="table">
          <h3>Lista de Solicitudes</h3>
          <div className="table__body">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Trabajador</th>
                  <th>Cantidad</th>
                  <th>Zona</th>
                  <th>Nombre del Material</th>
                  <th>Estado</th>
                  <th>Fecha Solicitud</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {solicitudes.map((solicitud) => (
                  <tr key={solicitud.id}>
                    <td>{solicitud.id}</td>
                    <td>
                      {trabajadores.find(t => t.id === solicitud.trabajador_id)?.nombre || "Desconocido"} 
                      {trabajadores.find(t => t.id === solicitud.trabajador_id)?.apellido || ""}
                    </td>
                    <td>{solicitud.cantidad}</td>
                    <td>{zonas.find(z => z.id === solicitud.id_zona)?.nombre || "Desconocida"}</td>
                    <td>{solicitud.nombre}</td>
                    <td>{solicitud.estado}</td>
                    <td>{new Date(solicitud.fecha_solicitud).toLocaleString()}</td>
                    <td>
                      <button onClick={() => modificarEstado(solicitud.id, "Aprobado")}>Aprobar</button>
                      <button onClick={() => modificarEstado(solicitud.id, "Rechazado")}>Rechazar</button>
                      {solicitud.estado === "Aprobado" && (
                        <button onClick={() => aprobarSolicitud(solicitud.id)}>Crear Material</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MenuLateral>
  );
};

export default SolicitudMaterial;