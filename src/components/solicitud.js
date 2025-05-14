import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";
import "../estilos/obras.css";

const TablaSolicitudes = ({ titulo, solicitudes, trabajadores, zonas, filtro }) => (
  <>
    <h3>{titulo}</h3>
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
        </tr>
      </thead>
      <tbody>
        {solicitudes.filter(filtro).map((solicitud) => (
          <tr key={solicitud.id}>
            <td>{solicitud.id}</td>
            <td>{trabajadores.find(t => t.id === solicitud.trabajador_id)?.nombre || "Desconocido"}</td>
            <td>{solicitud.cantidad}</td>
            <td>{zonas.find(z => z.id === solicitud.id_zona)?.nombre || "Desconocida"}</td>
            <td>{solicitud.nombre}</td>
            <td>{solicitud.estado}</td>
            <td>{new Date(solicitud.fecha_solicitud).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);

const SolicitudMaterial = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [idMaterial, setIdMaterial] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [nombre, setNombre] = useState("");
  const [idZona, setIdZona] = useState("");
  const [unidadesMedida, setUnidadesMedida] = useState([]);
  const [unidadMedida, setUnidadMedida] = useState("");

  console.log("Solcitudes", solicitudes);

  const rol_id = localStorage.getItem("rol_id");
  const user_id = localStorage.getItem("id");

  useEffect(() => {
    obtenerSolicitudes();
    obtenerZonas();
    obtenerTrabajadores();
    obtenerMateriales();
    obtenerUnidadesMedida();
  }, []);

  const obtenerUnidadesMedida = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/materiales/unidadesmedida");
      const data = await res.json();
      console.log("Unidades de medida:", data.unidades);
      setUnidadesMedida(data.unidades);
    } catch (error) {
      console.error("Error al obtener unidades de medida:", error);
    }
  };
  // Obtener solicitudes
  const obtenerSolicitudes = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes");
      const data = await res.json();
      console.log("Solicitudes obtenidas:", data);
      setSolicitudes(data);
    } catch (error) {
      console.error("Error al obtener solicitudes", error);
    }
  };

  // Obtener zonas
  const obtenerZonas = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/zonas/mostrarzonas");
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

  // Obtener materiales existentes
  const obtenerMateriales = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/materiales/mostrarmateriales");
      const data = await res.json();
      setMateriales(data);
    } catch (error) {
      console.error("Error al obtener materiales:", error);
    }
  };

  // Crear solicitud de material existente
  const crearSolicitudMaterialExistente = async (e) => {
    e.preventDefault();

    if (!idMaterial || !cantidad) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const nuevaSolicitud = {
      trabajador_id: user_id, // Añadir el user_id desde localStorage
      cantidad,
      id_material: idMaterial,
    };

    try {
      console.log("Solicitud de material existente:", nuevaSolicitud);
      const res = await fetch("http://localhost:5000/api/solicitudes/solicitar-material-existente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSolicitud),
      });

      if (res.ok) {
        alert("Solicitud creada exitosamente");
        setCantidad("");
        setIdMaterial("");
        obtenerSolicitudes();
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al crear la solicitud de material existente:", error);
    }
  };

  // Crear solicitud de nuevo material
  const crearSolicitudNuevoMaterial = async (e) => {
    e.preventDefault();

    if (!nombre || !cantidad || !idZona || !unidadMedida) {
      alert("Todos los campos son obligatorios");
      return;
    }

    const nuevaSolicitud = {
      trabajador_id: user_id, // Añadir el user_id desde localStorage
      rol_id, // Añadir el rol_id desde localStorage
      cantidad,
      nombre,
      id_zona: idZona,
      unidad_medida: unidadMedida,
    };

    try {
      const res = await fetch("http://localhost:5000/api/solicitudes/solicitar-nuevo-material", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaSolicitud),
      });

      if (res.ok) {
        alert("Solicitud de nuevo material creada exitosamente");
        setNombre("");
        setCantidad("");
        setIdZona("");
        obtenerSolicitudes();
        setUnidadMedida("");
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error al crear la solicitud de nuevo material:", error);
    }
  };

  return (
    <MenuLateral>
      <div className="contenedor-formulario">
        <h2>Solicitudes de Material</h2>

        {/* Formulario para solicitar materiales existentes (rol_id = 4) */}
        {rol_id === "4" && (
          <form className="formulario-horizontal" onSubmit={crearSolicitudMaterialExistente}>
            <div className="fila">
              <div className="campo">
                <label>Material:</label>
                <select value={idMaterial} onChange={(e) => setIdMaterial(e.target.value)}>
                  <option value="">Seleccione un material</option>
                  {materiales.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.nombre} ({material.unidad_medida})
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
                  required
                />
              </div>
            </div>
            <div className="boton-container">
              <button type="submit" className="btn-crear">Solicitar Material</button>
            </div>
          </form>
        )}

        {/* Formulario para solicitar nuevo material (rol_id = 3) */}
        {rol_id === "3" && (
          <form className="formulario-horizontal" onSubmit={crearSolicitudNuevoMaterial}>
            <div className="fila">
              <div className="campo">
                <label>Nombre del Material:</label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label>Cantidad:</label>
                <input
                  type="number"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  required
                />
              </div>
              <div className="campo">
                <label>Unidad de Medida:</label>
                <select
                  value={unidadMedida}
                  onChange={(e) => setUnidadMedida(e.target.value)}
                  required
                >
                  <option value="">Seleccione una unidad</option>
                  {unidadesMedida.map((unidad, index) => (
                    <option key={index} value={unidad}>
                      {unidad}
                    </option>
                  ))}
                </select>
              </div>
              <div className="campo">
                <label>Zona:</label>
                <select value={idZona} onChange={(e) => setIdZona(e.target.value)} required>
                  <option value="">Seleccione una zona</option>
                  {zonas.map((zona) => (
                    <option key={zona.id} value={zona.id}>{zona.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="boton-container">
              <button type="submit" className="btn-crear">Solicitar Nuevo Material</button>
            </div>
          </form>
        )}

        {/* Renderizar solicitudes por tipo */}
        {rol_id === "2" && (
          <>
            <TablaSolicitudes
              titulo="Solicitudes de Materiales Existentes"
              solicitudes={solicitudes}
              trabajadores={trabajadores}
              zonas={zonas}
              filtro={(s) => s.estado === "Pendiente"}
            />

            <TablaSolicitudes
              titulo="Solicitudes de Nuevos Materiales"
              solicitudes={solicitudes}
              trabajadores={trabajadores}
              zonas={zonas}
              filtro={(s) => s.estado === "Pendiente"}
            />

            <TablaSolicitudes
              titulo="Solicitudes Aprobadas Parcialmente"
              solicitudes={solicitudes}
              trabajadores={trabajadores}
              zonas={zonas}
              filtro={(s) => s.estado === "Aprobado Parcialmente"}
            />
          </>
        )}
      </div>
    </MenuLateral>
  );
};

export default SolicitudMaterial;
