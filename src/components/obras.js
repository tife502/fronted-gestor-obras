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
  const [zonas, setZonas] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [formData, setFormData] = useState({ nombre: "", descripcion: "", obra_id: "", trabajador_id: "" });
  const [editando, setEditando] = useState(null);
  const [editZonaId, setEditZonaId] = useState(null);
  const [editZonaData, setEditZonaData] = useState({});

  useEffect(() => {
    fetchObras();
    fetchZonas();
    fetchTrabajadores();

  }, []);

  // Obtener la lista de obras
  const fetchObras = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:5000/api/obras/mostrar");
      setObras(response.data);
    } catch (error) {
      console.error("Error al obtener las obras", error);
    }
  } ;
  

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

  const fetchZonas = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/zonas/mostrarzonas");
    const data = await res.json();
    setZonas(data);
  };

  const fetchTrabajadores = async () => {
    const res = await fetch("http://127.0.0.1:5000/api/zonas/trabajadores");
    const data = await res.json();
    setTrabajadores(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:5000/api/zonas/crearzonas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    fetchZonas();
  };

  const handleDelete = async (id) => {
    await fetch(`http://127.0.0.1:5000/api/zonas/eliminarzona/${id}`, { method: "DELETE" });
    fetchZonas();
  };
  const handleEditChange = (e, id) => {
    setEditZonaData({ ...editZonaData, [id]: { ...editZonaData[id], [e.target.name]: e.target.value } });
  };
  const handleEditSubmit = (id) => {
    axios.put(`http://127.0.0.1:5000/api/zonas/editarzonas/${id}`, editZonaData[id]).then(() => {
      axios.get("http://127.0.0.1:5000/api/zonas/mostrarzonas").then((response) => setZonas(response.data));
      setEditZonaId(null);
    });
  };
  const handleCheckOut = (zonaId, trabajadorId) => {
    axios.post(`http://127.0.0.1:5000/api/zonas/zonatrabajo/${zonaId}/check_out`, { trabajador_id: trabajadorId })
      .then(() => {
        axios.get("http://127.0.0.1:5000/api/zonas/mostrarzonas").then((response) => setZonas(response.data));
      })
      .catch(error => {
        console.error("Error al registrar check-out:", error);
      });
  };

  const handleCheckIn = (zonaId, trabajadorId) => {
    axios.post(`http://127.0.0.1:5000/api/zonas/zonatrabajo/${zonaId}/check_in`, { trabajador_id: trabajadorId })
      .then(() => {
        axios.get("http://127.0.0.1:5000/api/zonas/mostrarzonas").then((response) => setZonas(response.data));
      })
      .catch(error => {
        console.error("Error al registrar check-in:", error);
      });
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
      <h1>Zonas de Trabajo</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="descripcion" placeholder="Descripción" onChange={handleChange} required />
        <select name="obra_id" onChange={handleChange} required>
          <option value="">Seleccione una obra</option>
          {obras.map((obra) => (
            <option key={obra.id} value={obra.id}>{obra.nombre}</option>
          ))}
        </select>
        <select name="trabajador_id" onChange={handleChange} required>
          <option value="">Selecciona un Trabajador</option>
          {trabajadores.map((t) => (
            <option key={t.id} value={t.id}>{t.nombre}</option>
          ))}
        </select>
        <button type="submit">Crear Zona</button>
      </form>
      <table border="1">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Trabajador Asignado</th>
            <th>Obra</th>
            <th>Acciones</th>
            <th>Accio</th>
            <th>nes</th>
            
          </tr>
        </thead>
        <tbody>
          {zonas.map((zona) => (
            <tr key={zona.id}>
              {editZonaId === zona.id ? (
                <>
                  <td><input type="text" name="nombre" value={editZonaData[zona.id]?.nombre || zona.nombre} onChange={(e) => handleEditChange(e, zona.id)} /></td>
                  <td><input type="text" name="descripcion" value={editZonaData[zona.id]?.descripcion || zona.descripcion} onChange={(e) => handleEditChange(e, zona.id)} /></td>
                  <td>
                    <select name="trabajador_id" value={editZonaData[zona.id]?.trabajador_id || zona.trabajador_id} onChange={(e) => handleEditChange(e, zona.id)}>
                      {trabajadores.map((trabajador) => (
                        <option key={trabajador.id} value={trabajador.id}>{trabajador.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select name="obra_id" value={editZonaData[zona.id]?.obra_id || zona.obra_id} onChange={(e) => handleEditChange(e, zona.id)}>
                      {obras.map((obra) => (
                        <option key={obra.id} value={obra.id}>{obra.nombre}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button onClick={() => handleEditSubmit(zona.id)}>Guardar</button>
                    <button onClick={() => setEditZonaId(null)}>Cancelar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{zona.nombre}</td>
                  <td>{zona.descripcion}</td>
                  <td>{trabajadores.find(t => t.id === zona.trabajador_id)?.nombre || "N/A"}</td>
                  <td>{obras.find(o => o.id === zona.obra_id)?.nombre || "N/A"}</td>
                  <td>{zona.check_in ? new Date(zona.check_in).toLocaleString() : "Pendiente"}</td>
              <td>{zona.check_out ? new Date(zona.check_out).toLocaleString() : "Pendiente"}</td>
              <td>
                <button onClick={() => setEditZonaId(zona.id)}>Editar</button>
                <button onClick={() => handleDelete(zona.id)}>Eliminar</button>
                {!zona.check_in && (
                  <button onClick={() => handleCheckIn(zona.id, zona.trabajador_id)}>Registrar Entrada</button>
                )}
                {zona.check_in && !zona.check_out && (
                  <button onClick={() => handleCheckOut(zona.id, zona.trabajador_id)}>Registrar Salida</button>
                )}
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
