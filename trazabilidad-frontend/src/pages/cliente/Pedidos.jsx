import { useEffect, useState } from 'react'
import api from '../../api/axios'

const Pedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    api.get('/pedidos')
      .then(({ data }) => setPedidos(data))
      .finally(() => setCargando(false))
  }, [])

  const estadoColor = (estado) => {
    if (estado === 'PENDIENTE') return 'warning'
    if (estado === 'ENTREGADO') return 'success'
    return 'secondary'
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-bag me-2 text-primary"></i>Mis pedidos
      </h4>

      {cargando ? (
        <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
      ) : pedidos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-bag-x fs-1"></i>
          <p className="mt-2">No tienes pedidos todavía</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {pedidos.map(p => (
            <div key={p.idPedido} className="card border-0 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center bg-light">
                <span className="fw-semibold">Pedido #{p.idPedido}</span>
                <div className="d-flex align-items-center gap-2">
                  <small className="text-muted">{new Date(p.fecha).toLocaleDateString()}</small>
                  <span className={`badge bg-${estadoColor(p.estado)}`}>{p.estado}</span>
                </div>
              </div>
              <div className="card-body p-0">
                <table className="table table-sm mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.detalles?.map(d => (
                      <tr key={d.idDetalle}>
                        <td>{d.nombreProducto}</td>
                        <td>{d.cantidad}</td>
                        <td>${d.precio?.toFixed(2)}</td>
                        <td className="text-success fw-semibold">
                          ${(d.precio * d.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="text-end fw-bold">Total:</td>
                      <td className="fw-bold text-success">${p.total?.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Pedidos