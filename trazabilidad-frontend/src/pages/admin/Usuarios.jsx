import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const AdminUsuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)

  const cargar = () => {
    api.get('/usuarios')
      .then(({ data }) => setUsuarios(data))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleActivo = async (u) => {
    try {
      await api.put(`/usuarios/${u.idUsuario}/${u.activo ? 'desactivar' : 'activar'}`)
      toast.success(`Usuario ${u.activo ? 'desactivado' : 'activado'}`)
      cargar()
    } catch {
      toast.error('Error al cambiar estado')
    }
  }

  const rolBadge = (rol) => {
    if (rol === 'ADMIN') return 'danger'
    if (rol === 'PRODUCTOR') return 'success'
    return 'primary'
  }

  const filtrados = usuarios.filter(u =>
    u.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <h4 className="fw-bold mb-0">
          <i className="bi bi-people me-2 text-primary"></i>Gestión de usuarios
        </h4>
        <div className="input-group" style={{ maxWidth: '280px' }}>
          <span className="input-group-text"><i className="bi bi-search"></i></span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar usuario..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-4"><div className="spinner-border text-primary"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Registro</th>
                    <th>Estado</th>
                    <th className="text-end">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map(u => (
                    <tr key={u.idUsuario}>
                      <td className="fw-semibold">{u.nombre}</td>
                      <td className="text-muted">{u.email}</td>
                      <td>
                        <span className={`badge bg-${rolBadge(u.rol)}`}>{u.rol}</span>
                      </td>
                      <td className="text-muted small">
                        {new Date(u.fechaCreacion).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge ${u.activo ? 'bg-success' : 'bg-secondary'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className={`btn btn-sm ${u.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                          onClick={() => toggleActivo(u)}
                        >
                          <i className={`bi ${u.activo ? 'bi-person-slash' : 'bi-person-check'}`}></i>
                          {u.activo ? ' Desactivar' : ' Activar'}
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
    </div>
  )
}

export default AdminUsuarios