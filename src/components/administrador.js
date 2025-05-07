import React, { useState, useEffect, response} from "react";
import axios from "axios";
import "../estilos/login.css";
import MenuLateral from "./menulateral";
import "../estilos/admi.css"; 

function Administrador() {
  const [usuarios, setUsuarios] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); // Estado para búsqueda
  const [sortColumn, setSortColumn] = useState(null); // Columna ordenada
  const [sortAsc, setSortAsc] = useState(true); // Dirección de orden
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


 const rolId = localStorage.getItem("rol_id");
 const userId = localStorage.getItem("id");
 console.log('rolId:', rolId);  
 console.log('userId:', userId);
 

 const esAdmin = rolId === "1";  

 
 useEffect(() => {
  
  const fetchData = async () => {
    try {
      
      const rolId = localStorage.getItem("rol_id");
      const userId = localStorage.getItem("id");
      console.log('rolId:', rolId); 
      console.log('userId:', userId);

      
      const responseUsuarios = await axios.get("https://gestordeobras-3.onrender.com/api/usuarios/mostrarusuarios");
      console.log("Usuarios obtenidos:", responseUsuarios.data); 

      // Si es un administrador (rolId == 1), carga todos los usuarios
      // Si no es admin, solo muestra el usuario correspondiente al userId
      const usuariosFiltrados = rolId === "1" 
        ? responseUsuarios.data
        : responseUsuarios.data.filter((usuario) => usuario.id.toString() === userId);

      // Establecer usuarios filtrados en el estado
      setUsuarios(usuariosFiltrados);

     
      const responseZonas = await axios.get("https://gestordeobras-3.onrender.com/api/zonas/mostrarzonas");
      console.log("Zonas obtenidas:", responseZonas.data); 
      setZonas(responseZonas.data);
      
    } catch (error) {
      setError("Hubo un error al cargar los datos.");
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []); //
  

  // Función para eliminar usuario
  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`https://gestordeobras-3.onrender.com/api/usuarios/eliminarusuario/${id}`);
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.id !== id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error.response?.data || error.message);
    }
  };
  
  // Manejar cambios en la edición de usuario
  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  // Guardar cambios en el usuario
  const guardarCambios = async (id) => {
    if (!editUser) return;

    try {
      const response = await fetch(`https://gestordeobras-3.onrender.com/api/usuarios/modificarusuario/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editUser.nombre,
          email: editUser.email,
          rol: editUser.rol,
          id_zona: editUser.id_zona

        }),
      });

      if (!response.ok) {
        console.error("Error en la actualización");
        console.log("Datos enviados:", JSON.stringify({
          nombre: editUser.nombre,
          email: editUser.email,
          rol: editUser.rol,
          id_zona: editUser.id_zona
          
        }));
        
        return;
      }

      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...editUser } : u)));
      setEditUser(null);
    } catch (error) {
      console.error("Error al modificar usuario:", error);
    }
  };

  // Filtrar usuarios por búsqueda
  const filteredUsers = usuarios.filter((usuario) =>
    Object.values(usuario).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Ordenar usuarios por columna seleccionada
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];
    return sortAsc ? (aValue > bValue ? 1 : -1) : aValue < bValue ? 1 : -1;
  });

  // Cambiar orden de la columna
  const handleSort = (column) => {
    setSortAsc(sortColumn === column ? !sortAsc : true);
    setSortColumn(column);
  };



  

  

  return (
    <MenuLateral>
      <main className="table" id="customers_table">
        <section className="table__header">
          <h1>Usuarios Administradores</h1>
          
        </section>
        <section className="table__body">
          <table>
            <thead>
              <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Zona</th>
                {esAdmin && (
                <>
                  <th>Editar</th>
                  <th>Eliminar</th>
                </>
              )}
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  {editUser && editUser.id === usuario.id ? (
                    <>
                      <td>{usuario.id}</td>
                      <td>
                        <input
                          type="text"
                          name="nombre"
                          value={editUser.nombre}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="email"
                          value={editUser.email}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          name="rol"
                          value={editUser.rol}
                          onChange={handleChange}
                        />
                      </td>
                      <td>
                        <select name="id_zona" value={editUser.id_zona || ""} onChange={handleChange}>
                          <option value="">Selecciona una zona</option>
                          {zonas.map((zona) => (
                            <option key={zona.id} value={zona.id}>{zona.nombre}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button onClick={() => guardarCambios(usuario.id)}>Guardar</button>
                        <button onClick={() => setEditUser(null)}>Cancelar</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{usuario.id}</td>
                      <td>{usuario.nombre}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.rol}</td>
                      <td>{usuario.id_zona ? usuario.id_zona : ""}</td>
                      {esAdmin ? (
                      <>
                        <td>
                          <button onClick={() => setEditUser(usuario)}>Editar</button>
                        </td>
                        <td>
                          <button onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td colSpan="2">Sin permisos</td>
                      </>
                    )}
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </MenuLateral>
  );
};

export default Administrador;

