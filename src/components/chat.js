import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";

// Conexión al servidor de Socket.IO
const socket = io("http://localhost:5000"); // Asegúrate que el puerto y la URL sean correctos

const Chat = () => {
  const [messages, setMessages] = useState([]);         // Mensajes recibidos
  const [message, setMessage] = useState("");           // Mensaje que el usuario escribe
  const [usuarioId, setUsuarioId] = useState();         // ID del usuario autenticado
  const [conversacionId, setConversacionId] = useState(1); // ID fijo para chat grupal

  // Cargar usuarioId desde localStorage
  useEffect(() => {
    const storedId = localStorage.getItem("id");
    if (storedId) {
      setUsuarioId(parseInt(storedId));
      console.log("Usuario ID cargado:", storedId);
    } else {
      console.warn("No se encontró ID de usuario en localStorage.");
    }
  }, []);

  // Cargar mensajes y suscribirse a mensajes nuevos
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/mensajes/mensajes")
      .then((response) => {
        setMessages(response.data); // Carga inicial de mensajes
      })
      .catch((err) => console.error("Error al cargar mensajes:", err));

    // Escuchar los mensajes en tiempo real desde Socket.IO
    socket.on("receive_message", (msg) => {
      // Verificar si el mensaje ya está en el estado antes de agregarlo
      setMessages((prevMessages) => {
        // Solo agregar el mensaje si no está en el array
        if (!prevMessages.some(existingMsg => existingMsg.id === msg.id)) {
          return [...prevMessages, msg];
        }
        return prevMessages;
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Función para enviar mensaje
  const sendMessage = () => {
    if (!usuarioId) {
      alert("Usuario no identificado. Por favor inicia sesión.");
      return;
    }

    if (message.trim()) {
      const msgData = {
        usuario_id: usuarioId,
        destinatario_id: null, // null para mensajes grupales
        mensaje: message,
        conversacion_id: conversacionId,
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

  return (
    <div>
      <h3>Chat en tiempo real</h3>

      <div style={{ maxHeight: "400px", overflowY: "scroll", border: "1px solid #ccc", padding: "10px" }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.usuario_nombre || "Usuario"}:</strong> {msg.mensaje}
          </div>
        ))}
      </div>

      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Escribe tu mensaje"
        style={{ width: "80%", marginRight: "10px" }}
      />
      <button onClick={sendMessage}>Enviar</button>
    </div>
  );
};

export default Chat;
