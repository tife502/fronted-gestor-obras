import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";

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

const Bodega = () => {
  const [materiales, setMateriales] = useState([]);
  const [busquedaId, setBusquedaId] = useState("");
  const [resultadoBusqueda, setResultadoBusqueda] = useState(null);
  const [modalOrden, setModalOrden] = useState(false);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(null);
  const [cantidadOrden, setCantidadOrden] = useState("");
  const rol_id = localStorage.getItem("rol_id");
  const user_id = localStorage.getItem("id");

  useEffect(() => {
    fetch("http://localhost:5000/api/bodega/listar")
      .then(res => res.json())
      .then(setMateriales);
  }, []);

  const buscarPorId = async (e) => {
    e.preventDefault();
    if (!busquedaId) {
      setResultadoBusqueda(null);
      return;
    }
    const res = await fetch(`http://localhost:5000/api/bodega/obtener/${busquedaId}`);
    if (res.ok) {
      const data = await res.json();
      setResultadoBusqueda(data);
    } else {
      setResultadoBusqueda({ error: "No encontrado" });
    }
  };

  const abrirModalOrden = (material) => {
    setMaterialSeleccionado(material);
    setCantidadOrden("");
    setModalOrden(true);
  };

  const cerrarModalOrden = () => {
    setModalOrden(false);
    setMaterialSeleccionado(null);
    setCantidadOrden("");
  };

  const generarOrden = async (e) => {
    e.preventDefault();
    if (!cantidadOrden || isNaN(Number(cantidadOrden)) || Number(cantidadOrden) < 1) {
      alert("Ingrese una cantidad válida.");
      return;
    }
    await fetch("http://localhost:5000/api/orden_compra/crearorden", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_material: materialSeleccionado.id_material,
        cantidad: Number(cantidadOrden),
        usuario_solicitante: user_id
      })
    });
    cerrarModalOrden();
    fetch("http://localhost:5000/api/bodega/listar")
      .then(res => res.json())
      .then(setMateriales);
    alert("Orden de compra generada.");
  };

  return (
    <MenuLateral>
      <div>
        <h2>Materiales en Bodega</h2>
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

        {resultadoBusqueda ? (
          resultadoBusqueda.error ? (
            <div style={{ color: "red" }}>No encontrado</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Cantidad</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  style={resultadoBusqueda.cantidad < 20 ? { backgroundColor: "#ffcccc", cursor: rol_id === "2" ? "pointer" : "default" } : {}}
                  onClick={() => rol_id === "2" && resultadoBusqueda.cantidad < 20 ? abrirModalOrden(resultadoBusqueda) : undefined}
                  title={rol_id === "2" && resultadoBusqueda.cantidad < 20 ? "Generar orden de compra" : ""}
                >
                  <td>{resultadoBusqueda.nombre_material || resultadoBusqueda.id_material}</td>
                  <td>{resultadoBusqueda.cantidad}</td>
                </tr>
              </tbody>
            </table>
          )
        ) : (
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {materiales.map(m => (
                <tr
                  key={m.id_material}
                  style={m.cantidad < 20 ? { backgroundColor: "#ffcccc", cursor: rol_id === "2" ? "pointer" : "default" } : {}}
                  onClick={() => rol_id === "2" && m.cantidad < 20 ? abrirModalOrden(m) : undefined}
                  title={rol_id === "2" && m.cantidad < 20 ? "Generar orden de compra" : ""}
                >
                  <td>{m.nombre_material || m.id_material}</td>
                  <td>{m.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Modal para generar orden de compra */}
        <Modal open={modalOrden} onClose={cerrarModalOrden}>
          <form onSubmit={generarOrden}>
            <h3>Generar Orden de Compra</h3>
            <div>
              <label>Material:</label>
              <input type="text" value={materialSeleccionado?.nombre_material || materialSeleccionado?.id_material || ""} disabled />
            </div>
            <div>
              <label>Cantidad:</label>
              <input
                type="number"
                min={1}
                value={cantidadOrden}
                onChange={e => setCantidadOrden(e.target.value.replace(/[^0-9]/g, ""))}
                required
              />
            </div>
            <button type="submit">Generar orden</button>
            <button type="button" style={{ marginLeft: 8 }} onClick={cerrarModalOrden}>Cancelar</button>
          </form>
        </Modal>
      </div>
    </MenuLateral>
  );
};

export default Bodega;