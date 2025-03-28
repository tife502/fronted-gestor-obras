import React, { useState, useEffect } from "react";
import axios from "axios";
import "../estilos/login.css";

function Administrador() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Obtener el JWT del almacenamiento local o del contexto
  const getToken = () => {
    return localStorage.getItem("token");  // O el método adecuado para obtener el token
  };
  const token = getToken();
console.log("Token enviado:", token);

useEffect(() => {
  const fetchUsuarios = async () => {
    setLoading(true); // Inicia la carga
    const token = getToken(); // Obtiene el token
    console.log("Token enviado:", token);

    if (!token) {
      setError("No hay token disponible");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/api/usuarios", {
        headers: {
          Authorization: `Bearer ${token}`, // Enviar el token en la cabecera
        },
      });

      setUsuarios(response.data); // Guarda los datos en el estado
    } catch (error) {
      console.error("Error al obtener usuarios:", error.response || error);
      setError("Hubo un error al cargar los usuarios");
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  fetchUsuarios();
}, []);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="wrapper">
      <h1>Administradores</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <td>{usuario.id}</td>
              <td>{usuario.nombre}</td>
              <td>{usuario.email}</td>
              <td>{usuario.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Administrador;
