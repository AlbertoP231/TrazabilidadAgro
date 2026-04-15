import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ProductorInsumos = () => {
  const [lotes, setLotes] = useState([])
  const [insumos, setInsumos] = useState([])
  const [insumosLote, setInsumosLote] = useState([])
  const [loteSeleccionado, setLoteSeleccionado] = useState('')
  const [form, setForm] = useState({ idInsumo: '', descripcion: '' })

  useEffect(() => {
    Promise.all([api.get('/lotes'), api.get('/insumos')])
      .then(([l, i]) => {
        setLotes(l.data)
        setInsumos(i.data)
      })
  }, [])

  const cargarInsumosLote = async (idLote) => {
    setLoteSeleccionado(idLote)
    if (!idLote) return setInsumosLote([])
    const { data } = await api.get(`/lotes/${idLote}/insumos`)
    setInsumosLote(data)
  }

  const handleAgregar = async (e) => {
    e.preventDefault()
    try {
      await api.post(`/lotes/${loteSeleccionado}/insumos`, form)
      toast.success('Insumo declarado correctamente')
      setForm({ idInsumo: '', descripcion: '' })
      cargarInsumosLote(loteSeleccionado)
    } catch {
      toast.error('Error al agregar insumo')
    }
  }

  const badgeColor = (tipo) => {
    if (!tipo) return 'secondary'
    const t = tipo.toLowerCase()
    if (t.includes('agua')) return 'info'
    if (t.includes('fertilizante')) return 'success'
    if (t.includes('insecticida')) return 'warning'
    return 'secondary'
  }

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-droplet me-2 text-info"></i>Declaración de insumos
      </h4>

      <div className="row g-4">
        {/* Panel izquierdo — formulario */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white fw-semibold">
              <i className="bi bi-plus-circle me-2"></i>Agregar insumo a lote
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-semibold">Selecciona el lote</label>
                <select
                  className="form-select"
                  value={loteSeleccionado}
                  onChange={e => cargarInsumosLote(e.target.value)}
                >
                  <option value="">Selecciona un lote...</option>
                  {lotes.map(l => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.nombreProducto} — {l.codigoQr}
                    </option>
                  ))}
                </select>
              </div>

              {loteSeleccionado && (
                <form onSubmit={handleAgregar}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Tipo de insumo</label>
                    <select
                      className="form-select"
                      value={form.idInsumo}
                      onChange={e => setForm({ ...form, idInsumo: e.target.value })}
                      required
                    >
                      <option value="">Selecciona...</option>
                      {insumos.map(i => (
                        <option key={i.idInsumo} value={i.idInsumo}>
                          {i.nombre} ({i.tipo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Descripción / cantidad usada</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Ej: 50 litros de agua de pozo, aplicado el 15 de marzo"
                      value={form.descripcion}
                      onChange={e => setForm({ ...form, descripcion: e.target.value })}
                    />
                  </div>
                  <button type="submit" className="btn btn-info text-white w-100">
                    <i className="bi bi-check-lg me-1"></i>Declarar insumo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho — insumos del lote */}
        <div className="col-md-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-light fw-semibold">
              <i className="bi bi-list-check me-2"></i>
              Insumos declarados {loteSeleccionado ? `(lote seleccionado)` : ''}
            </div>
            <div className="card-body">
              {insumosLote.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-inbox fs-2"></i>
                  <p className="mt-2 small">
                    {loteSeleccionado
                      ? 'Este lote no tiene insumos declarados'
                      : 'Selecciona un lote para ver sus insumos'}
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {insumosLote.map((ins, i) => (
                    <div key={i} className="d-flex align-items-start gap-2 p-2 bg-light rounded">
                      <span className={`badge bg-${badgeColor(ins.tipo)} mt-1`}>
                        {ins.tipo || 'Insumo'}
                      </span>
                      <div>
                        <div className="fw-semibold small">{ins.nombre}</div>
                        <div className="text-muted small">{ins.descripcion || '—'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductorInsumos