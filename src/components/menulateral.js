import React from "react";
import { Link } from "react-router-dom";
import "../estilos/menu.css";

function MenuLateral() {
  return (
    <div className="menu-lateral">
      <h2>Menú</h2>
      <ul>
        <li><Link to="/administrador">Usuarios</Link></li>
        <li><Link to="/obra">Obras</Link></li>
        <li><Link to="/configuracion">Configuración</Link></li>
      </ul>
    </div>
  );
}

export default MenuLateral;