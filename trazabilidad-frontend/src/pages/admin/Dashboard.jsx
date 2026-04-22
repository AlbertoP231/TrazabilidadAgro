import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usuarios: 0,
    productos: 0,
    pendientesBlockchain: 0,
    pedidosPendientes: 0
  })
  const navigate = useNavigate()

  useEffect(() => {
    const cargar = async () => {
      try {
        const [usuarios, productos, pendientes, pedidos] = await Promise.all([
          api.get('/usuarios'),
          api.get('/productos'),
          api.get('/blockchain/pendientes'),
          api.get('/pedidos/todos')
        ])
        setStats({
          usuarios: usuarios.data.length,
          productos: productos.data.length,
          pendientesBlockchain: pendientes.data.length,
          pedidosPendientes: pedidos.data.filter(p => p.estado === 'PENDIENTE').length
        })
      } catch {}
    }
    cargar()
  }, [])

  const tarjetas = [
    {
      titulo: 'Usuarios registrados',
      valor: stats.usuarios,
      icono: 'bi-people',
      color: 'primary',
      ruta: '/admin/usuarios'
    },
    {
      titulo: 'Productos en sistema',
      valor: stats.productos,
      icono: 'bi-box',
      color: 'success',
      ruta: null
    },
    {
      titulo: 'Pendientes blockchain',
      valor: stats.pendientesBlockchain,
      icono: 'bi-link-45deg',
      color: 'warning',
      ruta: '/admin/blockchain'
    },
    {
      titulo: 'Pedidos pendientes',
      valor: stats.pedidosPendientes,
      icono: 'bi-bag',
      color: 'danger',
      ruta: '/admin/pedidos'
    },
  ]

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2 text-success"></i>Panel de administración
      </h4>

      <div className="row g-3 mb-4">
        {tarjetas.map((t, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-3">
            <div
              className={`card border-0 shadow-sm border-start border-4 border-${t.color} h-100 ${t.ruta ? 'cursor-pointer' : ''}`}
              style={{ cursor: t.ruta ? 'pointer' : 'default' }}
              onClick={() => t.ruta && navigate(t.ruta)}
            >
              <div className="card-body d-flex align-items-center gap-3">
                <div className={`bg-${t.color} bg-opacity-10 rounded-circle p-3`}>
                  <i className={`bi ${t.icono} fs-4 text-${t.color}`}></i>
                </div>
                <div>
                  <div className="fs-2 fw-bold">{t.valor}</div>
                  <div className="text-muted small">{t.titulo}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="row g-3">
        <div className="col-12">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-light fw-semibold">
              <i className="bi bi-lightning me-2 text-warning"></i>Accesos rápidos
            </div>
            <div className="card-body d-flex flex-wrap gap-2">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/admin/usuarios')}
              >
                <i className="bi bi-person-plus me-1"></i>Gestionar usuarios
              </button>
              <button
                className="btn btn-outline-warning btn-sm"
                onClick={() => navigate('/admin/movimientos')}
              >
                <i className="bi bi-plus-circle me-1"></i>Registrar movimiento
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => navigate('/admin/blockchain')}
              >
                <i className="bi bi-link-45deg me-1"></i>Enviar a blockchain
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => navigate('/admin/pedidos')}
              >
                <i className="bi bi-bag me-1"></i>Ver pedidos pendientes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard