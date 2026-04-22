import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import useCarritoStore from '../../context/useCarritoStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Tu public key de sandbox de MercadoPago — empieza con TEST-
initMercadoPago('TEST-AQUI-VA-TU-PUBLIC-KEY', { locale: 'es-MX' })

const Carrito = () => {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCarritoStore()
  const [preferenceId, setPreferenceId] = useState(null)
  const [idPedidoCreado, setIdPedidoCreado] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const navigate = useNavigate()

  const handleCrearPedido = async () => {
    if (items.length === 0) return
    setProcesando(true)
    try {
      // 1. Crear pedido en el backend
      const { data: pedido } = await api.post('/pedidos', {
        detalles: items.map(i => ({
          idProducto: i.idProducto,
          cantidad: i.cantidad,
          precio: i.precio
        }))
      })

      // 2. Crear preferencia de MercadoPago
      const { data: mp } = await api.post(`/pagos/crear-preferencia/${pedido.idPedido}`)

      setIdPedidoCreado(pedido.idPedido)
      setPreferenceId(mp.preferenceId)
      toast.success('Pedido creado — elige cómo pagar')

    } catch {
      toast.error('Error al crear el pedido')
    } finally {
      setProcesando(false)
    }
  }

  if (items.length === 0 && !preferenceId) return (
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
        {/* Lista de productos */}
        <div className="col-md-8">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {items.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-check-circle text-success fs-2"></i>
                  <p className="mt-2">Pedido creado, procede al pago</p>
                </div>
              ) : (
                <table className="table mb-0 align-middle">
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
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            {item.imagenUrl ? (
                              <img
                                src={item.imagenUrl.startsWith('http')
                                  ? item.imagenUrl
                                  : `http://localhost:5000${item.imagenUrl}`}
                                style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }}
                                alt={item.nombre}
                              />
                            ) : (
                              <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                style={{ width: 40, height: 40 }}>
                                <i className="bi bi-image text-muted"></i>
                              </div>
                            )}
                            <span className="fw-semibold">{item.nombre}</span>
                          </div>
                        </td>
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
              )}
            </div>
          </div>
        </div>

        {/* Resumen y pago */}
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

              <hr />

              {/* Botón crear pedido + pagar */}
              {!preferenceId ? (
                <button
                  className="btn btn-success w-100 fw-semibold"
                  onClick={handleCrearPedido}
                  disabled={procesando || items.length === 0}
                >
                  {procesando
                    ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                    : <><i className="bi bi-bag-check me-2"></i>Confirmar y pagar</>
                  }
                </button>
              ) : (
                <div>
                  <p className="text-muted small text-center mb-2">
                    Pedido #{idPedidoCreado} creado. Elige cómo pagar:
                  </p>
                  {/* Botón oficial de MercadoPago */}
                  <Wallet
                    initialization={{ preferenceId }}
                    customization={{ texts: { valueProp: 'smart_option' } }}
                  />
                  <button
                    className="btn btn-outline-secondary w-100 mt-2 btn-sm"
                    onClick={() => {
                      vaciar()
                      navigate('/cliente/pedidos')
                    }}
                  >
                    Ver mis pedidos
                  </button>
                </div>
              )}

              {!preferenceId && (
                <button
                  className="btn btn-outline-secondary w-100 mt-2"
                  onClick={() => navigate('/catalogo')}
                >
                  Seguir comprando
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Carrito