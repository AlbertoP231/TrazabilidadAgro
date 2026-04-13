import { Navigate } from 'react-router-dom'
import useAuthStore from '../context/useAuthStore'

const PrivateRoute = ({ children, rol }) => {
  const { token, usuario } = useAuthStore()

  if (!token) return <Navigate to="/login" />
  if (rol && usuario?.rol !== rol) return <Navigate to="/login" />

  return children
}

export default PrivateRoute