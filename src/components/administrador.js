import React, { useState, useEffect } from "react";
import axios from "axios";
import "../estilos/login.css";
import { useNavigate } from "react-router-dom";
import MenuLateral from "./menulateral"; // Asegúrate de que la ruta sea correcta
import "../estilos/menu.css";


function Administrador() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null); // Usuario en edición

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

    fetchUsuarios();
  }, []);

  // Función para eliminar un usuario
  const eliminarUsuario = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/eliminarusuario/${id}`);
      setUsuarios(usuarios.filter(usuario => usuario.id !== id)); // Actualizar la lista
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Función para manejar cambios en la edición de usuario
  const handleChange = (e) => {
    setEditUser({ ...editUser, [e.target.name]: e.target.value });
  };

  // Función para guardar cambios en el usuario
  const guardarCambios = async (id) => {
    if (!editUser) {
        console.error("No hay datos para actualizar.");
        return;
    }

    console.log("📡 Enviando solicitud con datos:", editUser);

    try {
        const response = await fetch(`http://127.0.0.1:5000/api/usuarios/modificarusuario/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                nombre: editUser.nombre,
                email: editUser.email,
                rol: editUser.rol,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error en la actualización:", errorData);
            return;
        }

        const data = await response.json();
        console.log("Usuario modificado:", data);

        // 🔄 Actualiza la tabla en el frontend
        setUsuarios((prevUsuarios) =>
            prevUsuarios.map((u) => (u.id === id ? { ...u, ...editUser } : u))
        );

        // Borra el estado de edición después de guardar
        setEditUser(null);
    } catch (error) {
        console.error("Error al modificar usuario:", error);
    }
};




const navigate = useNavigate();

   

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ display: "flex" }}>
      {/* Menú lateral */}
      <MenuLateral />

      {/* Contenido principal */}
      <div style={{ marginLeft: "250px", padding: "20px", width: "100%" }}>
        <h1>Administradores</h1>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
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
                    <td>
                      <button onClick={() => setEditUser(usuario)}>Editar</button>
                      <button onClick={() => eliminarUsuario(usuario.id)}>Eliminar</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Administrador;

