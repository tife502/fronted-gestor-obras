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
    const [isSignIn, setIsSignIn] = useState(true);

    const loginUsuario = async () => {
        try {
            const response = await axios.post("http://127.0.0.1:5000/api/usuarios/login", { 
                email: correo, 
                password: contraseña 
            });
            return response.data;  
        } catch (error) {
            if (error.response) {
                console.log("Error:", error.response.data);
                if (error.response.status === 404) {
                    alert("Usuario no registrado");
                    window.location.reload();
                } else if (error.response.status === 401) {
                    alert("Contraseña incorrecta");
                } else {
                    alert("No se pudo conectar con el servidor.");
                }
                return null; 
            }
        } 
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!correo || !contraseña) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const data = await loginUsuario();
        
        if (data && data.token) {
            localStorage.setItem("token", data.token);
            setUserId(data.token);
            navigate("/dashboard");
        }

    };

    return (
        <div className="container">
            <div className="forms-container">
                <div className="forms" id="forms">
                    {isSignIn ? (
                        <form onSubmit={handleSubmit}>
                            <h2>Login</h2>
                            <p>Don't have an account yet? <a href="#" onClick={() => setIsSignIn(false)}>Sign Up</a></p>
                            <div className="input-container">
                                <label htmlFor="email">Email Address</label>
                                <input 
                                    id="email" 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    value={correo} 
                                    onChange={(e) => setCorreo(e.target.value)} 
                                />
                            </div>
                            <div className="input-container">
                                <div className="forget">
                                    <label htmlFor="password">Password</label>
                                    <a href="/recovery Password">Forget Password</a>
                                </div>
                                <input 
                                    id="password" 
                                    type="password" 
                                    placeholder="Password" 
                                    value={contraseña} 
                                    onChange={(e) => setContraseña(e.target.value)} 
                                />
                            </div>
                            <div className="remember-me">
                                <input type="checkbox" id="checkbox" />
                                <label htmlFor="checkbox">Remember me</label>
                            </div>
                            <button type="submit">LOGIN</button>
                        </form>
                    ) : (
                        <form>
                            <h2>REGISTER</h2>
                            <p>Already registered? <a href="#" onClick={() => setIsSignIn(true)}>Sign In</a></p>
                            <div className="input-container">
                                <label htmlFor="name">Name</label>
                                <input id="name" type="text" placeholder="Name" />
                            </div>
                            <div className="input-container">
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" placeholder="example@gmail.com" />
                            </div>
                            <div className="input-container">
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" placeholder="Password" />
                            </div>
                            <div className="input-container">
                                <label htmlFor="verifyPassword">Verify Password</label>
                                <input id="verifyPassword" type="password" placeholder="Verify Password" />
                            </div>
                            <div className="remember-me">
                                <input type="checkbox" id="checkbox" />
                                <label htmlFor="checkbox">Remember me</label>
                            </div>
                            <button className="btn-register">REGISTER</button>
                        </form>
                    )}
                </div>
            </div>
            <div className="banner">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
                <section>
                    <h1>Welcome to <span>gestor de obras</span></h1>
                    <p>Login to access your account</p>
                    <img src="/banner.svg" alt="banner"/>
                </section>
            </div>
            <div className="sidebar">
                <div className="sign" id="btn-sign-in" onClick={() => setIsSignIn(true)}>
                    <img src="/key.svg" alt="key"/>
                    <span>Sign In</span>
                </div>
                <div className="sign" id="btn-sign-up" onClick={() => setIsSignIn(false)}>
                    <img src="/person.svg" alt="person"/>
                    <span>Sign Up</span>
                </div>
            </div>
        </div>
    );
}

export default Login;
