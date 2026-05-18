import React, { useEffect, useState, Fragment } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'

const ProductorLotes = () => {
  const [lotes, setLotes] = useState([])
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ idProducto: '', fechaSiembra: '', fechaCosecha: '', cantidad: '' })
  const [qrVisible, setQrVisible] = useState(null)
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    try {
      const [l, p] = await Promise.all([
        api.get('/lotes'),
        api.get('/productos/mis-productos')
      ])
      setLotes(l.data)
      setProductos(p.data)
    } catch (error) {
      toast.error('Error al cargar datos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post('/lotes', form)
      toast.success(`Lote creado — QR: ${data.codigoQr}`)
      setForm({ idProducto: '', fechaSiembra: '', fechaCosecha: '', cantidad: '' })
      cargar()
    } catch {
      toast.error('Error al crear lote')
    }
  }

  const urlTrazabilidad = (codigo) =>
    `${window.location.origin}/trazabilidad/${codigo}`

  return (
    <div className="container-fluid p-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-stack me-2 text-primary"></i>Mis lotes
      </h4>

      {/* Formulario */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-primary text-white fw-semibold">
          <i className="bi bi-plus-circle me-2"></i>Registrar nuevo lote
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardar}>
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label fw-semibold">Producto</label>
                <select
                  className="form-select"
                  value={form.idProducto}
                  onChange={e => setForm({ ...form, idProducto: e.target.value })}
                  required
                >
                  <option value="">Selecciona...</option>
                  {productos.map(p => (
                    <option key={p.idProducto} value={p.idProducto}>{p.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Fecha siembra</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.fechaSiembra}
                  onChange={e => setForm({ ...form, fechaSiembra: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Fecha cosecha</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.fechaCosecha}
                  onChange={e => setForm({ ...form, fechaCosecha: e.target.value })}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label fw-semibold">Cantidad (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={form.cantidad}
                  onChange={e => setForm({ ...form, cantidad: e.target.value })}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3">
              <i className="bi bi-check-lg me-1"></i>Crear lote y generar QR
            </button>
          </form>
        </div>
      </div>

      {/* Tabla de lotes */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
          ) : lotes.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1"></i>
              <p className="mt-2">No tienes lotes registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Producto</th>
                    <th>Siembra</th>
                    <th>Cosecha</th>
                    <th>Cantidad Total</th>
                    <th>Disponible</th>
                    <th>Código QR</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map(l => (
                    <Fragment key={l.idLote}>
                      <tr>
                        <td className="fw-semibold">{l.productoNombre}</td>
                        <td>{l.fechaSiembra || '—'}</td>
                        <td>{l.fechaCosecha || '—'}</td>
                        <td className="text-muted">{l.cantidad} kg</td>
                        <td className="fw-bold text-success">
                          {l.cantidadDisponible !== null && l.cantidadDisponible !== undefined ? l.cantidadDisponible : l.cantidad} kg
                        </td>
                        <td><code className="small">{l.codigoQr}</code></td>
                        <td className="text-end">
                          <button
                            className={`btn btn-sm ${qrVisible === l.idLote ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setQrVisible(qrVisible === l.idLote ? null : l.idLote)}
                          >
                            <i className={`bi ${qrVisible === l.idLote ? 'bi-x-lg' : 'bi-qr-code'}`}></i>
                          </button>
                        </td>
                      </tr>
                      {qrVisible === l.idLote && (
                        <tr className="bg-light">
                          <td colSpan={7} className="p-0">
                            <div className="d-flex align-items-center gap-4 p-4 border-start border-primary border-4">
                              <div className="bg-white p-2 shadow-sm rounded">
                                <QRCode
                                  value={urlTrazabilidad(l.codigoQr)}
                                  size={140}
                                />
                              </div>
                              <div>
                                <h6 className="fw-bold mb-1">Trazabilidad del Lote</h6>
                                <p className="text-muted small mb-3">Escanea este código para ver el historial completo.</p>
                                <a 
                                  href={urlTrazabilidad(l.codigoQr)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="btn btn-sm btn-link text-primary p-0 d-block text-start mb-1 text-decoration-none"
                                >
                                  <i className="bi bi-box-arrow-up-right me-1"></i>
                                  Abrir enlace público
                                </a>
                                <code className="x-small text-muted">{urlTrazabilidad(l.codigoQr)}</code>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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

export default ProductorLotes