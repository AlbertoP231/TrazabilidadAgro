import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../context/useAuthStore'
import toast from 'react-hot-toast'

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, {
        idUsuario: data.idUsuario,
        nombre: data.nombre,
        email: data.email,
        rol: data.rol
      })
      toast.success(`Bienvenido, ${data.nombre}`)

      if (data.rol === 'ADMIN') navigate('/admin/dashboard')
      else if (data.rol === 'PRODUCTOR') navigate('/productor/dashboard')
      else navigate('/catalogo')

    } catch {
      toast.error('Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <div className="card shadow border-0 p-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-leaf text-success" style={{ fontSize: '3rem' }}></i>
          <h4 className="fw-bold mt-2">TrazabilidadAgro</h4>
          <p className="text-muted small">Inicia sesión para continuar</p>
        </div>

        <form onSubmit={handleSubmit}>
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

          <div className="mb-4">
            <label className="form-label fw-semibold">Contraseña</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-lock"></i></span>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-success w-100 fw-semibold"
            disabled={cargando}
          >
            {cargando
              ? <><span className="spinner-border spinner-border-sm me-2"></span>Ingresando...</>
              : <><i className="bi bi-box-arrow-in-right me-2"></i>Iniciar sesión</>
            }
          </button>
        </form>

        <hr />
        <p className="text-center text-muted small mb-0">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-success fw-semibold">Regístrate aquí</Link>
        </p>
      </div>
    </div>
  )
}

export default Login