import useCarritoStore from '../context/useCarritoStore'
import useAuthStore from '../context/useAuthStore'
import toast from 'react-hot-toast'

const ProductoCard = ({ producto }) => {
  const agregar = useCarritoStore(s => s.agregar)
  const cambiarCantidad = useCarritoStore(s => s.cambiarCantidad)
  const items = useCarritoStore(s => s.items)
  const { usuario } = useAuthStore()

  const itemEnCarrito = items.find(i => i.idProducto === producto.idProducto)

  // FUNCIÓN PARA GENERAR LA URL GLOBAL
  const getImagenUrl = (ruta) => {
    if (!ruta) return null;
    
    // Si ya es una URL completa (ej: de un CDN externo), la usamos tal cual
    if (ruta.startsWith('http')) return ruta;

    // Limpiamos la ruta: extraemos solo el nombre del archivo.
    // Esto previene errores si la DB guardó "C:\Uploads\foto.jpg" o "/Uploads/foto.jpg"
    const nombreArchivo = ruta.split(/[\\/]/).pop();

    // Retornamos la URL apuntando a tu API de .NET (Puerto 5126)
    return `http://localhost:5126/Uploads/${nombreArchivo}`;
  };

  const handleAgregar = () => {
    agregar(producto)
    toast.success(`${producto.nombre} añadido al carrito`)
  }

  const urlFinal = getImagenUrl(producto.imagenUrl);

  return (
    <div className="card h-100 shadow-sm border-0" style={{ maxWidth: '220px', borderRadius: '12px' }}>
      {/* Contenedor de Imagen */}
      <div
        className="bg-light d-flex align-items-center justify-content-center"
        style={{ height: '150px', borderRadius: '12px 12px 0 0', overflow: 'hidden' }}
      >
        {urlFinal ? (
          <img
            src={urlFinal}
            alt={producto.nombre}
            className="img-fluid"
            style={{ objectFit: 'cover', height: '100%', width: '100%' }}
            onError={(e) => {
              e.target.onerror = null; 
              // Fallback estético por si el archivo físico fue borrado del servidor
              e.target.src = 'https://placehold.co/220x150/f8f9fa/adb5bd?text=Imagen+no+encontrada';
            }}
          />
        ) : (
          <div className="text-center text-muted">
            <i className="bi bi-image" style={{ fontSize: '3rem' }}></i>
            <p className="small mb-0">Sin foto</p>
          </div>
        )}
      </div>

      <div className="card-body p-3 d-flex flex-column gap-1">
        {/* Título del producto */}
        <h6 className="card-title mb-0 fw-bold text-dark text-truncate" title={producto.nombre}>
          {producto.nombre}
        </h6>

        {/* Productor con icono de ubicación */}
        <small className="text-muted text-truncate">
          <i className="bi bi-geo-alt me-1 text-success"></i>
          {producto.nombreProductor || 'Productor Local'}
        </small>

        {/* Precio destacado */}
        <div className="fw-bold text-success fs-5 mt-1">
          ${producto.precio?.toFixed(2)} 
          <span className="ms-1" style={{ fontSize: '0.7rem', color: '#6c757d' }}>MXN</span>
        </div>

        {/* Acciones del Carrito (Solo para Clientes) */}
        {usuario?.rol === 'CLIENTE' && (
          <div className="mt-auto pt-2">
            {itemEnCarrito ? (
              <div className="d-flex flex-column gap-2">
                <div className="d-flex align-items-center justify-content-between bg-light rounded-pill px-2 py-1">
                  <button
                    className="btn btn-sm btn-link text-dark p-0"
                    onClick={() => cambiarCantidad(producto.idProducto, itemEnCarrito.cantidad - 1)}
                  >
                    <i className="bi bi-dash-circle-fill fs-5"></i>
                  </button>
                  
                  <span className="fw-bold small">{itemEnCarrito.cantidad}</span>
                  
                  <button
                    className="btn btn-sm btn-link text-dark p-0"
                    onClick={() => cambiarCantidad(producto.idProducto, itemEnCarrito.cantidad + 1)}
                  >
                    <i className="bi bi-plus-circle-fill fs-5"></i>
                  </button>
                </div>
                <div className="text-center">
                   <small className="text-muted fw-bold" style={{ fontSize: '0.75rem' }}>
                    Subtotal: ${(producto.precio * itemEnCarrito.cantidad).toFixed(2)}
                  </small>
                </div>
              </div>
            ) : (
              <button
                className="btn btn-success btn-sm w-100 fw-bold rounded-pill shadow-sm"
                onClick={handleAgregar}
              >
                <i className="bi bi-cart-plus me-2"></i>Añadir
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductoCard;