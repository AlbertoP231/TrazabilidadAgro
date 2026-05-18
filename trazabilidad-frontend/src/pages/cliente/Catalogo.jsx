import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ProductoCard from '../../components/ProductoCard'

const Catalogo = () => {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Cambio de endpoint para listar lotes con inventario disponible para la venta
    api.get('/lotes/catalogo')
      .then(({ data }) => setProductos(data))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.nombreProductor?.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
        <div className="d-flex align-items-center flex-wrap gap-2">
          <h4 className="fw-bold mb-0">
            <i className="bi bi-shop me-2 text-success"></i>Catálogo de productos
          </h4>
          {/* Indicación de unidad de medida y precio en kg */}
          <span className="badge bg-light text-dark border ms-md-2 py-2">
            <i className="bi bi-info-circle-fill text-success me-1"></i>Precio expresado en kg
          </span>
        </div>
        <div className="input-group" style={{ maxWidth: '280px' }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar producto o productor..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success"></div>
          <p className="mt-2 text-muted">Cargando productos...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox" style={{ fontSize: '3rem' }}></i>
          <p className="mt-2">No se encontraron productos</p>
        </div>
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {filtrados.map(producto => (
            // Se utiliza idLote como key única dado que el origen de datos lista lotes específicos
            <ProductoCard key={producto.idLote} producto={producto} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalogo