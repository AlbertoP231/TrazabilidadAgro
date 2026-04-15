import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminBlockchain = () => {
  const [pendientes, setPendientes] = useState([])
  const [historial, setHistorial] = useState([])
  const [tab, setTab] = useState('pendientes')
  const [cargando, setCargando] = useState(true)

  const cargar = async () => {
    setCargando(true)
    try {
      const [p, h] = await Promise.all([
        api.get('/blockchain/pendientes'),
        api.get('/blockchain/historial')
      ])
      setPendientes(p.data)
      setHistorial(h.data)
    } catch (error) {
      toast.error('Error al obtener datos del servidor')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const handleEnviarBlockchain = async (movimiento) => {
    toast('Abre MetaMask para firmar la transacción', { icon: '🦊' })
    try {
      if (!window.ethereum) {
        toast.error('MetaMask no detectado. Instala la extensión.')
        return
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const accounts = await window.ethereum.request({ method: 'eth_accounts' })
      const wallet = accounts[0]

      const datos = JSON.stringify({
        idMovimiento: movimiento.idMovimiento,
        idLote: movimiento.idLote,
        tipoMovimiento: movimiento.tipoMovimiento,
        fecha: movimiento.fecha
      })

      const txHash = await window.ethereum.request({
        method: 'personal_sign',
        params: [datos, wallet]
      })

      await api.post('/blockchain/guardar-hash', {
        idMovimiento: movimiento.idMovimiento,
        txHash,
        walletOrigen: wallet,
        network: 'Ethereum Mainnet'
      })

      toast.success('Hash guardado en blockchain')
      cargar()
    } catch (err) {
      toast.error('Transacción cancelada o error en MetaMask')
    }
  }

  return (
    <div className="container-fluid p-4">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-link-45deg me-2 text-primary"></i>Gestión blockchain
      </h4>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'pendientes' ? 'active' : ''}`}
            onClick={() => setTab('pendientes')}
          >
            <i className="bi bi-hourglass me-1"></i>
            Pendientes
            {pendientes.length > 0 && (
              <span className="badge bg-danger ms-2">{pendientes.length}</span>
            )}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${tab === 'historial' ? 'active' : ''}`}
            onClick={() => setTab('historial')}
          >
            <i className="bi bi-clock-history me-1"></i>Historial
          </button>
        </li>
      </ul>

      {cargando ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted">Sincronizando con el nodo...</p>
        </div>
      ) : (
        <>
          {tab === 'pendientes' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {pendientes.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-check-circle fs-1 text-success"></i>
                    <p className="mt-2">Todos los movimientos están en blockchain</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Producto</th>
                          <th>Tipo movimiento</th>
                          <th>Fecha</th>
                          <th className="text-end">Enviar a blockchain</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendientes.map(p => (
                          <tr key={p.idMovimiento}>
                            <td className="text-muted">{p.idMovimiento}</td>
                            <td className="fw-semibold">{p.nombreProducto}</td>
                            <td><span className="badge bg-warning text-dark">{p.tipoMovimiento}</span></td>
                            <td className="small">{new Date(p.fecha).toLocaleString()}</td>
                            <td className="text-end">
                              <button
                                className="btn btn-sm btn-primary"
                                onClick={() => handleEnviarBlockchain(p)}
                              >
                                <i className="bi bi-pencil-square me-1"></i>Firmar con MetaMask
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'historial' && (
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {historial.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-info-circle fs-1"></i>
                    <p className="mt-2">No hay registros históricos disponibles</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Producto</th>
                          <th>Tipo</th>
                          <th>TX Hash</th>
                          <th>Wallet</th>
                          <th>Fecha</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historial.map(h => (
                          <tr key={h.idTransaccion}>
                            <td className="fw-semibold">{h.nombreProducto}</td>
                            <td><span className="badge bg-success">{h.tipoMovimiento}</span></td>
                            <td>
                              <a
                                href={`https://etherscan.io/tx/${h.txHash}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-monospace small text-primary text-decoration-none"
                              >
                                <i className="bi bi-box-arrow-up-right me-1"></i>
                                {h.txHash?.slice(0, 16)}...
                              </a>
                            </td>
                            <td className="font-monospace small text-muted">
                              {h.walletOrigen?.slice(0, 12)}...
                            </td>
                            <td className="small">{new Date(h.fecha).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default AdminBlockchain