import React, { useEffect, useState } from "react";
import axios from "axios";
import MenuLateral from "./menulateral";
import "../estilos/obras.css";

const Materiales = () => {
  const [materiales, setMateriales] = useState([]);
  const [zonas, setZonas] = useState([]); // Estado para almacenar las zonas
  const [nuevoMaterial, setNuevoMaterial] = useState({ nombre: "", cantidad_disponible: 0, id_zona: "" });
  const [editMaterialId, setEditMaterialId] = useState(null);
  const [editMaterialData, setEditMaterialData] = useState({});

  // Obtener materiales
  const obtenerMateriales = () => {
    axios
      .get("http://127.0.0.1:5000/api/materiales/mostrarmateriales")
      .then((response) => setMateriales(response.data))
      .catch((error) => console.error("Error al obtener materiales:", error));
  };

  // Obtener zonas
  const obtenerZonas = () => {
    axios
      .get("http://127.0.0.1:5000/api/zonas/mostrarzonas") // Ruta para obtener las zonas
      .then((response) => setZonas(response.data))
      .catch((error) => console.error("Error al obtener zonas:", error));
  };

  useEffect(() => {
    obtenerMateriales();
    obtenerZonas(); // Llamar a la función para obtener las zonas
  }, []);

  // Manejar cambios en el formulario de creación
  const handleChange = (e) => {
    setNuevoMaterial({ ...nuevoMaterial, [e.target.name]: e.target.value });
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e, id) => {
    setEditMaterialData({
      ...editMaterialData,
      [id]: { ...editMaterialData[id], [e.target.name]: e.target.value },
    });
  };

  // Crear un nuevo material
  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("http://127.0.0.1:5000/api/materiales/crearmateriales", nuevoMaterial)
      .then(() => {
        obtenerMateriales(); // Actualizar la lista de materiales
        setNuevoMaterial({ nombre: "", cantidad_disponible: 0, id_zona: "" }); // Limpiar el formulario
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          // Mostrar alerta con el mensaje de error devuelto por el backend
          alert(error.response.data.error);
        } else {
          console.error("Error al agregar material:", error);
          alert("Ocurrió un error al agregar el material. Inténtalo nuevamente.");
        }
      });
  };

  // Editar un material existente
  const handleEditSubmit = (id) => {
    axios
      .put(`http://127.0.0.1:5000/api/materiales/modificarmateriales/${id}`, editMaterialData[id])
      .then(() => {
        obtenerMateriales(); // Actualizar la lista de materiales
        setEditMaterialId(null); // Salir del modo de edición
      })
      .catch((error) => console.error("Error al actualizar material:", error));
  };

  // Eliminar un material
  const handleDelete = (id) => {
    axios
      .delete(`http://127.0.0.1:5000/api/materiales/eliminarmateriales/${id}`)
      .then(() => {
        obtenerMateriales(); // Actualizar la lista de materiales
      })
      .catch((error) => console.error("Error al eliminar material:", error));
  };

  return (
    <MenuLateral>
      <div className="contenedor">
        <div className="form-container">
          <h2>Gestión de Materiales</h2>

          {/* Formulario para agregar material */}
          <div className="form-container">
            <h3>Agregar Nuevo Material</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="nombre"
                placeholder="Nombre"
                value={nuevoMaterial.nombre}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="cantidad_disponible"
                placeholder="Cantidad Disponible"
                value={nuevoMaterial.cantidad_disponible}
                onChange={handleChange}
                required
              />
              <select
                name="id_zona"
                value={nuevoMaterial.id_zona}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar Zona</option>
                {zonas.map((zona) => (
                  <option key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
              <button type="submit">Agregar Material</button>
            </form>
          </div>

          {/* Tabla de materiales */}
          <div className="table-container">
            <div className="table-wrapper">
              <h3>Lista de Materiales</h3>
              <table border="1">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Cantidad Disponible</th>
                    <th>ID de Zona</th>
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
                            value={
                              editMaterialData[material.id]?.cantidad_disponible ||
                              material.cantidad_disponible
                            }
                            onChange={(e) => handleEditChange(e, material.id)}
                          />
                        ) : (
                          material.cantidad_disponible
                        )}
                      </td>
                      <td>
                        {editMaterialId === material.id ? (
                          <input
                            type="text"
                            name="id_zona"
                            value={editMaterialData[material.id]?.id_zona || material.id_zona}
                            onChange={(e) => handleEditChange(e, material.id)}
                          />
                        ) : (
                          material.id_zona
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
            </div>
          </div>
        </div>
      </div>
    </MenuLateral>
  );
};

export default Materiales;