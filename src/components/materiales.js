import React, { useState, useEffect } from "react";
import MenuLateral from "./menulateral";

const API_URL = "http://localhost:5000/api/materiales";
const API_UNIDADES = "http://localhost:5000/api/unidades_medida/listarunidadesmedida";

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

const Materiales = () => {
  const [materiales, setMateriales] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [nombreMaterial, setNombreMaterial] = useState("");
  const [idUnidad, setIdUnidad] = useState("");
  const [busquedaId, setBusquedaId] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [modoEliminar, setModoEliminar] = useState(false); // Nuevo estado

  const rol_id = localStorage.getItem("rol_id");

  useEffect(() => {
    fetch(`${API_URL}/listarmateriales`)
      .then(res => res.json())
      .then(setMateriales);
    fetch(API_UNIDADES)
      .then(res => res.json())
      .then(setUnidades);
  }, []);

  const recargarMateriales = () => {
    fetch(`${API_URL}/listarmateriales`)
      .then(res => res.json())
      .then(setMateriales);
  };

  // Buscar material por ID
  const buscarPorId = async (e) => {
    e.preventDefault();
    if (!busquedaId) {
      setResultadoBusqueda(null);
      return;
    }
    const res = await fetch(`${API_URL}/obtenermaterial/${busquedaId}`);
    if (res.ok) {
      const data = await res.json();
      setResultadoBusqueda(data);
    } else {
      setResultadoBusqueda({ error: "No encontrado" });
    }
  };

  // Crear material
  const crearMaterial = async (e) => {
    e.preventDefault();
    if (!nombreMaterial || !idUnidad) {
      alert("Debe ingresar nombre y unidad de medida");
      return;
    }
    const res = await fetch(`${API_URL}/crearmaterial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: nombreMaterial,
        id_unidad: idUnidad
      })
    });
    const data = await res.json();
    if (res.ok) {
      setModalNuevo(false);
      setNombreMaterial("");
      setIdUnidad("");
      recargarMateriales();
    } else {
      alert(data.error || "Error al crear material");
    }
  };

  // Eliminar material
  const eliminarMaterial = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este material?")) return;
    const res = await fetch(`${API_URL}/eliminar/${id}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (res.ok) {
      recargarMateriales();
    } else {
      alert(data.error || "Error al eliminar material");
    }
  };

  // Obtener nombre de unidad por id
  const getUnidadNombre = (id) => {
    const unidad = unidades.find(u => u.id === id);
    return unidad ? `${unidad.nombre} (${unidad.abreviatura})` : id;
  };

  return (
    <MenuLateral>
      <div className="contenedor-formulario">
        <h2>Catálogo de Materiales</h2>

        <form onSubmit={buscarPorId} style={{ marginBottom: 16 }}>
          <label>
            Buscar por ID:&nbsp;
            <input
              type="number"
              min={1}
              value={busquedaId}
              onChange={e => setBusquedaId(e.target.value)}
              placeholder="ID de material"
            />
          </label>
          <button type="submit">Buscar</button>
          <button type="button" onClick={() => { setBusquedaId(""); setResultadoBusqueda(null); }} style={{ marginLeft: 8 }}>
            Limpiar
          </button>
        </form>

        {rol_id === "2" && (
          <>
            <button style={{ marginBottom: 16 }} onClick={() => setModalNuevo(true)}>
              Crear nuevo material
            </button>
            <button
              style={{ marginBottom: 16, marginLeft: 8, background: modoEliminar ? "#f88" : undefined }}
              onClick={() => setModoEliminar(m => !m)}
            >
              {modoEliminar ? "Cancelar eliminación" : "Eliminar materiales"}
            </button>
          </>
        )}

        {/* Tabla de materiales */}
        {resultadoBusqueda ? (
          resultadoBusqueda.error ? (
            <div style={{ color: "red" }}>No encontrado</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Unidad de Medida</th>
                  {modoEliminar && <th>Acción</th>}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{resultadoBusqueda.id}</td>
                  <td>{resultadoBusqueda.nombre}</td>
                  <td>{getUnidadNombre(resultadoBusqueda.id_unidad)}</td>
                  {modoEliminar && (
                    <td>
                      <button onClick={() => eliminarMaterial(resultadoBusqueda.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          )
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Unidad de Medida</th>
                {modoEliminar && <th>Acción</th>}
              </tr>
            </thead>
            <tbody>
              {materiales.map(m => (
                <tr key={m.id}>
                  <td>{m.id}</td>
                  <td>{m.nombre}</td>
                  <td>{m.unidad_nombre} {m.unidad_abreviatura && `(${m.unidad_abreviatura})`}</td>
                  {modoEliminar && (
                    <td>
                      <button onClick={() => eliminarMaterial(m.id)}>Eliminar</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal para crear nuevo material */}
        <Modal open={modalNuevo} onClose={() => setModalNuevo(false)}>
          <form onSubmit={crearMaterial}>
            <h3>Crear Nuevo Material</h3>
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
            <button type="submit">Crear</button>
          </form>
        </Modal>
      </div>
    </MenuLateral>
  );
};

export default Materiales;



