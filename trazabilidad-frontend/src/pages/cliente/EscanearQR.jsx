import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const EscanearQR = () => {
  const [codigo, setCodigo] = useState('')
  const navigate = useNavigate()

  const handleBuscar = (e) => {
    e.preventDefault()
    if (codigo.trim()) navigate(`/trazabilidad/${codigo.trim()}`)
  }

  return (
    <div className="d-flex justify-content-center">
      <div className="card border-0 shadow-sm p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="text-center mb-4">
          <i className="bi bi-qr-code-scan text-success" style={{ fontSize: '3rem' }}></i>
          <h5 className="fw-bold mt-2">Consultar trazabilidad</h5>
          <p className="text-muted small">Ingresa el código QR del producto o escanéalo</p>
        </div>

        <form onSubmit={handleBuscar}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Código del lote</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-upc"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: LOTE-A1B2C3D4"
                value={codigo}
                onChange={e => setCodigo(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-success w-100">
            <i className="bi bi-search me-2"></i>Ver trazabilidad
          </button>
        </form>
      </div>
    </div>
  )
}

export default EscanearQR