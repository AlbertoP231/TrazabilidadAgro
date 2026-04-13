import { useEffect, useState } from 'react'
import api from '../../api/axios'
import ProductoCard from '../../components/ProductoCard'

const Catalogo = () => {
  const [productos, setProductos] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/productos')
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
        <h4 className="fw-bold mb-0">
          <i className="bi bi-shop me-2 text-success"></i>Catálogo de productos
        </h4>
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
            <ProductoCard key={producto.idProducto} producto={producto} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Catalogo