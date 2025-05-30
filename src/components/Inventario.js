import React, { useEffect, useState } from "react";
import MenuLateral from "./menulateral";

const Inventario = () => {
  const [inventario, setInventario] = useState({});

  useEffect(() => {
    fetch("http://localhost:5000/api/inventario/listar")
      .then(res => res.json())
      .then(setInventario);
  }, []);

  return (
    <MenuLateral>
      <div>
        <h2>Inventario por Zona</h2>
        {Object.keys(inventario).length === 0 ? (
          <p>No hay inventario registrado.</p>
        ) : (
          Object.entries(inventario).map(([zona, productos]) => (
            <div key={zona} style={{ marginBottom: 32, border: "1px solid #ccc", borderRadius: 8, padding: 16 }}>
              <h3 style={{ color: "#2a4d7a" }}>{zona}</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ borderBottom: "1px solid #ccc" }}>ID Material</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Nombre</th>
                    <th style={{ borderBottom: "1px solid #ccc" }}>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(prod => (
                    <tr key={prod.id_inventario}>
                      <td>{prod.id_material}</td>
                      <td>{prod.nombre_material || "Sin nombre"}</td>
                      <td>{prod.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </MenuLateral>
  );
};

export default Inventario;