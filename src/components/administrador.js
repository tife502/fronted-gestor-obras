import React, { useState, useEffect } from "react";
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

  // Cargar usuarios desde la API
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/usuarios/mostrarusuarios");
        setUsuarios(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error.response || error);
        setError("Hubo un error al cargar los usuarios");
      } finally {
        setLoading(false);
      }
    };
    const fetchZonas = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/zonas/mostrarzonas");
        setZonas(response.data);
      } catch (error) {
        console.error("Error al obtener zonas:", error);
      }
    };
    fetchUsuarios();
    fetchZonas();
  }, []);

  // Función para eliminar usuario
  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/eliminarusuario/${id}`);
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
      const response = await fetch(`http://127.0.0.1:5000/api/usuarios/modificarusuario/${id}`, {
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
                <th>Editar</th>
                <th>Eliminar</th>
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
                      <td>
                        <button onClick={() => setEditUser(usuario)}>Editar</button>
                      </td>
                      <td>
                        <button onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
                      </td>
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

