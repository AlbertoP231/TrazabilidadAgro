import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminPedidos = () => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState('')

  const estados = ['PENDIENTE', 'EN_PROCESO', 'ENTREGADO', 'CANCELADO']

  const estadoColor = (estado) => {
    if (estado === 'PENDIENTE') return 'warning'
    if (estado === 'EN_PROCESO') return 'primary'
    if (estado === 'ENTREGADO') return 'success'
    if (estado === 'CANCELADO') return 'danger'
    return 'secondary'
  }

  const estadoIcono = (estado) => {
    if (estado === 'PENDIENTE') return 'bi-hourglass'
    if (estado === 'EN_PROCESO') return 'bi-gear'
    if (estado === 'ENTREGADO') return 'bi-check-circle'
    if (estado === 'CANCELADO') return 'bi-x-circle'
    return 'bi-circle'
  }

  const cargar = () => {
    api.get('/pedidos/todos')
      .then(({ data }) => setPedidos(data))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const handleCambiarEstado = async (idPedido, nuevoEstado) => {
    try {
      await api.put(`/pedidos/${idPedido}/estado`, { estado: nuevoEstado })
      toast.success(`Pedido actualizado a ${nuevoEstado}`)
      cargar()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const filtrados = filtroEstado
    ? pedidos.filter(p => p.estado === filtroEstado)
    : pedidos

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-bag me-2 text-success"></i>Gestión de pedidos
        </h4>
        <div className="d-flex gap-2 flex-wrap">
          <button
            className={`btn btn-sm ${filtroEstado === '' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFiltroEstado('')}
          >
            Todos ({pedidos.length})
          </button>
          {estados.map(e => (
            <button
              key={e}
              className={`btn btn-sm btn-outline-${estadoColor(e)} ${filtroEstado === e ? 'active' : ''}`}
              onClick={() => setFiltroEstado(e)}
            >
              {e} ({pedidos.filter(p => p.estado === e).length})
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div className="text-center py-4"><div className="spinner-border text-success"></div></div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-1"></i>
          <p className="mt-2">No hay pedidos con este estado</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filtrados.map(p => (
            <div key={p.idPedido} className="card border-0 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2 bg-light">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold">Pedido #{p.idPedido}</span>
                  <span className={`badge bg-${estadoColor(p.estado)}`}>
                    <i className={`bi ${estadoIcono(p.estado)} me-1`}></i>{p.estado}
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div className="text-muted small">
                    <i className="bi bi-person me-1"></i>{p.nombreCliente} — {p.emailCliente}
                  </div>
                  <small className="text-muted">
                    {new Date(p.fecha).toLocaleDateString()}
                  </small>
                </div>
              </div>

              <div className="card-body">
                <div className="row g-3">
                  {/* Detalle de productos */}
                  <div className="col-md-8">
                    <table className="table table-sm mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>Precio</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.detalles?.map((d, i) => (
                          <tr key={i}>
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

                  {/* Cambiar estado */}
                  <div className="col-md-4">
                    <div className="border rounded p-3 bg-light">
                      <p className="fw-semibold small mb-2">Cambiar estado del pedido</p>
                      <div className="d-flex flex-column gap-2">
                        {estados.map(e => (
                          <button
                            key={e}
                            className={`btn btn-sm ${p.estado === e
                              ? `btn-${estadoColor(e)}`
                              : `btn-outline-${estadoColor(e)}`}`}
                            onClick={() => p.estado !== e && handleCambiarEstado(p.idPedido, e)}
                            disabled={p.estado === e}
                          >
                            <i className={`bi ${estadoIcono(e)} me-1`}></i>{e}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminPedidos