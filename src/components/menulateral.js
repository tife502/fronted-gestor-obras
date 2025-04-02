import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../estilos/menu.css";

function MenuLateral({ children }) {
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <div className={`contenedor-principal ${menuVisible ? "expandido" : ""}`}>
      <div className={`menu-lateral ${menuVisible ? "visible" : "hidden"}`}>
        <button onClick={toggleMenu} className="menu-toggle">☰</button>
        <div className="menu-content">
          <ul>
            <li><Link to="/administrador">Administradores</Link></li>
            <li><Link to="/zonas">zonas</Link></li>
            <li><Link to="/materiales">Materiales</Link></li>
            <li><Link to="/asistencia">Asistencia</Link></li>
          </ul>
        </div>
      </div>
      <div className={`contenido ${menuVisible ? "mover-derecha" : ""}`}>
        {children}
      </div>
    </div>
  );
}

export default MenuLateral;
    </div>
  );
}

export default MenuLateral;
