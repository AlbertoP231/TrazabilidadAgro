import { useNavigate } from 'react-router-dom'

const PagoFallido = () => {
  const navigate = useNavigate()
  return (
    <div className="text-center py-5">
      <i className="bi bi-x-circle-fill text-danger" style={{ fontSize: '5rem' }}></i>
      <h3 className="fw-bold mt-3">Pago no completado</h3>
      <p className="text-muted">Hubo un problema con tu pago. Puedes intentarlo de nuevo.</p>
      <button className="btn btn-success mt-2" onClick={() => navigate('/cliente/carrito')}>
        <i className="bi bi-arrow-left me-2"></i>Volver al carrito
      </button>
    </div>
  )
}

export default PagoFallido