import React from "react";
import "../estilos/login.css";

function Recovery() {
    return (
        <div className="container">
            <div className="forms-container">
                <div className="forms" id="forms">
                    <form>
                        <h2>Recovery Password</h2>
                        <div className="input-container">
                            <label htmlFor="email">Email Address</label>
                            <input id="email" type="email" placeholder="you@example.com" />
                        </div>
                        <div className="input-container">
                            <div className="forget">
                                <label htmlFor="password">Password</label>
                            </div>
                            <input id="password" type="password" placeholder="Password" />
                        </div>
                        <div className="input-container">
                            <div className="forget">
                                <label htmlFor="password">verify Password</label>
                            </div>
                            <input id="password" type="password" placeholder="Password" />
                        </div>
                        <button type="submit">RECUPERAR CONTRASEÑA</button>
                    </form>
                </div>
            </div>
            <div className="banner">
                <div className="shape shape1"></div>
                <div className="shape shape2"></div>
                <div className="shape shape3"></div>
                <section>
                    <h1>Welcome to <span>gestor de obras</span></h1>
                    <p>Oh no! Forgot your password?</p>
                    <img src="/banner.svg" alt="dd" />
                </section>
            </div>
        </div>
    );
}

export default Recovery;
