import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import useCarritoStore from '../../context/useCarritoStore'

const PagoExitoso = () => {
  const [params] = useSearchParams()
  const pedido = params.get('pedido')
  const { vaciar } = useCarritoStore()
  const navigate = useNavigate()

  useEffect(() => { vaciar() }, [])

  return (
    <div className="text-center py-5">
      <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
      <h3 className="fw-bold mt-3">¡Pago exitoso!</h3>
      <p className="text-muted">Tu pedido #{pedido} fue confirmado y está siendo procesado.</p>
      <button className="btn btn-success mt-2" onClick={() => navigate('/cliente/pedidos')}>
        <i className="bi bi-bag me-2"></i>Ver mis pedidos
      </button>
    </div>
  )
}

export default PagoExitoso