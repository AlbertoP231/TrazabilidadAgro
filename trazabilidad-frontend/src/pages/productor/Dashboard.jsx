import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../context/useAuthStore'

const ProductorDashboard = () => {
  const { usuario } = useAuthStore()
  const [stats, setStats] = useState({ productos: 0, lotes: 0 })

  useEffect(() => {
    const cargar = async () => {
      try {
        const [prods, lotes] = await Promise.all([
          api.get('/productos/mis-productos'),
          api.get('/lotes')
        ])
        setStats({ productos: prods.data.length, lotes: lotes.data.length })
      } catch {}
    }
    cargar()
  }, [])

  const acciones = [
    { titulo: 'Mis productos', desc: 'Registra y gestiona tus productos', icono: 'bi-box', color: 'success', ruta: '/productor/productos' },
    { titulo: 'Mis lotes', desc: 'Registra lotes y genera QR', icono: 'bi-stack', color: 'primary', ruta: '/productor/lotes' },
    { titulo: 'Insumos', desc: 'Declara agua, fertilizantes e insecticidas', icono: 'bi-droplet', color: 'info', ruta: '/productor/insumos' },
  ]

  return (
    <div>
      <h4 className="fw-bold mb-1">
        <i className="bi bi-person-check me-2 text-success"></i>Bienvenido, {usuario?.nombre}
      </h4>
      <p className="text-muted mb-4">Panel del productor</p>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fs-1 fw-bold text-success">{stats.productos}</div>
            <div className="text-muted small">Productos</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm text-center py-3">
            <div className="fs-1 fw-bold text-primary">{stats.lotes}</div>
            <div className="text-muted small">Lotes activos</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {acciones.map((a, i) => (
          <div key={i} className="col-12 col-md-4">
            <Link to={a.ruta} className="text-decoration-none">
              <div className="card border-0 shadow-sm h-100 card-hover">
                <div className="card-body d-flex align-items-center gap-3 p-3">
                  <div className={`bg-${a.color} bg-opacity-10 rounded-circle p-3`}>
                    <i className={`bi ${a.icono} fs-3 text-${a.color}`}></i>
                  </div>
                  <div>
                    <div className="fw-semibold">{a.titulo}</div>
                    <div className="text-muted small">{a.desc}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProductorDashboard