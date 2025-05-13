import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/menu.css";

function MenuLateral({ children }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const rolId = localStorage.getItem("rol_id"); // Obtén el rol del usuario desde localStorage

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    document.querySelector(".overlay").classList.toggle("visible");
  };

  return (
    <div className={`contenedor-principal ${menuVisible ? "expandido" : ""}`}>
      <div className={`menu-lateral ${menuVisible ? "visible" : "hidden"}`}>
        <button onClick={toggleMenu} className="menu-toggle">☰</button>
        <div className="menu-content">
          <ul>
            {/* Mostrar solo "Usuarios" si el rol es 1 */}
            {rolId === "1" ? (
              <li><Link to="/administrador">Usuarios</Link></li>
            ) : (
              // Mostrar el resto de las opciones para otros roles
              <>
                <li><Link to="/administrador">Usuarios</Link></li>
                <li><Link to="/zonas">Zonas</Link></li>
                <li><Link to="/materiales">Materiales</Link></li>
                <li><Link to="/solicitudes">Solicitudes</Link></li>
                <li><Link to="/asistencia">Asistencia</Link></li>
                <li><Link to="/tareas">Tareas</Link></li>
                <li><Link to="/chats">Chats</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
      <div className="overlay" onClick={toggleMenu}></div>
      <div className={`contenido ${menuVisible ? "mover-derecha" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export default MenuLateral;


