import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'
import useCarritoStore from '../context/useCarritoStore'

const Navbar = () => {
  const { usuario, logout } = useAuthStore()
  const items = useCarritoStore(s => s.items)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success px-3">
      <Link className="navbar-brand fw-bold" to="/">
        <i className="bi bi-leaf me-2"></i>TrazabilidadAgro
      </Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        <ul className="navbar-nav me-auto">

          {/* Links ADMIN */}
          {usuario?.rol === 'ADMIN' && <>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/usuarios">
                <i className="bi bi-people me-1"></i>Usuarios
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/movimientos">
                <i className="bi bi-arrow-left-right me-1"></i>Movimientos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/blockchain">
                <i className="bi bi-link-45deg me-1"></i>Blockchain
              </Link>
            </li>
          </>}

          {/* Links PRODUCTOR */}
          {usuario?.rol === 'PRODUCTOR' && <>
            <li className="nav-item">
              <Link className="nav-link" to="/productor/productos">
                <i className="bi bi-box me-1"></i>Productos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productor/lotes">
                <i className="bi bi-stack me-1"></i>Lotes
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/productor/insumos">
                <i className="bi bi-droplet me-1"></i>Insumos
              </Link>
            </li>
          </>}

          {/* Links CLIENTE */}
          {usuario?.rol === 'CLIENTE' && <>
            <li className="nav-item">
              <Link className="nav-link" to="/catalogo">
                <i className="bi bi-shop me-1"></i>Catálogo
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cliente/pedidos">
                <i className="bi bi-bag me-1"></i>Mis pedidos
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cliente/escanear">
                <i className="bi bi-qr-code-scan me-1"></i>Escanear QR
              </Link>
            </li>
          </>}

        </ul>

        <ul className="navbar-nav ms-auto align-items-center gap-2">
          {/* Carrito solo para CLIENTE */}
          {usuario?.rol === 'CLIENTE' && (
            <li className="nav-item">
              <Link className="btn btn-outline-light btn-sm position-relative" to="/cliente/carrito">
                <i className="bi bi-cart3 fs-5"></i>
                {items.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {items.length}
                  </span>
                )}
              </Link>
            </li>
          )}

          {usuario && (
            <li className="nav-item dropdown">
              <button className="btn btn-outline-light btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                <i className="bi bi-person-circle me-1"></i>{usuario.nombre}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li><span className="dropdown-item-text text-muted small">{usuario.rol}</span></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item text-danger" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>Cerrar sesión
                  </button>
                </li>
              </ul>
            </li>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar