import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminMovimientos = () => {
  const [movimientos, setMovimientos] = useState([])
  const [lotes, setLotes] = useState([])
  const [form, setForm] = useState({ idLote: '', tipoMovimiento: '', descripcion: '' })
  const [cargando, setCargando] = useState(true)

  const tiposMovimiento = [
    'Cosecha', 
    'Transporte', 
    'Llegada almacén', 
    'Control calidad', 
    'Distribución', 
    'Entrega final'
  ]

  const cargarDatos = async () => {
    setCargando(true)
    try {
      // Nota: Asegúrate que en tu Backend el endpoint sea /api/lotes o /api/admin/lotes
      const [resMovimientos, resLotes] = await Promise.all([
        api.get('/movimientos'),
        api.get('/lotes').catch(() => ({ data: [] })) // Cambiado para evitar el 404 si la ruta es distinta
      ])
      
      setMovimientos(resMovimientos.data)
      setLotes(resLotes.data)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error('Error al conectar con el servidor')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { 
    cargarDatos() 
  }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    const loadingToast = toast.loading('Registrando en Blockchain...')
    
    try {
      await api.post('/movimientos', form)
      toast.success('Movimiento registrado e indexado en la red', { id: loadingToast })
      setForm({ idLote: '', tipoMovimiento: '', descripcion: '' })
      cargarDatos()
    } catch (error) {
      toast.error('Error al registrar movimiento', { id: loadingToast })
    }
  }

  return (
    <div className="container-fluid py-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-arrow-left-right me-2 text-warning"></i>Trazabilidad de Lotes (Blockchain)
      </h4>

      {/* Formulario de Registro */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-dark text-white fw-semibold">
          <i className="bi bi-plus-circle me-2"></i>Registrar Nuevo Evento de Cadena
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardar}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Seleccionar Lote</label>
                <select 
                  className="form-select"
                  value={form.idLote}
                  onChange={e => setForm({ ...form, idLote: e.target.value })}
                  required
                >
                  <option value="">Seleccione Lote...</option>
                  {lotes.map(l => (
                    <option key={l.idLote} value={l.idLote}>
                      Lote #{l.idLote} - {l.productoNombre || 'Cosecha'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Etapa de Trazabilidad</label>
                <select
                  className="form-select"
                  value={form.tipoMovimiento}
                  onChange={e => setForm({ ...form, tipoMovimiento: e.target.value })}
                  required
                >
                  <option value="">Selecciona etapa...</option>
                  {tiposMovimiento.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Detalles del Evento</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Temperatura de transporte 4°C, camión placas MX-90"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-warning text-dark mt-3 fw-bold">
              <i className="bi bi-shield-lock me-1"></i>Firmar y Subir a Blockchain
            </button>
          </form>
        </div>
      </div>

      {/* Historial Inmutable */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light fw-bold">
          <i className="bi bi-list-ul me-2"></i>Libro Mayor de Movimientos
        </div>
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-5">
              <div className="spinner-border text-warning"></div>
              <p className="mt-2 text-muted">Consultando nodos...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-dark">
                  <tr>
                    <th>ID</th>
                    <th>Lote</th>
                    <th>Etapa</th>
                    <th>Descripción</th>
                    <th>Fecha Registro</th>
                    <th>TX Hash (Blockchain)</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientos.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-4 text-muted">No hay movimientos registrados</td></tr>
                  ) : (
                    movimientos.map(m => (
                      <tr key={m.idMovimiento}>
                        <td className="text-muted small">#{m.idMovimiento}</td>
                        <td className="fw-bold">Lote {m.idLote}</td>
                        <td style={{ width: '180px' }}>
                          <span className="badge rounded-pill bg-warning text-dark px-3">
                            {m.tipoMovimiento}
                          </span>
                        </td>
                        <td className="text-muted" style={{ maxWidth: '300px' }}>
                          {m.descripcion || 'Sin observaciones'}
                        </td>
                        <td>{new Date(m.fecha).toLocaleString('es-MX')}</td>
                        <td>
                          {m.txHash ? (
                            <a 
                              href={`https://sepolia.etherscan.io/tx/${m.txHash}`} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="btn btn-sm btn-outline-primary font-monospace"
                            >
                              <i className="bi bi-link-45deg me-1"></i>
                              {m.txHash.slice(0, 8)}...
                            </a>
                          ) : (
                            <span className="badge bg-light text-secondary border">Local-Only</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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