import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminMovimientos = () => {
  const [movimientos, setMovimientos] = useState([])
  const [lotes, setLotes] = useState([])
  const [form, setForm] = useState({ idLote: '', tipoMovimiento: '', descripcion: '' })
  const [cargando, setCargando] = useState(true)

  const tiposMovimiento = ['Cosecha', 'Transporte', 'Llegada almacén', 'Control calidad', 'Distribución', 'Entrega final']

  const cargar = async () => {
    try {
      const [m, l] = await Promise.all([
        api.get('/movimientos'),
        api.get('/productos').then(async () => {
          const lotesRes = await api.get('/admin/lotes').catch(() => ({ data: [] }))
          return lotesRes
        })
      ])
      setMovimientos(m.data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    try {
      await api.post('/movimientos', form)
      toast.success('Movimiento registrado')
      setForm({ idLote: '', tipoMovimiento: '', descripcion: '' })
      cargar()
    } catch {
      toast.error('Error al registrar movimiento')
    }
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-arrow-left-right me-2 text-warning"></i>Registro de movimientos
      </h4>

      {/* Formulario */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-warning text-dark fw-semibold">
          <i className="bi bi-plus-circle me-2"></i>Nuevo movimiento
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardar}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">ID del lote</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Ej: 1"
                  value={form.idLote}
                  onChange={e => setForm({ ...form, idLote: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Tipo de movimiento</label>
                <select
                  className="form-select"
                  value={form.tipoMovimiento}
                  onChange={e => setForm({ ...form, tipoMovimiento: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  {tiposMovimiento.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Detalle del movimiento"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-warning text-dark mt-3">
              <i className="bi bi-check-lg me-1"></i>Registrar movimiento
            </button>
          </form>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-4"><div className="spinner-border text-warning"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Lote</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>Fecha</th>
                    <th>Registrado por</th>
                    <th>TX Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.map(m => (
                    <tr key={m.idMovimiento}>
                      <td className="text-muted">{m.idMovimiento}</td>
                      <td>{m.idLote}</td>
                      <td><span className="badge bg-warning text-dark">{m.tipoMovimiento}</span></td>
                      <td className="text-muted small">{m.descripcion || '—'}</td>
                      <td className="small">{new Date(m.fecha).toLocaleString()}</td>
                      <td>{m.registradoPorNombre}</td>
                      <td>
                        {m.txHash
                          ? <a href={`https://etherscan.io/tx/${m.txHash}`} target="_blank" rel="noreferrer" className="text-primary small font-monospace">
                            {m.txHash.slice(0, 10)}...
                          </a>
                          : <span className="badge bg-light text-muted border">Sin hash</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminMovimientos