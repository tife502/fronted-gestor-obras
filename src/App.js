import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/login';
import Administrador from './components/administrador';
import { UserProvider } from './context/userContext';
import Recovery from './components/RecoveryPass';
import ObrasApp from './components/obras';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/recovery Password" element={<Recovery />} />
          <Route path="/administrador" element={<Administrador />} />
          <Route path="/obra" element={<ObrasApp />} />
          <Route  path="*" element={<Login />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
