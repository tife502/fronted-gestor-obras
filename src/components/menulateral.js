import React from "react";
import { Link } from "react-router-dom";
import "../estilos/menu.css";

function MenuLateral() {
  return (
    <div className="menu-lateral">
      <h2>Menú</h2>
      <ul>
        <li><Link to="/administrador">Administradores</Link></li>
        <li><Link to="/zona">ZonaTrabajo</Link></li>
        <li><Link to="/obra">obras</Link></li>
        <li><Link to="/materiales">Materiales</Link></li>

      </ul>
    </div>
  );
}

export default MenuLateral;
