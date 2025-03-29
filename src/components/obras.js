import { useState, useEffect } from "react";
import axios from "axios";
import MenuLateral from "./menulateral";
function ObrasApp() {
  const [obras, setObras] = useState([]);
  const [nuevaObra, setNuevaObra] = useState({ 
    nombre: "", 
    descripcion: "", 
    fecha_inicio: new Date().toISOString().split("T")[0], // Fecha actual por defecto
    fecha_fin: "" 
  });
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    fetchObras();
  }, []);

  // Obtener la lista de obras
  const fetchObras = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/obras/mostrar");
      setObras(response.data);
    } catch (error) {
      console.error("Error al obtener las obras", error);
    }
  };

  // Crear una nueva obra
  const handleCrear = async () => {
    try {
      const datosObra = {
        ...nuevaObra,
        fecha_inicio: nuevaObra.fecha_inicio || new Date().toISOString().split("T")[0], // Asigna fecha actual si está vacía
        fecha_fin: nuevaObra.fecha_fin || null, // Permitir valores nulos en fecha_fin
      };

      const response = await axios.post("http://127.0.0.1:5000/api/obras/crear", datosObra);
      setObras([...obras, response.data]);
      setNuevaObra({ nombre: "", descripcion: "", fecha_inicio: new Date().toISOString().split("T")[0], fecha_fin: "" });
    } catch (error) {
      console.error("Error al crear la obra", error);
    }
  };

  // Guardar edición de una obra
  const handleEditar = async (id) => {
    try {
      const response = await axios.put(`http://127.0.0.1:5000/api/obras/editar/${id}`, editando);
      setObras(obras.map((obra) => (obra.id === id ? response.data : obra)));
      setEditando(null);
    } catch (error) {
      console.error("Error al editar la obra", error);
    }
  };

  // Eliminar una obra
  const handleEliminar = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:5000/api/obras/eliminar/${id}`);
      setObras(obras.filter((obra) => obra.id !== id));
    } catch (error) {
      console.error("Error al eliminar la obra", error);
    }
  };

  return (
    <div className="p-4">
        <MenuLateral />
      <h1 className="text-xl font-bold mb-4">Gestión de Obras</h1>

      {/* Formulario para agregar una nueva obra */}
      <div className="mb-4 flex gap-2">
        <input
          className="border p-2 rounded w-1/4"
          placeholder="Nombre"
          value={nuevaObra.nombre}
          onChange={(e) => setNuevaObra({ ...nuevaObra, nombre: e.target.value })}
        />
        <input
          className="border p-2 rounded w-1/4"
          placeholder="Descripción"
          value={nuevaObra.descripcion}
          onChange={(e) => setNuevaObra({ ...nuevaObra, descripcion: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded w-1/6"
          value={nuevaObra.fecha_inicio}
          onChange={(e) => setNuevaObra({ ...nuevaObra, fecha_inicio: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded w-1/6"
          value={nuevaObra.fecha_fin}
          onChange={(e) => setNuevaObra({ ...nuevaObra, fecha_fin: e.target.value })}
        />
        <button className="bg-blue-500 text-white p-2 rounded" onClick={handleCrear}>
          Crear Obra
        </button>
      </div>

      {/* Tabla de obras */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Descripción</th>
            <th className="border p-2">Fecha Inicio</th>
            <th className="border p-2">Fecha Fin</th>
            <th className="border p-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {obras.map((obra) => (
            <tr key={obra.id} className="border">
              {editando?.id === obra.id ? (
                <>
                  <td className="border p-2">
                    <input
                      className="border p-2 w-full"
                      value={editando.nombre}
                      onChange={(e) => setEditando({ ...editando, nombre: e.target.value })}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      className="border p-2 w-full"
                      value={editando.descripcion}
                      onChange={(e) => setEditando({ ...editando, descripcion: e.target.value })}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="date"
                      className="border p-2 w-full"
                      value={editando.fecha_inicio}
                      onChange={(e) => setEditando({ ...editando, fecha_inicio: e.target.value })}
                    />
                  </td>
                  <td className="border p-2">
                    <input
                      type="date"
                      className="border p-2 w-full"
                      value={editando.fecha_fin}
                      onChange={(e) => setEditando({ ...editando, fecha_fin: e.target.value })}
                    />
                  </td>
                  <td className="border p-2">
                    <button className="bg-green-500 text-white p-1 rounded mr-2" onClick={() => handleEditar(obra.id)}>
                      Guardar
                    </button>
                    <button className="bg-gray-500 text-white p-1 rounded" onClick={() => setEditando(null)}>
                      Cancelar
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td className="border p-2">{obra.nombre}</td>
                  <td className="border p-2">{obra.descripcion}</td>
                  <td className="border p-2">{obra.fecha_inicio}</td>
                  <td className="border p-2">{obra.fecha_fin || "No definida"}</td>
                  <td className="border p-2">
                    <button className="bg-yellow-500 text-white p-1 rounded mr-2" onClick={() => setEditando(obra)}>
                      Editar
                    </button>
                    <button className="bg-red-500 text-white p-1 rounded" onClick={() => handleEliminar(obra.id)}>
                      Eliminar
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ObrasApp;
