import React, { useState, useEffect, useRef } from "react";
import MenuLateral from "./menulateral";
import MapaUbicacion from "./MapaUbicacion";
import "../estilos/obras.css"; 


const Zonas = () => {
  const [zonas, setZonas] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [finalizada, setFinalizada] = useState(false);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const mapaRef = useRef(null);
  const [mapaEdicionVisible, setMapaEdicionVisible] = useState(null);
  const [zonaEditandoId, setZonaEditandoId] = useState(null);
  const [avance, setAvance] = useState(0);
const [zonaEditada, setZonaEditada] = useState({ nombre: "", descripcion: "", ubicacion: "", finalizada: false, avance: 0, });

const rol_id = localStorage.getItem("rol_id");



  useEffect(() => {
    obtenerZonas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mapaRef.current && !mapaRef.current.contains(event.target)) {
        setMostrarMapa(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const obtenerZonas = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/zonas/mostrarzonas");
      const data = await response.json();
      setZonas(data);
    } catch (error) {
      console.error("Error al obtener zonas:", error);
    }
  };

  const crearZona = async (e) => {
    e.preventDefault();
    if (!ubicacion) {
      alert("Por favor, selecciona una ubicación en el mapa.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/zonas/crearzonas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, ubicacion, finalizada, avance }),
      });
      const data = await response.json();
      console.log(data);
      obtenerZonas(); // Refresca la lista de zonas
      setNombre(""); // Limpiar los campos
      setDescripcion("");
      setUbicacion("");
      setFinalizada(false);
      setAvance(0);
    } catch (error) {
      console.error("Error al crear zona:", error);
    }
  };

  const eliminarZona = async (id) => {
    try {
      await fetch(`http://127.0.0.1:5000/api/zonas/eliminarzonas/${id}`, { method: "DELETE" });
      obtenerZonas();
    } catch (error) {
      console.error("Error al eliminar zona:", error);
    }
  };

  const manejarMapa = () => {
    setMostrarMapa(!mostrarMapa);
  };
  const iniciarEdicion = (zona) => {
    setZonaEditandoId(zona.id);
    setZonaEditada(zona);
  };
  const editarZona = (zona) => {
    console.log("Editando zona:", zona);
    setZonaEditandoId(zona.id); // Guarda el ID de la zona que se edita
    setZonaEditada({
      nombre: zona.nombre,
      descripcion: zona.descripcion,
      ubicacion: zona.ubicacion,
      finalizada: zona.finalizada,
    });
  };
  const guardarZona = async (id) => {
    try {
      console.log("ID de la zona:", id);
      console.log("Datos a enviar:", zonaEditada);
  
      const response = await fetch(`http://127.0.0.1:5000/api/zonas/modificarzonas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(zonaEditada),
      });
  
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
  
      if (response.ok) {
        alert("Zona actualizada exitosamente");
        obtenerZonas();
        setZonaEditandoId(null);
      } else {
        alert("Error al actualizar la zona: " + data.error);
      }
    } catch (error) {
      console.error("Error al actualizar zona:", error);
    }
  };
  
    

  return (
    <div className="zonas-container">
      <MenuLateral>
        <h1 className="titulo">Zonas de Trabajo</h1>
        <div className="contenedor-formulario">
          <h2>Crear Nueva Zona</h2>
          {rol_id === "2" && (
  <form onSubmit={crearZona} className="formulario-horizontal">
    <div className="fila">
      <div className="campo">
        <label>Nombre:</label>
        <input
          type="text"
          placeholder="Nombre de la zona"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="campo">
        <label>Descripción:</label>
        <input
          type="text"
          placeholder="Descripción de la zona"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
      </div>
    </div>

    <div className="fila">
      <div className="campo ubicacion-container" ref={mapaRef}>
        <label>Ubicación:</label>
        <div className="ubicacion-input" onClick={() => setMostrarMapa(!mostrarMapa)}>
          <input type="text" placeholder="Selecciona ubicación" value={ubicacion} readOnly />
          <span className="icono-mapa">📍</span>
        </div>
        {mostrarMapa && (
          <MapaUbicacion setUbicacion={setUbicacion} setMostrarMapa={setMostrarMapa} />
        )}
      </div>
      <div className="campo campo-checkbox">
        <label>Finalizada:</label>
        <input
          type="checkbox"
          checked={finalizada}
          onChange={(e) => setFinalizada(e.target.checked)}
        />
      </div>
    </div>

    <div className="boton-container">
      <button type="submit" className="btn-crear">Crear Zona</button>
    </div>
  </form>
)}

        </div>
        {(rol_id === "2" || rol_id === "3") && (
        <main className="table" id="customers_table">
          <section className="table__header">
            <h1>Zonas de Trabajo</h1>
          </section>
          <section className="table__body">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripción</th>
                  <th>Ubicación</th>
                  <th>Finalizada</th>
                  <th>Avance</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
  {zonas.map((zona) => (
    <tr key={zona.id}>
      {zonaEditandoId === zona.id ? (
        <>
          <td>
            <input
              type="text"
              value={zonaEditada.nombre}
              onChange={(e) => setZonaEditada({ ...zonaEditada, nombre: e.target.value })}
            />
          </td>
          <td>
            <input
              type="text"
              value={zonaEditada.descripcion}
              onChange={(e) => setZonaEditada({ ...zonaEditada, descripcion: e.target.value })}
            />
          </td>
          <td>
  {zonaEditandoId === zona.id ? (
    <div className="ubicacion-container">
      <input
        type="text"
        value={zonaEditada.ubicacion}
        readOnly
        onClick={() => setMapaEdicionVisible(zona.id)}
      />
      <span className="icono-mapa" onClick={() => setMapaEdicionVisible(zona.id)}>📍</span>
      {mapaEdicionVisible === zona.id && (
        <MapaUbicacion
          setUbicacion={(nuevaUbicacion) => {
            setZonaEditada({ ...zonaEditada, ubicacion: nuevaUbicacion });
            setMapaEdicionVisible(null);
          }}
          setMostrarMapa={() => setMapaEdicionVisible(null)}
        />
      )}
    </div>
  ) : (
    zona.ubicacion
  )}
</td>


          <td>
            <input
              type="checkbox"
              checked={zonaEditada.finalizada}
              onChange={(e) => setZonaEditada({ ...zonaEditada, finalizada: e.target.checked })}
            />
          </td>
          <td>
            <button className="btn-guardar" onClick={() => guardarZona(zona.id)}>Guardar</button>
            <button className="btn-cancelar" onClick={() => setZonaEditandoId(null)}>Cancelar</button>
          </td>
        </>
      ) : (
        <>
          <td>{zona.nombre}</td>
          <td>{zona.descripcion}</td>
          <td>{zona.ubicacion}</td>
          <td>{zona.finalizada ? "Sí" : "No"}</td>
          <td>{zona.avance}%</td>
          {rol_id === "2" && (
          <>
            <button onClick={() => editarZona(zona)}>Editar</button>
            <button onClick={() => eliminarZona(zona.id)}>Eliminar</button>
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
    </div>
  );
};

export default Zonas;





