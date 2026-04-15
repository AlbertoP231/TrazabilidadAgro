import { useNavigate } from 'react-router-dom'
import useCarritoStore from '../../context/useCarritoStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Carrito = () => {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCarritoStore()
  const navigate = useNavigate()

  const handleComprar = async () => {
    if (items.length === 0) return
    try {
      await api.post('/pedidos', {
        detalles: items.map(i => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
          precio: i.precio
        }))
      })
      toast.success('¡Pedido realizado correctamente!')
      vaciar()
      navigate('/cliente/pedidos')
    } catch {
      toast.error('Error al procesar el pedido')
    }
  }

  if (items.length === 0) return (
    <div className="text-center py-5 text-muted">
      <i className="bi bi-cart-x" style={{ fontSize: '4rem' }}></i>
      <h5 className="mt-3">Tu carrito está vacío</h5>
      <button className="btn btn-success mt-3" onClick={() => navigate('/catalogo')}>
        <i className="bi bi-shop me-2"></i>Ver catálogo
      </button>
    </div>
  )

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-cart3 me-2 text-success"></i>Mi carrito
      </h4>

      <div className="row g-4">
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <table className="table mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.idProducto}>
                      <td className="fw-semibold">{item.nombre}</td>
                      <td>${item.precio?.toFixed(2)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            className="btn btn-outline-secondary btn-sm px-2 py-0"
                            onClick={() => cambiarCantidad(item.idProducto, item.cantidad - 1)}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold px-2">{item.cantidad}</span>
                          <button
                            className="btn btn-outline-secondary btn-sm px-2 py-0"
                            onClick={() => cambiarCantidad(item.idProducto, item.cantidad + 1)}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </td>
                      <td className="text-success fw-semibold">
                        ${(item.precio * item.cantidad).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => quitar(item.idProducto)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white fw-semibold">
              Resumen del pedido
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Productos</span>
                <span>{items.reduce((a, i) => a + i.cantidad, 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Total</span>
                <span className="fw-bold text-success fs-5">${total().toFixed(2)}</span>
              </div>
              <button className="btn btn-success w-100 fw-semibold" onClick={handleComprar}>
                <i className="bi bi-bag-check me-2"></i>Confirmar pedido
              </button>
              <button className="btn btn-outline-secondary w-100 mt-2" onClick={() => navigate('/catalogo')}>
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Carrito