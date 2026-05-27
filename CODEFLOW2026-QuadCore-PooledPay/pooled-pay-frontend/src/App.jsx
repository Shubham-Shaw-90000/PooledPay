import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import AdminDashboard from "./components/admin/AdminDashboard";
import DeliveryVerification from "./components/admin/DeliveryVerification";
import Dashboard from './components/Dashboard';
import './index.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/verify-delivery" element={<DeliveryVerification />} />
        <Route path="/"         element={<Navigate to="/login" replace />} />
        <Route path="/login"    element={<Auth type="login" />} />
        <Route path="/signup"   element={<Auth type="signup" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*"         element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
