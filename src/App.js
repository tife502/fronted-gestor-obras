import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Administrador from './components/administrador';
import { UserProvider } from './context/userContext';
import Recovery from './components/RecoveryPass';
import SolicitudMaterial from './components/solicitud';
import Asistencia from './components/asistencia';
import Materiales from './components/materiales';
import Zonas from './components/zonas';
import Tareas from './components/tareas';
import Chat from './components/chat';
import Bodega from "./components/bodega";
import Inventario from "./components/Inventario";

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recovery Password" element={<Recovery />} />
          <Route path="/administrador" element={<Administrador />} />
          <Route path="/zonas" element={<Zonas />} />
          <Route  path="/materiales" element={<Materiales />} />
          <Route  path="/solicitudes" element={<SolicitudMaterial />} />
          <Route  path="/asistencia" element={<Asistencia />} />
          <Route  path="/tareas" element={<Tareas />} />
          <Route  path="/chats" element={<Chat />} />
          <Route  path="/*" element={<Login />} />
          <Route path= "/bodega" element={<Bodega />} />
          <Route path= "/inventario" element={<Inventario />} />

        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;


