import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/auth/Login'

// --- COMENTAMOS LAS VISTAS QUE ESTÁN VACÍAS PARA EVITAR ERRORES ---
// import Registro from './pages/auth/Registro'
// import AdminDashboard from './pages/admin/Dashboard'
// import AdminUsuarios from './pages/admin/Usuarios'
// import AdminMovimientos from './pages/admin/Movimientos'
// import AdminBlockchain from './pages/admin/Blockchain'
// import ProductorDashboard from './pages/productor/Dashboard'
// import ProductorProductos from './pages/productor/Productos'
// import ProductorLotes from './pages/productor/Lotes'
// import ProductorInsumos from './pages/productor/Insumos'
// import Catalogo from './pages/cliente/Catalogo'
// import Carrito from './pages/cliente/Carrito'
// import Pedidos from './pages/cliente/Pedidos'
// import EscanearQR from './pages/cliente/EscanearQR'
// import Trazabilidad from './pages/public/Trazabilidad'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Toaster position="top-right" />
      <div className="container-fluid px-4 py-3">
        <Routes>
          {/* Única ruta activa por ahora */}
          <Route path="/login" element={<Login />} />
          
          {/* Redirección por defecto al login */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* --- COMENTAMOS EL RESTO DE RUTAS TEMPORALMENTE --- */}
          {/* <Route path="/registro" element={<Registro />} />
          <Route path="/trazabilidad/:codigoQr" element={<Trazabilidad />} />
          
          <Route path="/admin/dashboard" element={
            <PrivateRoute rol="ADMIN"><AdminDashboard /></PrivateRoute>
          } />
          <Route path="/admin/usuarios" element={
            <PrivateRoute rol="ADMIN"><AdminUsuarios /></PrivateRoute>
          } />
          <Route path="/admin/movimientos" element={
            <PrivateRoute rol="ADMIN"><AdminMovimientos /></PrivateRoute>
          } />
          <Route path="/admin/blockchain" element={
            <PrivateRoute rol="ADMIN"><AdminBlockchain /></PrivateRoute>
          } />

          <Route path="/productor/dashboard" element={
            <PrivateRoute rol="PRODUCTOR"><ProductorDashboard /></PrivateRoute>
          } />
          <Route path="/productor/productos" element={
            <PrivateRoute rol="PRODUCTOR"><ProductorProductos /></PrivateRoute>
          } />
          <Route path="/productor/lotes" element={
            <PrivateRoute rol="PRODUCTOR"><ProductorLotes /></PrivateRoute>
          } />
          <Route path="/productor/insumos" element={
            <PrivateRoute rol="PRODUCTOR"><ProductorInsumos /></PrivateRoute>
          } />

          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/cliente/carrito" element={
            <PrivateRoute rol="CLIENTE"><Carrito /></PrivateRoute>
          } />
          <Route path="/cliente/pedidos" element={
            <PrivateRoute rol="CLIENTE"><Pedidos /></PrivateRoute>
          } />
          <Route path="/cliente/escanear" element={
            <PrivateRoute rol="CLIENTE"><EscanearQR /></PrivateRoute>
          } />
          */}
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App