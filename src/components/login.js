import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import axios from "axios";
import "../estilos/login.css";

function Login() {
    const [correo, setCorreo] = useState("");
    const [contraseña, setContraseña] = useState("");
    const { setUserId } = useUser();
    const navigate = useNavigate();

    const loginUsuario = () => {
        axios.post('http://localhost:5000/api/usuarios/login', {
            email: correo,
            password: contraseña
        })
            .then(response => {
                setUserId(response.data.userId);
            })
            .catch(error => {
                if (error.response && error.response.status === 401) {
                    alert("Contraseña incorrecta");
                } else if (error.response && error.response.status === 404) {
                    alert("Usuario no encontrado");
                }
            });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!correo || !contraseña) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        try {
            const response = await loginUsuario(correo, contraseña);

            if (response && response.token) {
                setUserId(response.token);  
                navigate("/dashboard"); 
            } else {
                alert("Usuario o contraseña incorrectos.");
            }
        } catch (error) {
            if (error.response) {
                if (error.response.status === 401) {
                    alert("Contraseña o correo incorrecto");
                } else if (error.response.status === 404) {
                    alert("Usuario no encontrado.");
                } else {
                    alert("Error en el servidor.");
                }
            } else {
                alert("No se pudo conectar con el servidor.");
            }
        }
    };

    return (
        <div class="wrapper">
            <form onSubmit={handleSubmit}>
                <h1>LOGIN</h1>
                <div class="input-box">
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                    />
                </div>
                <div class="input-box">
                    <input
                        type="text"
                        placeholder="Contraseña"
                        value={contraseña}
                        onChange={(e) => setContraseña(e.target.value)}
                    />
                </div>
                <button type="submit" class="btn">Iniciar Sesión</button>
                <div class="register-link">
                    <p>No tienes una cuenta? <a href="#">Registrarse</a></p>
                </div>
                <div class="remember-forgot">
                    <a href="#">Olvidé mi contraseña</a>
                </div>

            </form>
        </div>
    );
}

export default Login;