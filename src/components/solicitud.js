import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";
import "../estilos/obras.css";

// Componente para mostrar cada lista de solicitudes
const ListaSolicitudes = ({ solicitudes, esNuevo, acciones, materiales, unidades }) => (
  <div>
    <h3>{esNuevo ? "Solicitudes de Materiales Nuevos" : "Solicitudes de Materiales Existentes"}</h3>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Trabajador</th>
          <th>Cantidad</th>
          <th>Zona</th>
          <th>{esNuevo ? "Nombre del Material" : "Material"}</th>
          <th>Unidad De Medida</th>
          <th>Fecha</th>
          <th>Estado</th>
          {acciones && <th>Acciones</th>}
        </tr>
      </thead>
      <tbody>
        {solicitudes.map((s) => {
          // Buscar nombre del material y unidad si es existente
          const material = materiales?.find(m => m.id === s.id_material);
          const unidad = unidades?.find(u => u.id === (material ? material.id_unidad : s.id_unidad));
          return (
            <tr key={s.id_solicitud}>
              <td>{s.id_solicitud}</td>
              <td>{s.trabajador_nombre || s.id_usuario}</td>
              <td>{s.cantidad}</td>
              <td>{s.zona_nombre || s.id_zona}</td>
              <td>
                {esNuevo
                  ? s.nombre_material
                  : material ? material.nombre : s.id_material}
              </td>
              <td>
                {esNuevo
                  ? (unidades?.find(u => u.id === s.id_unidad)?.nombre || s.id_unidad)
                  : unidad ? unidad.nombre : (material ? material.id_unidad : s.id_unidad)}
              </td>
              <td>{new Date(s.fecha_solicitud).toLocaleString()}</td>
              <td>
                {s.id_estado === 1
                  ? "Pendiente"
                  : s.id_estado === 2
                  ? "Asignada"
                  : s.id_estado === 3
                  ? "Rechazada"
                  : s.id_estado}
              </td>
              {acciones && s.id_estado === 1 && (
                <td>
                  <button onClick={() => acciones.onAsignar(s.id_solicitud)}>Asignar</button>
                  <button onClick={() => acciones.onRechazar(s.id_solicitud)} style={{marginLeft: 8}}>Rechazar</button>
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

// Modal genérico reutilizable
const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>X</button>
        {children}
      </div>
    </div>
  );
};

const SolicitudMaterial = () => {
  // Estados generales
  const [solicitudes, setSolicitudes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalExistente, setModalExistente] = useState(false);
  const [modalNuevo, setModalNuevo] = useState(false);

  // Estados para órdenes de compra
  const [modalOrdenes, setModalOrdenes] = useState(false);
  const [ordenes, setOrdenes] = useState([]);

  // Estados para formularios
  const [idMaterial, setIdMaterial] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [idZona, setIdZona] = useState("");
  const [nombreMaterial, setNombreMaterial] = useState("");
  const [idUnidad, setIdUnidad] = useState("");

  // Estado para mensajes de error
  const [errorMensaje, setErrorMensaje] = useState("");

  // Datos de usuario
  const rol_id = localStorage.getItem("rol_id");
  const user_id = localStorage.getItem("id");
  const user_zona_id = localStorage.getItem("id_zona");

  // Cargar datos iniciales
  useEffect(() => {
    fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes")
      .then(res => res.json())
      .then(setSolicitudes);
    fetch("http://localhost:5000/api/materiales/listarmateriales")
      .then(res => res.json())
      .then(setMateriales);
    fetch("http://localhost:5000/api/zonas/mostrarzonas")
      .then(res => res.json())
      .then(setZonas);
    fetch("http://localhost:5000/api/unidades_medida/listarunidadesmedida")
      .then(res => res.json())
      .then(setUnidades);
    fetchOrdenes();
  }, []);

  // Filtrar zonas según rol
  const zonasFiltradas = rol_id === "4"
    ? zonas.filter(z => z.id === Number(user_zona_id))
    : zonas;

  // Acciones de solicitudes
  const asignarSolicitud = async (id) => {
    setErrorMensaje(""); // Limpia el error anterior
    const res = await fetch(`http://localhost:5000/api/solicitudes/asignarsolicitud/${id}`, { method: "PUT" });
    if (res.ok) {
      fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes")
        .then(res => res.json())
        .then(setSolicitudes);
    } else {
      const data = await res.json();
      setErrorMensaje(data.error || "Error al asignar la solicitud");
    }
  };
  const rechazarSolicitud = async (id) => {
    await fetch(`http://localhost:5000/api/solicitudes/rechazarsolicitud/${id}`, { method: "PUT" });
    fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes")
      .then(res => res.json())
      .then(setSolicitudes);
  };

  // Crear solicitud material existente
  const solicitarExistente = async (e) => {
    e.preventDefault();
    setErrorMensaje(""); // Reiniciar mensaje de error
    // Validar campos requeridos
    if (!cantidad || !idZona || !idMaterial) {
      setErrorMensaje("Por favor, complete todos los campos requeridos.");
      return;
    }
    // Validar cantidad positiva
    if (cantidad <= 0) {
      setErrorMensaje("La cantidad debe ser mayor a cero.");
      return;
    }
    await fetch("http://localhost:5000/api/solicitudes/crearsolicitud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cantidad: Number(cantidad),
        id_usuario: Number(user_id),
        id_zona: Number(idZona),
        id_material: Number(idMaterial),
        id_estado: 1,
        es_nuevo: false
      })
    });
    setModalExistente(false);
    setCantidad("");
    setIdMaterial("");
    setIdZona("");
    fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes")
      .then(res => res.json())
      .then(setSolicitudes);
  };

  // Crear solicitud material nuevo (NO crear material desde el front)
  const solicitarNuevo = async (e) => {
    e.preventDefault();
    setErrorMensaje(""); // Reiniciar mensaje de error
    // Validar campos requeridos
    if (!cantidad || !idZona || !nombreMaterial || !idUnidad) {
      setErrorMensaje("Por favor, complete todos los campos requeridos.");
      return;
    }
    // Validar cantidad positiva
    if (cantidad <= 0) {
      setErrorMensaje("La cantidad debe ser mayor a cero.");
      return;
    }
    await fetch("http://localhost:5000/api/solicitudes/crearsolicitud", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cantidad: Number(cantidad),
        id_usuario: Number(user_id),
        id_zona: Number(idZona),
        id_estado: 1,
        es_nuevo: true,
        nombre_material: nombreMaterial,
        id_unidad: idUnidad
      })
    });
    setModalNuevo(false);
    setNombreMaterial("");
    setCantidad("");
    setIdZona("");
    setIdUnidad("");
    fetch("http://localhost:5000/api/solicitudes/mostrarsolicitudes")
      .then(res => res.json())
      .then(setSolicitudes);
  };

  // Listas filtradas según rol
  let solicitudesExistentes = [];
  let solicitudesNuevas = [];

  if (rol_id === "2") {
    solicitudesExistentes = solicitudes.filter(s => !s.es_nuevo);
    solicitudesNuevas = solicitudes.filter(s => s.es_nuevo);
  } else if (rol_id === "3" || rol_id === "4") {
    solicitudesExistentes = solicitudes.filter(
      s => !s.es_nuevo && String(s.id_usuario) === String(user_id)
    );
    solicitudesNuevas = solicitudes.filter(
      s => s.es_nuevo && String(s.id_usuario) === String(user_id)
    );
  }

  // --- ORDENES DE COMPRA ---
  const fetchOrdenes = () => {
    fetch("http://localhost:5000/api/orden_compra/listarordenes")
      .then(res => res.json())
      .then(setOrdenes);
  };

  const entregarOrden = async (id_orden, cantidad) => {
    await fetch(`http://localhost:5000/api/orden_compra/entregarorden/${id_orden}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cantidad: Number(cantidad) })
    });
    fetchOrdenes();
  };

  const rechazarOrden = async (id_orden) => {
    await fetch(`http://localhost:5000/api/orden_compra/rechazarorden/${id_orden}`, {
      method: "PUT"
    });
    fetchOrdenes();
  };

  // Helper para mostrar nombre del material en la tabla de órdenes
  const getMaterialNombre = (id_material) => {
    const mat = materiales.find(m => m.id === id_material);
    return mat ? mat.nombre : id_material ?? "N/A";
  };

  // Acciones solo para rol 2
  const accionesRol2 = rol_id === "2"
    ? { onAsignar: asignarSolicitud, onRechazar: rechazarSolicitud }
    : null;

  return (
    <MenuLateral>
      <div className="contenedor-formulario">
        <h2>Solicitudes de Material</h2>
        {errorMensaje && (
          <div style={{
            background: "#ffdddd",
            color: "#a94442",
            border: "1px solid #a94442",
            padding: "8px 16px",
            borderRadius: 4,
            marginBottom: 16,
            textAlign: "center"
          }}>
            {errorMensaje}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => setModalExistente(true)}>Solicitar material</button>
          {(rol_id === "2" || rol_id === "3") && (
            <button style={{ marginLeft: 8 }} onClick={() => setModalNuevo(true)}>
              Solicitar nuevo material
            </button>
          )}
          {rol_id === "2" && (
            <button style={{ marginLeft: 8 }} onClick={() => { fetchOrdenes(); setModalOrdenes(true); }}>
              Ver órdenes de compra
            </button>
          )}
        </div>

        {/* Lista de materiales existentes */}
        <ListaSolicitudes
          solicitudes={solicitudesExistentes}
          esNuevo={false}
          acciones={accionesRol2}
          materiales={materiales}
          unidades={unidades}
        />

        {/* Lista de materiales nuevos */}
        {rol_id !== "4" && (
          <ListaSolicitudes
            solicitudes={solicitudesNuevas}
            esNuevo={true}
            acciones={accionesRol2}
            materiales={materiales}
            unidades={unidades}
          />
        )}

        {/* Modal para solicitar material existente */}
        <Modal open={modalExistente} onClose={() => setModalExistente(false)}>
          <form onSubmit={solicitarExistente}>
            <h3>Solicitar Material Existente</h3>
            <div>
              <label>Material:</label>
              <select value={idMaterial} onChange={e => setIdMaterial(e.target.value)} required>
                <option value="">Seleccione un material</option>
                {materiales.map(m => (
                  <option key={m.id} value={m.id}>{m.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Zona:</label>
              <select value={idZona} onChange={e => setIdZona(e.target.value)} required>
                <option value="">Seleccione una zona</option>
                {zonasFiltradas.map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Cantidad:</label>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />
            </div>
            <button type="submit">Solicitar</button>
            {(rol_id === "2" || rol_id === "3") && (
              <button type="button" style={{ marginLeft: 8 }} onClick={() => { setModalNuevo(true); }}>
                Solicitar nuevo material
              </button>
            )}
            {errorMensaje && <div className="error-mensaje">{errorMensaje}</div>}
          </form>
        </Modal>

        {/* Modal para solicitar nuevo material */}
        <Modal open={modalNuevo} onClose={() => setModalNuevo(false)}>
          <form onSubmit={solicitarNuevo}>
            <h3>Solicitar Nuevo Material</h3>
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={nombreMaterial}
                onChange={e => setNombreMaterial(e.target.value)}
                required
              />
            </div>
            <div>
              <label>Unidad de medida:</label>
              <select value={idUnidad} onChange={e => setIdUnidad(e.target.value)} required>
                <option value="">Seleccione una unidad</option>
                {unidades.map(u => (
                  <option key={u.id} value={u.id}>{u.nombre} ({u.abreviatura})</option>
                ))}
              </select>
            </div>
            <div>
              <label>Zona:</label>
              <select value={idZona} onChange={e => setIdZona(e.target.value)} required>
                <option value="">Seleccione una zona</option>
                {zonas.map(z => (
                  <option key={z.id} value={z.id}>{z.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Cantidad:</label>
              <input
                type="number"
                min={1}
                value={cantidad}
                onChange={e => setCantidad(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />
            </div>
            <button type="submit">Solicitar</button>
            {errorMensaje && <div className="error-mensaje">{errorMensaje}</div>}
          </form>
        </Modal>

        {/* Modal para mostrar órdenes de compra */}
        <Modal open={modalOrdenes} onClose={() => setModalOrdenes(false)}>
          <h3>Órdenes de Compra</h3>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Material</th>
                <th>Cantidad</th>
                <th>¿Material Nuevo?</th>
                <th>Estado</th>
                <th>Solicitante</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.map((o, idx) => (
                <tr key={o.id_orden}>
                  <td>{o.id_orden}</td>
                  <td>{new Date(o.fecha).toLocaleString()}</td>
                  <td>{getMaterialNombre(o.id_material)}</td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      defaultValue={o.cantidad}
                      style={{ width: 70 }}
                      onChange={e => ordenes[idx].cantidad = e.target.value}
                      disabled={o.id_estado !== 1}
                    />
                  </td>
                  <td>{o.es_material_nuevo ? "Sí" : "No"}</td>
                  <td>
                    {o.id_estado === 1
                      ? "Pendiente"
                      : o.id_estado === 2
                      ? "Entregado"
                      : o.id_estado === 3
                      ? "Rechazado"
                      : o.id_estado}
                  </td>
                  <td>{o.usuario_solicitante}</td>
                  <td>
                    {o.id_estado === 1 && (
                      <>
                        <button
                          onClick={() => entregarOrden(o.id_orden, o.cantidad)}
                          style={{ marginRight: 8 }}
                        >
                          Entregado
                        </button>
                        <button
                          onClick={() => rechazarOrden(o.id_orden)}
                          style={{ color: "red" }}
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Modal>
      </div>
    </MenuLateral>
  );
};

export default SolicitudMaterial;
