import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

// --- COMPONENTE DEL RELOJ EN CUENTA REGRESIVA ---
const RelojAnaquel = ({ fechaExpiracion }) => {
  const [tiempo, setTiempo] = useState('Calculando...');
  const [expirado, setExpirado] = useState(false);

  useEffect(() => {
    if (!fechaExpiracion) {
      setTiempo('No definido');
      return;
    }

    const timer = setInterval(() => {
      const limite = new Date(fechaExpiracion);
      const ahora = new Date();
      const diferencia = limite - ahora;

      if (diferencia <= 0) {
        setTiempo('Expirado');
        setExpirado(true);
        clearInterval(timer);
        return;
      }

      const d = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const h = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diferencia / 1000 / 60) % 60);

      setTiempo(`${d}d ${h}h ${m}m`);
    }, 1000);

    return () => clearInterval(timer);
  }, [fechaExpiracion]);

  return (
    <span className={`fw-bold ${expirado ? 'text-danger' : 'text-success'}`}>
      <i className={`bi ${expirado ? 'bi-exclamation-triangle-fill' : 'bi-clock-history'} me-1`}></i>
      {tiempo}
    </span>
  );
};
// ------------------------------------------------

const Trazabilidad = () => {
  const { codigoQr } = useParams()
  const [data, setData] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.get(`/trazabilidad/${codigoQr}`)
      .then(({ data }) => setData(data))
      .catch(() => setError(true))
      .finally(() => setCargando(false))
  }, [codigoQr])

  if (cargando) return (
    <div className="text-center py-5">
      <div className="spinner-border text-success"></div>
      <p className="mt-2 text-muted">Cargando trazabilidad...</p>
    </div>
  )

  if (error || !data) return (
    <div className="text-center py-5 text-muted">
      <i className="bi bi-exclamation-circle fs-1 text-danger"></i>
      <h5 className="mt-3">Lote no encontrado</h5>
      <p>El código <code>{codigoQr}</code> no existe en el sistema</p>
    </div>
  )

  return (
    <div className="container py-4" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-4">
        <i className="bi bi-leaf text-success" style={{ fontSize: '2.5rem' }}></i>
        <h4 className="fw-bold mt-2">Trazabilidad del Producto Orgánico</h4>
        <span className="badge bg-light text-dark border shadow-sm px-3 py-2">
          Lote: <code className="text-primary">{codigoQr}</code>
        </span>
      </div>

      {/* Info del producto */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success text-white fw-semibold">
          <i className="bi bi-box me-2"></i>Información General
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="text-muted small">Producto</div>
              <div className="fw-bold fs-5">{data.nombreProducto}</div>
            </div>
            <div className="col-md-6">
              <div className="text-muted small">Productor</div>
              <div className="fw-semibold">{data.nombreProductor}</div>
              {data.ubicacionProductor && (
                <div className="text-muted small">
                  <i className="bi bi-geo-alt me-1"></i>{data.ubicacionProductor}
                </div>
              )}
            </div>
            {/* Ajuste a 3 columnas para incluir el reloj */}
            <div className="col-md-4">
              <div className="text-muted small">Fecha de siembra</div>
              <div className="fw-semibold text-success">
                <i className="bi bi-calendar-event me-2"></i>{data.fechaSiembra || '—'}
              </div>
            </div>
            <div className="col-md-4">
              <div className="text-muted small">Fecha de cosecha</div>
              <div className="fw-semibold text-danger">
                <i className="bi bi-calendar-check me-2"></i>{data.fechaCosecha || '—'}
              </div>
            </div>
            {/* NUEVO BLOQUE: TIEMPO EN ANAQUEL */}
            <div className="col-md-4 border-start">
              <div className="text-muted small">Vida en Anaquel</div>
              <RelojAnaquel fechaExpiracion={data.fechaExpiracion} />
            </div>
          </div>
        </div>
      </div>

      {/* Insumos */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-info text-white fw-semibold">
          <i className="bi bi-droplet me-2"></i>Insumos y Fertilizantes
        </div>
        <div className="card-body">
          {(!data.insumos || data.insumos.length === 0) ? (
            <p className="text-muted mb-0 italic">Sin insumos declarados en este lote.</p>
          ) : (
            <div className="d-flex flex-wrap gap-2">
              {data.insumos.map((ins, i) => (
                <div key={`insumo-${i}`} className="border rounded p-2 bg-light shadow-sm">
                  <div className="fw-semibold small text-primary">{ins.nombre}</div>
                  <div className="text-muted x-small uppercase fw-bold">{ins.tipo}</div>
                  {ins.descripcion && <div className="text-muted small">{ins.descripcion}</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Movimientos / Timeline */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-warning text-dark fw-semibold">
          <i className="bi bi-arrow-left-right me-2"></i>Cadena de Suministro (Blockchain)
        </div>
        <div className="card-body p-4">
          {(!data.movimientos || data.movimientos.length === 0) ? (
            <div className="text-muted">Sin movimientos registrados</div>
          ) : (
            <div className="timeline">
              {data.movimientos.map((m, i) => (
                <div key={`mov-${m.idMovimiento || i}`} className="d-flex gap-3 mb-4">
                  <div className="d-flex flex-column align-items-center">
                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 32, height: 32, minWidth: 32 }}>
                      <i className={`bi ${i === 0 ? 'bi-star-fill' : 'bi-check'} small`}></i>
                    </div>
                    {i < data.movimientos.length - 1 && (
                      <div style={{ width: 2, flexGrow: 1, background: '#dee2e6', marginTop: 4, marginBottom: 4 }}></div>
                    )}
                  </div>
                  <div className="pb-2">
                    <div className="fw-bold text-dark">{m.tipoMovimiento}</div>
                    <div className="text-muted small">{m.descripcion}</div>
                    <div className="text-muted x-small mt-1">
                      <i className="bi bi-clock me-1"></i>{new Date(m.fecha).toLocaleString()}
                    </div>
                    {m.txHash && (
                      <a 
                        href={`https://etherscan.io/tx/${m.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="badge bg-primary text-decoration-none mt-2 d-inline-block"
                      >
                        <i className="bi bi-link-45deg me-1"></i>
                        Certificado: {m.txHash.slice(0, 15)}...
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hash Global Blockchain */}
      {data.txHash && (
        <div className="card border-0 shadow-sm border-start border-4 border-success bg-light">
          <div className="card-body">
            <div className="fw-bold mb-1 text-success">
              <i className="bi bi-shield-check me-2"></i>Sello de Integridad Eco-Tex
            </div>
            <p className="small text-muted mb-2">Este lote ha sido firmado digitalmente para garantizar su origen orgánico.</p>
            <a 
              href={`https://etherscan.io/tx/${data.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-monospace x-small text-primary text-break"
            >
              {data.txHash}
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

export default Trazabilidad