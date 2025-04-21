import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";
import "../estilos/obras.css";

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [descripcion, setDescripcion] = useState("");
  const [estado, setEstado] = useState("Pendiente");
  const [trabajadorId, setTrabajadorId] = useState("");
  const [evidencias, setEvidencias] = useState([]); 
  const [idZona, setIdZona] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [trabajadores, setTrabajadores] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [tareaEditando, setTareaEditando] = useState(null);  // Estado para la tarea que se está editando


  useEffect(() => {
    fetch("http://localhost:5000/api/tareas/obtenertareas")
      .then((res) => res.json())
      .then(setTareas);

    fetch("http://localhost:5000/api/usuarios/mostrarusuarios")
      .then((res) => res.json())
      .then(setTrabajadores);

    fetch("http://localhost:5000/api/zonas/mostrarzonas")
      .then((res) => res.json())
      .then(setZonas);
  }, []);

  const handleImageChange = (e, tareaId) => {
    const files = Array.from(e.target.files).slice(0, 3); // máximo 3 archivos
    const readers = [];
    const newEvidencias = []; // Para almacenar las evidencias que se leerán
    
    files.forEach((file, index) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        newEvidencias.push(reader.result);
        if (newEvidencias.length === files.length) {
          // Obtener la tarea en la que estamos trabajando
          const updatedTareas = tareas.map((tarea) => {
            if (tarea.id === tareaId) {
              // Actualizar las evidencias de la tarea
              const updatedEvidencias = [...JSON.parse(tarea.evidencia || '[]'), ...newEvidencias];
              return { ...tarea, evidencia: JSON.stringify(updatedEvidencias) };
            }
            return tarea;
          });
          setTareas(updatedTareas); // Actualizar el estado con las nuevas evidencias
        }
      };
      
      reader.readAsDataURL(file);
      readers.push(reader);
    });
  };
  

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevaTarea = {
      descripcion,
      estado,
      trabajador_id: trabajadorId,
      evidencia: JSON.stringify(evidencias), // base64 aquí
      id_zona: idZona
    };

    fetch("http://localhost:5000/api/tareas/creartareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaTarea),
    })
      .then((res) => res.json())
      .then((data) => setMensaje(data.mensaje || data.error))
      .catch((error) => console.error("Error al crear tarea:", error));
  };
  const eliminarTarea = (id) => {
    fetch(`http://localhost:5000/api/tareas/eliminartarea/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setMensaje(data.mensaje || data.error);
        // Actualiza la lista después de eliminar
        setTareas((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((error) => console.error("Error al eliminar tarea:", error));
  };
  
  const editarTarea = (tarea) => {
    // Puedes precargar los campos del formulario con esta tarea
    setDescripcion(tarea.descripcion);
    setEstado(tarea.estado);
    setTrabajadorId(tarea.trabajador_id);
    setIdZona(tarea.id_zona);
    setEvidencias(() => {
      try {
        return JSON.parse(tarea.evidencia);
      } catch {
        return [tarea.evidencia];
      }
    });
    setMensaje(`Editando tarea ID ${tarea.id}`);
    // Aquí puedes guardar el ID en edición y cambiar el submit a un update
  };
  const handleEditar = (tarea) => {
    setTareaEditando(tarea.id);  // Establecer la tarea en modo edición
  };
  
  const handleGuardar = (id) => {
    const tareaEditada = tareas.find((t) => t.id === id);
  
    // Verifica si la imagen está cargada
    if (tareaEditada.evidencia) {
      // Enviar la imagen al backend (como base64)
      fetch(`http://localhost:5000/api/tareas/modificartarea/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descripcion: tareaEditada.descripcion,
          estado: tareaEditada.estado,
          trabajador_id: tareaEditada.trabajador_id,
          evidencia: tareaEditada.evidencia, // Enviamos la imagen como base64
          id_zona: tareaEditada.id_zona,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setMensaje(data.mensaje || data.error);
          // Actualiza la tarea en la tabla
          setTareas(tareas.map((t) => (t.id === id ? tareaEditada : t)));
          setTareaEditando(null); // Cierra el modo de edición
        })
        .catch((error) => console.error("Error al guardar tarea:", error));
    } else {
      console.log("No hay evidencia cargada");
    }
  };
  
  
  const cambiarEstado = async (tarea) => {
    let nuevoEstado = "Pendiente";
    if (tarea.estado === "Pendiente") {
      nuevoEstado = "En Proceso";
    } else if (tarea.estado === "En Proceso") {
      nuevoEstado = "Completada";
    }
  
    // Actualizar el estado de la tarea en el estado local
    const tareaActualizada = { ...tarea, estado: nuevoEstado };
    setTareas((prevTareas) =>
      prevTareas.map((t) => (t.id === tarea.id ? tareaActualizada : t))
    );
  
    
    try {
      const response = await fetch(`http://localhost:5000/api/tareas/modificartarea/${tarea.id}`, {
        method: 'PUT', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
  
      if (!response.ok) {
        throw new Error('Error al actualizar el estado de la tarea');
      }
    } catch (error) {
      console.error("Error al guardar el cambio de estado:", error);
      // Revertir el cambio en el estado local si hubo un error
      setTareas((prevTareas) =>
        prevTareas.map((t) =>
          t.id === tarea.id ? { ...t, estado: tarea.estado } : t
        )
      );
    }
  };
  
  

  return (
    <MenuLateral>
      <div className="contenedor-formulario">
        <h2>Crear Nueva Tarea</h2>

        {/* Formulario para crear tarea */}
        <form className="formulario-horizontal" onSubmit={handleSubmit}>
          <div className="fila">
            <div className="campo">
              <label>Descripción:</label>
              <input 
                value={descripcion} 
                onChange={(e) => setDescripcion(e.target.value)} 
                required 
              />
            </div>

            <div className="campo">
              <label>Estado:</label>
              <input 
                value={estado} 
                onChange={(e) => setEstado(e.target.value)} 
              />
            </div>
          </div>

          <div className="fila">
            <div className="campo">
              <label>Trabajador:</label>
              <select 
                value={trabajadorId} 
                onChange={(e) => setTrabajadorId(e.target.value)} 
                required
              >
                <option value="">Selecciona un trabajador</option>
                {trabajadores.map((trabajador) => (
                  <option key={trabajador.id} value={trabajador.id}>
                    {trabajador.nombre} {trabajador.apellido}
                  </option>
                ))}
              </select>
            </div>

            <div className="campo">
              <label>Zona de trabajo:</label>
              <select 
                value={idZona} 
                onChange={(e) => setIdZona(e.target.value)} 
                required
              >
                <option value="">Selecciona una zona</option>
                {zonas.map((zona) => (
                  <option key={zona.id} value={zona.id}>
                    {zona.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>


          <div className="boton-container">
            <button type="submit" className="btn-crear">Crear Tarea</button>
          </div>
        </form>

        {/* Mostrar mensaje */}
        {mensaje && <p>{mensaje}</p>}

        {/* Lista de tareas */}
        <div className="table">
  <h3>Lista de Tareas</h3>
  <div className="table__body">
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Trabajador</th>
          <th>Zona</th>
          <th>Evidencia</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {tareas.map((tarea) => (
          <tr key={tarea.id}>
            <td>{tarea.id}</td>

            <td>
              {tareaEditando === tarea.id ? (
                <input
                  type="text"
                  value={tarea.descripcion}
                  onChange={(e) =>
                    setTareas((prevTareas) =>
                      prevTareas.map((t) =>
                        t.id === tarea.id
                          ? { ...t, descripcion: e.target.value }
                          : t
                      )
                    )
                  }
                />
              ) : (
                tarea.descripcion
              )}
            </td>

            <td>
              {tareaEditando === tarea.id ? (
                <input
                  type="text"
                  value={tarea.estado}
                  onChange={(e) =>
                    setTareas((prevTareas) =>
                      prevTareas.map((t) =>
                        t.id === tarea.id
                          ? { ...t, estado: e.target.value }
                          : t
                      )
                    )
                  }
                />
              ) : (
                tarea.estado
              )}
            </td>

            <td>
              {tareaEditando === tarea.id ? (
                <select
                  value={tarea.trabajador_id}
                  onChange={(e) =>
                    setTareas((prevTareas) =>
                      prevTareas.map((t) =>
                        t.id === tarea.id
                          ? { ...t, trabajador_id: e.target.value }
                          : t
                      )
                    )
                  }
                >
                  {trabajadores.map((trabajador) => (
                    <option key={trabajador.id} value={trabajador.id}>
                      {trabajador.nombre} {trabajador.apellido}
                    </option>
                  ))}
                </select>
              ) : (
                trabajadores.find((t) => t.id === tarea.trabajador_id)
                  ?.nombre || "Desconocido"
              )}
            </td>

            <td>
              {tareaEditando === tarea.id ? (
                <select
                  value={tarea.id_zona}
                  onChange={(e) =>
                    setTareas((prevTareas) =>
                      prevTareas.map((t) =>
                        t.id === tarea.id
                          ? { ...t, id_zona: e.target.value }
                          : t
                      )
                    )
                  }
                >
                  {zonas.map((zona) => (
                    <option key={zona.id} value={zona.id}>
                      {zona.nombre}
                    </option>
                  ))}
                </select>
              ) : (
                zonas.find((z) => z.id === tarea.id_zona)?.nombre || "Desconocida"
              )}
            </td>

            <td>
  {tarea.evidencia &&
    JSON.parse(tarea.evidencia).map((img, i) => (
      <img key={i} src={img} alt={`Evidencia ${i + 1}`} width="100" />
    ))}
  <input 
    type="file" 
    accept="image/*" 
    onChange={(e) => handleImageChange(e, tarea.id)} 
    multiple 
    id={`input-file-${tarea.id}`} 
    style={{ display: "none" }} // Ocultar el input
  />
  <button 
    onClick={() => document.getElementById(`input-file-${tarea.id}`).click()} // Abrir el diálogo de archivos
  >
    Seleccionar Archivos
  </button>
</td>



            <td>
              {tareaEditando === tarea.id ? (
                <button onClick={() => handleGuardar(tarea.id)}>Guardar</button>
              ) : (
                <button onClick={() => setTareaEditando(tarea.id)}>Editar</button>
              )}
              {tarea.estado !== "Completada" && (
                        <button onClick={() => cambiarEstado(tarea)} style={{ marginLeft: "10px" }}>
                          Cambiar Estado
                        </button>
                      )}
              <button
                onClick={() => eliminarTarea(tarea.id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Eliminar
              </button>
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

export default Tareas;


