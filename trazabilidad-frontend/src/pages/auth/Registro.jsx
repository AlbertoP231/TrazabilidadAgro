import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const Registro = () => {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', idRol: 3 })
  const [cargando, setCargando] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      await api.post('/auth/registro', form)
      toast.success('Cuenta creada correctamente')
      navigate('/login')
    } catch {
      toast.error('Error al registrar, intenta de nuevo')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card shadow border-0 p-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-leaf text-success" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-2">Crear cuenta</h4>
          <p className="text-muted small">Regístrate para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Nombre completo</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-person"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Tu nombre"
                value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Correo electrónico</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-envelope"></i></span>
              <input
                type="email"
                className="form-control"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Tipo de cuenta</label>
            <select
              className="form-select"
              value={form.idRol}
              onChange={e => setForm({ ...form, idRol: parseInt(e.target.value) })}
            >
              <option value={3}>Cliente</option>
              <option value={2}>Productor</option>
            </select>
          </div>

          <button type="submit" className="btn btn-success w-100 fw-semibold" disabled={cargando}>
            {cargando
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Registrando...</>
              : <><i className="bi bi-person-plus me-2"></i>Crear cuenta</>
            }
          </button>
        </form>

        <hr />
        <p className="text-center text-muted small mb-0">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-success fw-semibold">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}

export default Registro