import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react'
import useCarritoStore from '../../context/useCarritoStore'
import api from '../../api/axios'
import toast from 'react-hot-toast'

// Tu public key de sandbox de MercadoPago
initMercadoPago('APP_USR-1722c681-0b23-44ec-b628-d069c6dfae08', { locale: 'es-MX' })

const Carrito = () => {
  const { items, quitar, cambiarCantidad, vaciar, total } = useCarritoStore()
  const [preferenceId, setPreferenceId] = useState(null)
  const [idPedidoCreado, setIdPedidoCreado] = useState(null)
  const [procesando, setProcesando] = useState(false)
  const navigate = useNavigate()

  // FUNCIÓN PARA GENERAR LA URL GLOBAL DE IMÁGENES
  const getImagenUrl = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http')) return ruta;
    // Extraemos solo el nombre del archivo para evitar errores de rutas relativas
    const nombreArchivo = ruta.split(/[\\/]/).pop();
    return `http://localhost:5126/Uploads/${nombreArchivo}`;
  };

  const handleCrearPedido = async () => {
    if (items.length === 0) return
    setProcesando(true)
    try {
      // 1. Crear pedido en el backend (Modificado para incluir Paso 5: idLote)
      const { data: pedido } = await api.post('/pedidos', {
        detalles: items.map(i => ({
          idProducto: i.idProducto,
          idLote: i.idLote, // Paso 5: Se envía el lote específico seleccionado en el catálogo
          cantidad: i.cantidad,
          precio: i.precio
        }))
      })

      // 2. Crear preferencia de MercadoPago
      const { data: mp } = await api.post(`/pagos/crear-preferencia/${pedido.idPedido}`)

      setIdPedidoCreado(pedido.idPedido)
      setPreferenceId(mp.preferenceId)
      toast.success('Pedido creado — elige cómo pagar')

    } catch (error) {
      const mensajeError = error.response?.data?.mensaje || 'Error al crear el pedido';
      toast.error(mensajeError, { duration: 5000 });
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
    <div className="container py-4">
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
                <div className="table-responsive">
                  <table className="table mb-0 align-middle">
                    <thead className="table-light">
                      <tr>
                        <th className="px-4">Producto</th>
                        <th>Precio</th>
                        <th>Cantidad</th>
                        <th>Subtotal</th>
                        <th className="text-end px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const urlFinal = getImagenUrl(item.imagenUrl);
                        return (
                          <tr key={item.idProducto}>
                            <td className="px-4">
                              <div className="d-flex align-items-center gap-3">
                                {urlFinal ? (
                                  <img
                                    src={urlFinal}
                                    alt={item.nombre}
                                    style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://placehold.co/50x50?text=Error';
                                    }}
                                  />
                                ) : (
                                  <div className="bg-light rounded d-flex align-items-center justify-content-center"
                                    style={{ width: 50, height: 50 }}>
                                    <i className="bi bi-image text-muted fs-4"></i>
                                  </div>
                                )}
                                <span className="fw-semibold text-dark">{item.nombre}</span>
                              </div>
                            </td>
                            <td>${item.precio?.toFixed(2)}</td>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                  style={{ width: '24px', height: '24px' }}
                                  onClick={() => cambiarCantidad(item.idProducto, item.cantidad - 1)}
                                >
                                  <i className="bi bi-dash"></i>
                                </button>
                                <span className="fw-bold mx-1">{item.cantidad}</span>
                                <button
                                  className="btn btn-outline-secondary btn-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
                                  style={{ width: '24px', height: '24px' }}
                                  onClick={() => cambiarCantidad(item.idProducto, item.cantidad + 1)}
                                >
                                  <i className="bi bi-plus"></i>
                                </button>
                              </div>
                            </td>
                            <td className="text-success fw-bold">
                              ${(item.precio * item.cantidad).toFixed(2)}
                            </td>
                            <td className="text-end px-4">
                              <button
                                className="btn btn-sm btn-link text-danger p-0"
                                onClick={() => quitar(item.idProducto)}
                                title="Quitar del carrito"
                              >
                                <i className="bi bi-trash fs-5"></i>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen y pago */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-header bg-success text-white fw-bold py-3 text-center">
              RESUMEN DEL PEDIDO
            </div>
            <div className="card-body bg-light">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Productos</span>
                <span className="fw-bold">{items.reduce((a, i) => a + i.cantidad, 0)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 border-top pt-2">
                <span className="fw-bold fs-5">Total</span>
                <span className="fw-bold text-success fs-4">${total().toFixed(2)}</span>
              </div>

              <div className="my-4">
                {!preferenceId ? (
                  <button
                    className="btn btn-success w-100 fw-bold py-2 shadow-sm"
                    onClick={handleCrearPedido}
                    disabled={procesando || items.length === 0}
                  >
                    {procesando
                      ? <><span className="spinner-border spinner-border-sm me-2"></span>Procesando...</>
                      : <><i className="bi bi-bag-check-fill me-2"></i>Confirmar y pagar</>
                    }
                  </button>
                ) : (
                  <div className="bg-white p-3 rounded border">
                    <p className="text-muted small text-center mb-3">
                      Pedido <strong>#{idPedidoCreado}</strong> generado correctamente.
                    </p>
                    <Wallet
                      initialization={{ preferenceId }}
                      customization={{ texts: { valueProp: 'smart_option' } }}
                    />
                    <button
                      className="btn btn-outline-success w-100 mt-3 btn-sm fw-bold"
                      onClick={() => {
                        vaciar()
                        navigate('/cliente/pedidos')
                      }}
                    >
                      Ir a mis pedidos <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  </div>
                )}
              </div>

              {!preferenceId && (
                <button
                  className="btn btn-outline-secondary w-100 border-0 text-decoration-underline"
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