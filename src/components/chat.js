import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import MenuLateral from "./menulateral";

// Conexión al servidor de Socket.IO
const socket = io("http://localhost:5000");

const Chat = () => {
  const [messages, setMessages] = useState([]);         // Mensajes recibidos
  const [message, setMessage] = useState("");           // Mensaje que el usuario escribe
  const [usuarioId, setUsuarioId] = useState();         // ID del usuario autenticado
  const [conversacionId, setConversacionId] = useState("grupal"); // ID para chat grupal o privado
  const [usuarios, setUsuarios] = useState([]);         // Lista de usuarios
  const chatRef = useRef(null);

  // Cargar usuarioId desde localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) {
      setUsuarioId(parseInt(storedId));
    }
  }, []);

  // Cargar lista de usuarios
  useEffect(() => {
    axios.get("http://localhost:5000/api/usuarios/mostrarusuarios")
      .then(res => setUsuarios(res.data))
      .catch(() => setUsuarios([]));
  }, []);

  // Cargar mensajes y suscribirse a mensajes nuevos
  useEffect(() => {
    let url = "http://localhost:5000/api/mensajes/mensajes";
    if (conversacionId !== "grupal") {
      url += `?conversacion_id=${conversacionId}`;
    } else {
      url += `?conversacion_id=grupal`;
    }
    axios
      .get(url)
      .then((response) => {
        setMessages(response.data);
      })
      .catch((err) => console.error("Error al cargar mensajes:", err));

    // Escuchar los mensajes en tiempo real desde Socket.IO
    socket.on("receive_message", (msg) => {
      // Solo agregar mensajes de la conversación actual
      if (
        (conversacionId === "grupal" && msg.conversacion_id === "grupal") ||
        (conversacionId !== "grupal" && msg.conversacion_id === conversacionId)
      ) {
        setMessages((prevMessages) => {
          if (!prevMessages.some(existingMsg => existingMsg.id === msg.id)) {
            return [...prevMessages, msg];
          }
          return prevMessages;
        });
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [conversacionId]);

  // Scroll automático al final del chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Obtener nombre del usuario por ID
  const getNombreUsuario = (id) => {
    const user = usuarios.find(u => u.id === id);
    return user ? user.nombre : "Usuario";
  };

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!usuarioId) {
      alert("Usuario no identificado. Por favor inicia sesión.");
      return;
    }

    if (message.trim()) {
      // Para chat privado, extrae destinatario_id del conversacionId
      let destinatario_id = null;
      if (conversacionId !== "grupal") {
        // conversacionId formato: priv_3_7 (3 y 7 son IDs de usuarios)
        const ids = conversacionId.split("_").slice(1).map(Number);
        destinatario_id = ids.find(id => id !== usuarioId);
      }

      const msgData = {
        usuario_id: usuarioId,
        destinatario_id: destinatario_id,
        mensaje: message,
        conversacion_id: conversacionId === "grupal" ? "grupal" : conversacionId,
      };

      // Emitir el mensaje por Socket.IO
      socket.emit("send_message", msgData);

      // Guardar el mensaje en la base de datos
      axios
        .post("http://localhost:5000/api/mensajes/mensaje", msgData)
        .then(() => {
          setMessage(""); // Limpiar el input
        })
        .catch((err) => console.error("Error al guardar el mensaje:", err));
    }
  };

  // Cambiar de conversación (grupal o privada)
  const cambiarConversacion = (nuevoId) => {
    setConversacionId(nuevoId);
    setMessages([]); // Limpia mensajes al cambiar de chat
  };

  return (
    <MenuLateral>
      <div style={{ display: "flex", gap: 24 }}>
        {/* Lista de usuarios */}
        <div style={{ minWidth: 200 }}>
          <h4>Conversaciones</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li
              style={{
                cursor: "pointer",
                fontWeight: conversacionId === "grupal" ? "bold" : "normal",
                marginBottom: 8,
              }}
              onClick={() => cambiarConversacion("grupal")}
            >
              Chat grupal
            </li>
            {usuarios
              .filter(u => u.id !== usuarioId)
              .map(u => {
                // ID único para chat privado entre dos usuarios (ordenados)
                const privId = ["priv", ...[usuarioId, u.id].sort((a, b) => a - b)].join("_");
                return (
                  <li
                    key={u.id}
                    style={{
                      cursor: "pointer",
                      fontWeight: conversacionId === privId ? "bold" : "normal",
                      marginBottom: 4,
                    }}
                    onClick={() => cambiarConversacion(privId)}
                  >
                    {u.nombre}
                  </li>
                );
              })}
          </ul>
        </div>
        {/* Chat */}
        <div style={{ flex: 1 }}>
          <h3>
            {conversacionId === "grupal"
              ? "Chat grupal"
              : `Chat con ${getNombreUsuario(
                  Number(conversacionId.split("_").find(id => Number(id) !== usuarioId))
                )}`}
          </h3>
          <div
            ref={chatRef}
            style={{ maxHeight: "400px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}
          >
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{getNombreUsuario(msg.usuario_id)}:</strong> {msg.mensaje}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe tu mensaje"
            style={{ width: "80%", marginRight: "10px" }}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Enviar</button>
        </div>
      </div>
    </MenuLateral>
  );
};

export default Chat;
