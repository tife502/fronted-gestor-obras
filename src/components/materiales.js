import React, { useState, useEffect } from "react";
import axios from "axios";
import MenuLateral from "./menulateral";

const API_URL = "http://127.0.0.1:5000/api/materiales";

const Materiales = () => {
    const [materiales, setMateriales] = useState([]);
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState(0);
    const [zonas, setZonas] = useState([]);
    const [idZona, setIdZona] = useState("");
    const [editando, setEditando] = useState(null);

    useEffect(() => {
        obtenerMateriales();
        obtenerZonas();
    }, []);

    // Obtener lista de materiales
    const obtenerMateriales = async () => {
        try {
            const response = await axios.get(`${API_URL}/mostrarmateriales`);
            setMateriales(response.data);
        } catch (error) {
            console.error("Error obteniendo materiales", error);
        }
    };
    const obtenerZonas = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/zonas/mostrarzonas");
        const data = await response.json();
        console.log("Zonas obtenidas:", data); // <-- Agregado para depuración
        setZonas(data);
      } catch (error) {
        console.error("Error al obtener zonas:", error);
      }
    };
    
    // Crear material
    const crearMaterial = async () => {
        if (!nombre || !idZona) {
            alert("Nombre e ID de zona son obligatorios");
            return;
        }

        try {
            await axios.post(`${API_URL}/crearmateriales`, {
                nombre,
                cantidad_disponible: cantidad,
                id_zona: idZona
            });
            obtenerMateriales();
            limpiarFormulario();
        } catch (error) {
            console.error("Error creando material", error);
        }
    };

    // Modificar material
    const modificarMaterial = async (id) => {
        try {
            await axios.put(`${API_URL}/modificarmateriales/${id}`, {
                nombre,
                cantidad_disponible: cantidad,
                id_zona: idZona
            });
            obtenerMateriales();
            limpiarFormulario();
            setEditando(null);
        } catch (error) {
            console.error("Error modificando material", error);
        }
    };

    // Eliminar material
    const eliminarMaterial = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este material?")) return;

        try {
            await axios.delete(`${API_URL}/eliminarmateriales/${id}`);
            obtenerMateriales();
        } catch (error) {
            console.error("Error eliminando material", error);
        }
    };

    // Cargar material en el formulario para edición
    const cargarEdicion = (material) => {
        setNombre(material.nombre);
        setCantidad(material.cantidad_disponible);
        setIdZona(material.id_zona);
        setEditando(material.id);
    };

    // Limpiar formulario
    const limpiarFormulario = () => {
        setNombre("");
        setCantidad(0);
        setIdZona("");
        setEditando(null);
    };

    return (
      <div>
        <MenuLateral>
        <h2>Gestión de Materiales</h2>
        <div className="contenedor-formulario">
          <h3>{editando ? "Editar Material" : "Crear Nuevo Material"}</h3>
          <form className="formulario-horizontal">
            <div className="fila">
              <div className="campo">
                <label>Nombre:</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="campo">
                <label>Cantidad:</label>
                <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} required />
              </div>
            </div>
            <div className="fila">
              <div className="campo">
                <label>Zona:</label>
                <select value={idZona} onChange={(e) => setIdZona(e.target.value)} required>
                  <option value="">Seleccionar Zona</option>
                  {zonas.map((zona) => (
                    <option key={zona.id} value={zona.id}>{zona.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="boton-container">
              <button type="button" className="btn-crear" onClick={editando ? () => modificarMaterial(editando) : crearMaterial}>
                {editando ? "Actualizar" : "Crear"} Material
              </button>
              <button type="button" className="btn-cancelar" onClick={limpiarFormulario}>Cancelar</button>
            </div>
          </form>
        </div>
  
        <main className="table">
          <section className="table__header">
            <h1>Materiales Disponibles</h1>
          </section>
          <section className="table__body">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Cantidad</th>
                  <th>Zona</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {materiales.map((material) => (
                  <tr key={material.id}>
                    <td>{material.nombre}</td>
                    <td>{material.cantidad_disponible}</td>
                    <td>{zonas.find((zona) => zona.id === material.id_zona)?.nombre || "Desconocido"}</td>
                    <td>
                      <button className="btn-editar" onClick={() => cargarEdicion(material)}>Editar</button>
                      <button className="btn-eliminar" onClick={() => eliminarMaterial(material.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </main>
        </MenuLateral>
      </div>
    );
  };
  
  export default Materiales;
  

  
