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
  const [tareaEditando, setTareaEditando] = useState(null); 

  const userId = localStorage.getItem("id");
  const rol_id = localStorage.getItem("rol_id");
  useEffect(() => {
  const userId = localStorage.getItem("id");
  const rol_id = localStorage.getItem("rol_id");

  if (rol_id === "4") {
    // Solo tareas del usuario logueado
    fetch(`http://localhost:5000/api/tareas/obtenertareas/${userId}`)
      .then((res) => res.json())
      .then(setTareas)
      .catch((err) => console.error("Error al obtener tareas del trabajador:", err));
  } else {
    // Todas las tareas para admin/jefe
    fetch("http://localhost:5000/api/tareas/obtenertareas")
      .then((res) => res.json())
      .then(setTareas)
      .catch((err) => console.error("Error al obtener tareas:", err));
  }

  fetch("http://localhost:5000/api/usuarios/mostrarusuarios")
    .then((res) => res.json())
    .then(setTrabajadores);

  fetch("http://localhost:5000/api/zonas/mostrarzonas")
    .then((res) => res.json())
    .then(setZonas);
}, []);


  const handleImageChange = (e, tareaId) => {
    const files = Array.from(e.target.files).slice(0, 3); // Limitar a 3 archivos
    const readers = [];
    const newEvidencias = [];

    files.forEach((file, index) => {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Solo se permiten imágenes.");
        return;
      }

      // Validar tamaño de archivo (ejemplo: 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("El tamaño máximo permitido es de 2MB.");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = () => {
        newEvidencias.push(reader.result);
        if (newEvidencias.length === files.length) {
          const updatedTareas = tareas.map((tarea) => {
            if (tarea.id === tareaId) {
              const updatedEvidencias = [
                ...JSON.parse(tarea.evidencia || "[]"),
                ...newEvidencias,
              ];
              return { ...tarea, evidencia: JSON.stringify(updatedEvidencias) };
            }
            return tarea;
          });
          setTareas(updatedTareas);
        }
      };

      reader.onerror = () => {
        alert("Error al leer el archivo.");
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
      .then((data) => {
        setMensaje(data.mensaje || data.error);
        // Vuelve a cargar la lista de tareas
        if (rol_id === "4") {
          fetch(`http://localhost:5000/api/tareas/obtenertareas/${userId}`)
            .then((res) => res.json())
            .then(setTareas);
        } else {
          fetch("http://localhost:5000/api/tareas/obtenertareas")
            .then((res) => res.json())
            .then(setTareas);
        }
      })
      .catch((error) => console.error("Error al crear tarea:", error));
  };
  const eliminarTarea = (id) => {
    fetch(`http://localhost:5000/api/tareas/eliminartarea/${id}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        setMensaje(data.mensaje || data.error);
        
        setTareas((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((error) => console.error("Error al eliminar tarea:", error));
  };
  
  const editarTarea = (tarea) => {
    setDescripcion(tarea.descripcion);
    setEstado(tarea.estado);
    setTrabajadorId(tarea.trabajador_id);
    setIdZona(tarea.id_zona);
    setEvidencias(() => {
      if (!tarea.evidencia) {
        return []; // Si no hay evidencia, devuelve un array vacío
      }

      try {
        return JSON.parse(tarea.evidencia); // Intenta parsear el JSON
      } catch {
        return [tarea.evidencia]; // Si falla, envuelve el valor en un array
      }
    });
    setMensaje(`Editando tarea ID ${tarea.id}`);
  };

  const handleEditar = (tarea) => {
    if (tareaEditando === tarea.id) {
      setTareaEditando(null); // Si ya está en edición, cancela la edición
      setDescripcion(""); // Limpia los estados locales
      setEstado("Pendiente");
      setTrabajadorId("");
      setIdZona("");
      setEvidencias([]);
      setMensaje("");
    } else {
      editarTarea(tarea); // Prepara los datos de la tarea
      setTareaEditando(tarea.id); // Establece la tarea en edición
    }
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
          
          setTareas(tareas.map((t) => (t.id === id ? tareaEditada : t)));
          setTareaEditando(null);
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

        
        {(rol_id === "2" || rol_id === "3") && (
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
                {trabajadores
                  .filter((trabajador) => !idZona || String(trabajador.id_zona) === String(idZona))
                  .map((trabajador) => (
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
      )}

        
        {mensaje && <p>{mensaje}</p>}

       
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
  {(rol_id === "2" || rol_id === "3") && (
    <>
      {tareaEditando === tarea.id ? (
        <button onClick={() => handleGuardar(tarea.id)}>Guardar</button>
      ) : (
        <button onClick={() => handleEditar(tarea)}>Editar</button>
      )}
    </>
  )}

  { tarea.estado !== "Completada" && (
    <button onClick={() => cambiarEstado(tarea)} style={{ marginLeft: "10px" }}>
      Cambiar Estado
    </button>
  )}

  {(rol_id === "2" || rol_id === "3") && (
    <button
      onClick={() => eliminarTarea(tarea.id)}
      style={{ marginLeft: "10px", color: "red" }}
    >
      Eliminar
    </button>
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

export default Tareas;





