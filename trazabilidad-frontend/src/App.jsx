import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'

import Login from './pages/auth/Login'
import Registro from './pages/auth/Registro'

import AdminDashboard from './pages/admin/Dashboard'
import AdminUsuarios from './pages/admin/Usuarios'
import AdminMovimientos from './pages/admin/Movimientos'
import AdminBlockchain from './pages/admin/Blockchain'
import AdminPedidos from './pages/admin/Pedidos'

import ProductorDashboard from './pages/productor/Dashboard'
import ProductorProductos from './pages/productor/Productos'
import ProductorLotes from './pages/productor/Lotes'
import ProductorInsumos from './pages/productor/Insumos'

import Catalogo from './pages/cliente/Catalogo'
import Carrito from './pages/cliente/Carrito'
import Pedidos from './pages/cliente/Pedidos'
import EscanearQR from './pages/cliente/EscanearQR'
import PagoExitoso from './pages/cliente/PagoExitoso'
import PagoFallido from './pages/cliente/PagoFallido'

import Trazabilidad from './pages/public/Trazabilidad'

// --- CONFIGURACIÓN GLOBAL DE IMÁGENES ---
// Al exportar esto, puedes importarlo en Catalogo, Carrito, etc.
// Cambia el puerto aquí una sola vez si tu API se mueve de puerto.
export const API_URL = "http://localhost:5126"; 
export const IMAGES_URL = `${API_URL}/Uploads`;

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />
      <div className="container-fluid px-4 py-3">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/trazabilidad/:codigoQr" element={<Trazabilidad />} />
          <Route path="/pago/exitoso" element={<PagoExitoso />} />
          <Route path="/pago/fallido" element={<PagoFallido />} />
          <Route path="/pago/pendiente" element={<PagoFallido />} />
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Rutas Administrativas */}
          <Route path="/admin/dashboard" element={<PrivateRoute rol="ADMIN"><AdminDashboard /></PrivateRoute>} />
          <Route path="/admin/usuarios" element={<PrivateRoute rol="ADMIN"><AdminUsuarios /></PrivateRoute>} />
          <Route path="/admin/movimientos" element={<PrivateRoute rol="ADMIN"><AdminMovimientos /></PrivateRoute>} />
          <Route path="/admin/blockchain" element={<PrivateRoute rol="ADMIN"><AdminBlockchain /></PrivateRoute>} />
          <Route path="/admin/pedidos" element={<PrivateRoute rol="ADMIN"><AdminPedidos /></PrivateRoute>} />

          {/* Rutas Productor */}
          <Route path="/productor/dashboard" element={<PrivateRoute rol="PRODUCTOR"><ProductorDashboard /></PrivateRoute>} />
          <Route path="/productor/productos" element={<PrivateRoute rol="PRODUCTOR"><ProductorProductos /></PrivateRoute>} />
          <Route path="/productor/lotes" element={<PrivateRoute rol="PRODUCTOR"><ProductorLotes /></PrivateRoute>} />
          <Route path="/productor/insumos" element={<PrivateRoute rol="PRODUCTOR"><ProductorInsumos /></PrivateRoute>} />

          {/* Rutas Cliente / Público */}
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/cliente/carrito" element={<PrivateRoute rol="CLIENTE"><Carrito /></PrivateRoute>} />
          <Route path="/cliente/pedidos" element={<PrivateRoute rol="CLIENTE"><Pedidos /></PrivateRoute>} />
          <Route path="/cliente/escanear" element={<PrivateRoute rol="CLIENTE"><EscanearQR /></PrivateRoute>} />
          
          {/* Redirección por defecto si la ruta no existe */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App