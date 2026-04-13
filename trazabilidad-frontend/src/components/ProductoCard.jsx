import useCarritoStore from '../context/useCarritoStore'
import useAuthStore from '../context/useAuthStore'
import toast from 'react-hot-toast'

const ProductoCard = ({ producto }) => {
  const agregar = useCarritoStore(s => s.agregar)
  const cambiarCantidad = useCarritoStore(s => s.cambiarCantidad)
  const items = useCarritoStore(s => s.items)
  const { usuario } = useAuthStore()

  const itemEnCarrito = items.find(i => i.idProducto === producto.idProducto)

  const handleAgregar = () => {
    agregar(producto)
    toast.success(`${producto.nombre} agregado al carrito`)
  }

  return (
    <div className="card h-100 shadow-sm border-0" style={{ maxWidth: '220px' }}>
      {/* Imagen del producto */}
      <div
        className="bg-light d-flex align-items-center justify-content-center"
        style={{ height: '150px', borderRadius: '8px 8px 0 0', overflow: 'hidden' }}
      >
        {producto.imagenUrl ? (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="img-fluid"
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
          />
        ) : (
          <i className="bi bi-image text-secondary" style={{ fontSize: '3rem' }}></i>
        )}
      </div>

      <div className="card-body p-2 d-flex flex-column gap-1">
        {/* Nombre */}
        <h6 className="card-title mb-0 fw-semibold text-truncate" title={producto.nombre}>
          {producto.nombre}
        </h6>

        {/* Productor */}
        <small className="text-muted text-truncate">
          <i className="bi bi-person me-1"></i>{producto.nombreProductor}
        </small>

        {/* Precio */}
        <div className="fw-bold text-success fs-6">
          ${producto.precio?.toFixed(2)}
        </div>

        {/* Controles de cantidad + carrito */}
        {usuario?.rol === 'CLIENTE' && (
          <>
            {itemEnCarrito ? (
              <div className="d-flex align-items-center gap-1 mt-1">
                <button
                  className="btn btn-outline-secondary btn-sm px-2 py-0"
                  onClick={() => cambiarCantidad(producto.idProducto, itemEnCarrito.cantidad - 1)}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="fw-bold px-2">{itemEnCarrito.cantidad}</span>
                <button
                  className="btn btn-outline-secondary btn-sm px-2 py-0"
                  onClick={() => cambiarCantidad(producto.idProducto, itemEnCarrito.cantidad + 1)}
                >
                  <i className="bi bi-plus"></i>
                </button>
                <span className="ms-auto text-muted small">
                  ${(producto.precio * itemEnCarrito.cantidad).toFixed(2)}
                </span>
              </div>
            ) : (
              <button
                className="btn btn-success btn-sm mt-1 w-100"
                onClick={handleAgregar}
              >
                <i className="bi bi-cart-plus me-1"></i>Agregar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ProductoCard