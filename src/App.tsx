import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/LoginPage';
import Dashboard from './pages/DashboardPage';
// Aquí importaremos el Dashboard cuando lo creemos:
// import Dashboard from './pages/Dashboard'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Pantalla de Login */}
        <Route path="/login" element={<Login />} />

        {/* Pantalla del Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;