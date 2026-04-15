import { useEffect, useState } from 'react'
import api from '../../api/axios'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    usuarios: 0, productos: 0, lotes: 0, pendientesBlockchain: 0
  })

  useEffect(() => {
    const cargar = async () => {
      try {
        const [usuarios, productos, pendientes] = await Promise.all([
          api.get('/usuarios'),
          api.get('/productos'),
          api.get('/blockchain/pendientes')
        ])
        setStats({
          usuarios: usuarios.data.length,
          productos: productos.data.length,
          pendientesBlockchain: pendientes.data.length
        })
      } catch {}
    }
    cargar()
  }, [])

  const tarjetas = [
    { titulo: 'Usuarios registrados', valor: stats.usuarios, icono: 'bi-people', color: 'primary' },
    { titulo: 'Productos en sistema', valor: stats.productos, icono: 'bi-box', color: 'success' },
    { titulo: 'Pendientes blockchain', valor: stats.pendientesBlockchain, icono: 'bi-link-45deg', color: 'warning' },
  ]

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-speedometer2 me-2 text-success"></i>Panel de administración
      </h4>

      <div className="row g-3 mb-4">
        {tarjetas.map((t, i) => (
          <div key={i} className="col-12 col-sm-6 col-md-4">
            <div className={`card border-0 shadow-sm border-start border-4 border-${t.color}`}>
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

      <div className="card border-0 shadow-sm">
        <div className="card-body text-center py-5 text-muted">
          <i className="bi bi-bar-chart-line" style={{ fontSize: '3rem' }}></i>
          <p className="mt-2">Selecciona una sección del menú para administrar el sistema</p>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard