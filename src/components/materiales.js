import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuLateral from "./menulateral";

const Materiales = () => {
  const [materiales, setMateriales] = useState([]);
  const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: "", cantidad_disponible: 0 });
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editMaterialData, setEditMaterialData] = useState({});
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [nuevaSolicitud, setNuevaSolicitud] = useState({
    trabajador: "",
    material: "",
    cantidad: 0,
  });

  useEffect(() => {
    obtenerMateriales();
    obtenerSolicitudes();
    obtenerTrabajadores();
  }, []);

  const obtenerMateriales = () => {
    axios.get("http://127.0.0.1:5000/api/materiales/materiales")
      .then(response => setMateriales(response.data))
      .catch(error => console.error("Error al obtener materiales:", error));
  };

  const handleChange = (e) => {
    setNuevoMaterial({ ...nuevoMaterial, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e, id) => {
    setEditMaterialData({ ...editMaterialData, [id]: { ...editMaterialData[id], [e.target.name]: e.target.value } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post("http://127.0.0.1:5000/api/materiales/materiales", nuevoMaterial)
      .then(() => {
        obtenerMateriales();
        setNuevoMaterial({ nombre: "", cantidad_disponible: 0 });
      })
      .catch(error => console.error("Error al agregar material:", error));
  };

  const handleEditSubmit = (id) => {
    axios.put(`http://127.0.0.1:5000/api/materiales/materiales/${id}`, editMaterialData[id])
      .then(() => {
        obtenerMateriales();
        setEditMaterialId(null);
      })
      .catch(error => console.error("Error al actualizar material:", error));
  };

  const handleDelete = (id) => {
    axios.delete(`http://127.0.0.1:5000/api/materiales/materiales/${id}`)
      .then(() => {
        obtenerMateriales();
      })
      .catch(error => console.error("Error al eliminar material:", error));
  };


  const obtenerTrabajadores = () => {
    axios.get("http://127.0.0.1:5000/api/materiales/trabajadores")
      .then(response => setTrabajadores(response.data))
      .catch(error => console.error("Error al obtener trabajadores:", error));
  };

  const handleChangeS = (e) => {
    setNuevaSolicitud({ ...nuevaSolicitud, [e.target.name]: e.target.value });
  };

  const handleSubmitS = (e) => {
    e.preventDefault();
    const materialSeleccionado = materiales.find(m => m.nombre === nuevaSolicitud.material);

    if (!materialSeleccionado || nuevaSolicitud.cantidad > materialSeleccionado.cantidad_disponible) {
      alert("No hay suficiente material disponible");
      return;
    }

    axios.post("http://127.0.0.1:5000/api/materiales/materiales/solicitudes", {
      trabajador_id: trabajadores.find(t => t.nombre === nuevaSolicitud.trabajador).id,
      material_id: materialSeleccionado.id,
      cantidad: nuevaSolicitud.cantidad,
    })
    .then(() => {
      obtenerSolicitudes();
      setNuevaSolicitud({ trabajador: "", material: "", cantidad: 0 });
    })
    .catch(error => console.error("Error al crear solicitud:", error));
  };

  const obtenerSolicitudes = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/materiales/mostrarsolicitudes");
      const data = await response.json();
      console.log("Solicitudes obtenidas:", data); // 👀 Verifica si llegan datos
      setSolicitudes(data);
    } catch (error) {
      console.error("Error obteniendo solicitudes:", error);
    }
  };

  return (
    <div>
        <MenuLateral />
      <h2>Gestión de Materiales</h2>

      {/* Formulario para agregar material */}
      <h3>Agregar Nuevo Material</h3>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" value={nuevoMaterial.nombre} onChange={handleChange} required />
        <input type="number" name="cantidad_disponible" placeholder="Cantidad" value={nuevoMaterial.cantidad_disponible} onChange={handleChange} required />
        <button type="submit">Agregar Material</button>
      </form>

      {/* Tabla de materiales */}
      <h3>Lista de Materiales</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Cantidad Disponible</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {materiales.map((material) => (
            <tr key={material.id}>
              <td>
                {editMaterialId === material.id ? (
                  <input
                    type="text"
                    name="nombre"
                    value={editMaterialData[material.id]?.nombre || material.nombre}
                    onChange={(e) => handleEditChange(e, material.id)}
                  />
                ) : (
                  material.nombre
                )}
              </td>
              <td>
                {editMaterialId === material.id ? (
                  <input
                    type="number"
                    name="cantidad_disponible"
                    value={editMaterialData[material.id]?.cantidad_disponible || material.cantidad_disponible}
                    onChange={(e) => handleEditChange(e, material.id)}
                  />
                ) : (
                  material.cantidad_disponible
                )}
              </td>
              <td>
                {editMaterialId === material.id ? (
                  <button onClick={() => handleEditSubmit(material.id)}>Guardar</button>
                ) : (
                  <>
                    <button onClick={() => setEditMaterialId(material.id)}>Editar</button>
                    <button onClick={() => handleDelete(material.id)}>Eliminar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
      <h2>Gestión de Solicitudes de Material</h2>

      {/* Formulario para nueva solicitud */}
      <h3>Crear Nueva Solicitud</h3>
      <form onSubmit={handleSubmitS}>
        <select name="trabajador" value={nuevaSolicitud.trabajador} onChange={handleChangeS} required>
          <option value="">Seleccione un trabajador</option>
          {trabajadores.map((trabajador) => (
            <option key={trabajador.id} value={trabajador.nombre}>{trabajador.nombre}</option>
          ))}
        </select>

        <select name="material" value={nuevaSolicitud.material} onChange={handleChangeS} required>
          <option value="">Seleccione un material</option>
          {materiales.map((material) => (
            <option key={material.id} value={material.nombre}>{material.nombre} ({material.cantidad_disponible} disponibles)</option>
          ))}
        </select>

        <input type="number" name="cantidad" placeholder="Cantidad" value={nuevaSolicitud.cantidad} onChange={handleChangeS} required />
        <button type="submit">Solicitar Material</button>
      </form>

      {/* Tabla de solicitudes */}
      <h3>Solicitudes Registradas</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Trabajador</th>
            <th>Material</th>
            <th>Cantidad</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
        
          {solicitudes.map((solicitud) => (
            <tr key={solicitud.id}>
              <td>{trabajadores.find(t => t.id === solicitud.trabajador_id)?.nombre || "Desconocido"}</td>
              <td>{materiales.find(m => m.id === solicitud.material_id)?.nombre || "Desconocido"}</td>
              <td>{solicitud.cantidad}</td>
              <td>{solicitud.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
    
  );
};

export default Materiales;
