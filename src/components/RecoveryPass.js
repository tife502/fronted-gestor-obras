import React, { useState } from "react";
import "../estilos/login.css";
import axios from "axios";

function Recovery() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [verifyPassword, setVerifyPassword] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState(1);

    // Paso 1: Solicitar código de recuperación
    const handleRequestReset = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/api/usuarios/recuperar", { email });
            alert(response.data.mensaje || response.data.error);
            setStep(2); // Si todo sale bien, avanzar al siguiente paso
        } catch (error) {
            console.error("Error en la solicitud:", error.response ? error.response.data : error.message);
            alert(error.response?.data?.error || "Error en la solicitud.");
        }
    };

    // Paso 2: Enviar nueva contraseña
    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (password !== verifyPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await axios.post("http://localhost:5000/api/usuarios/resetear", {
                email,
                password,
                token,
            });
            alert(response.data.mensaje || response.data.error);
            window.location.href = "/login"; // Redirigir tras éxito
        } catch (error) {
            console.error("Error en la solicitud:", error.response ? error.response.data : error.message);
            alert(error.response?.data?.error || "Error en la solicitud.");
        }
    };

    return (
        <div className="container">
            <div className="forms-container">
                <div className="forms" id="forms">
                    {step === 1 ? (
                        <form onSubmit={handleRequestReset}>
                            <h2>Recuperar Contraseña</h2>
                            <div className="input-container">
                                <label htmlFor="email">Correo Electrónico</label>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Enviar Código</button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword}>
                            <h2>Restablecer Contraseña</h2>
                            <div className="input-container">
                                <label htmlFor="token">Código de recuperación</label>
                                <input
                                    id="token"
                                    type="text"
                                    placeholder="Introduce el código enviado"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="password">Nueva Contraseña</label>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="input-container">
                                <label htmlFor="verifyPassword">Confirmar Contraseña</label>
                                <input
                                    id="verifyPassword"
                                    type="password"
                                    placeholder="Confirmar contraseña"
                                    value={verifyPassword}
                                    onChange={(e) => setVerifyPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit">Actualizar Contraseña</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Recovery;
