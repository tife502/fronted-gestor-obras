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

  const rolId = localStorage.getItem("rol_id");
  const esAdmin = rolId === "1";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rolId = localStorage.getItem("rol_id");
        const userId = localStorage.getItem("id");

        const responseUsuarios = await axios.get("http://localhost:5000/api/usuarios/mostrarusuarios");
        const usuariosFiltrados = rolId === "1"
          ? responseUsuarios.data
          : responseUsuarios.data.filter((usuario) => usuario.id.toString() === userId);
        setUsuarios(usuariosFiltrados);

        const responseZonas = await axios.get("http://localhost:5000/api/zonas/mostrarzonas");
        setZonas(responseZonas.data);
      } catch (error) {
        setError("Hubo un error al cargar los datos.");
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/eliminarusuario/${id}`);
      setUsuarios((prevUsuarios) => prevUsuarios.filter((usuario) => usuario.id !== id));
    } catch (error) {
      console.error("Error al eliminar usuario:", error.response?.data || error.message);
    }
  };

  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  const guardarCambios = async (id) => {
    if (!editUser) return;

    // Validación de datos editados
    if (!editUser.nombre || !editUser.email || !editUser.rol) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/usuarios/modificarusuario/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: editUser.nombre,
          email: editUser.email,
          rol: editUser.rol,
          id_zona: editUser.id_zona,
        }),
      });

      if (!response.ok) {
        console.error("Error en la actualización");
        return;
      }

      setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, ...editUser } : u)));
      setEditUser(null);
    } catch (error) {
      console.error("Error al modificar usuario:", error);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortAsc(!sortAsc);
    } else {
      setSortColumn(column);
      setSortAsc(true);
    }
  };

  const sortedUsers = [...usuarios].sort((a, b) => {
    if (!sortColumn) return 0;
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];

    if (valueA < valueB) return sortAsc ? -1 : 1;
    if (valueA > valueB) return sortAsc ? 1 : -1;
    return 0;
  });

  const filteredUsers = sortedUsers.filter((usuario) =>
    Object.values(usuario).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <MenuLateral>
      {loading ? (
        <p>Cargando datos...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <main className="table" id="customers_table">
          <section className="table__header">
            <h1>Usuarios Administradores</h1>
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </section>
          <section className="table__body">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("id")}>Id</th>
                  <th onClick={() => handleSort("nombre")}>Nombre</th>
                  <th onClick={() => handleSort("email")}>Email</th>
                  <th onClick={() => handleSort("rol")}>Rol</th>
                  <th onClick={() => handleSort("id_zona")}>Zona</th>
                  {esAdmin && (
                    <>
                      <th>Editar</th>
                      <th>Eliminar</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((usuario) => (
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
                        {esAdmin && (
                          <td>
                            <button onClick={() => guardarCambios(usuario.id)}>Guardar</button>
                            <button onClick={() => setEditUser(null)}>Cancelar</button>
                          </td>
                        )}
                      </>
                    ) : (
                      <>
                        <td>{usuario.id}</td>
                        <td>{usuario.nombre}</td>
                        <td>{usuario.email}</td>
                        <td>{usuario.rol}</td>
                        <td>{usuario.id_zona ? usuario.id_zona : ""}</td>
                        {esAdmin && (
                          <>
                            <td>
                              <button onClick={() => setEditUser(usuario)}>Editar</button>
                            </td>
                            <td>
                              <button onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
                            </td>
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
      )}
    </MenuLateral>
  );
}

export default Administrador;

