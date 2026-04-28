import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ProductorProductos = () => {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', imagenUrl: '' })
  const [editando, setEditando] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  // URL base de tu API para las imágenes
  const BASE_URL = "http://localhost:5126";

  const cargar = () => {
    setCargando(true)
    api.get('/productos/mis-productos')
      .then(({ data }) => setProductos(data))
      .catch(() => toast.error('Error al cargar productos'))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargar() }, [])

  const resetForm = () => {
    setForm({ nombre: '', descripcion: '', precio: '', imagenUrl: '' })
    setEditando(null)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    try {
      if (editando) {
        await api.put(`/productos/${editando}`, form)
        toast.success('Datos actualizados')
      } else {
        await api.post('/productos', form)
        toast.success('Producto creado')
      }
      resetForm()
      cargar()
    } catch {
      toast.error('Error al guardar datos del producto')
    }
  }

  const handleSubirImagen = async (idProducto, archivo) => {
    if (!archivo) return
    setSubiendoImagen(true)
    const loadingToast = toast.loading('Subiendo imagen...')
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      
      await api.post(`/productos/${idProducto}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      toast.success('Imagen vinculada correctamente', { id: loadingToast })
      cargar()
    } catch {
      toast.error('Error al subir imagen', { id: loadingToast })
    } finally {
      setSubiendoImagen(false)
    }
  }

  const handleEditar = (p) => {
    setEditando(p.idProducto)
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      precio: p.precio || '',
      imagenUrl: p.imagenUrl || ''
    })
  }

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await api.delete(`/productos/${id}`)
      toast.success('Producto eliminado')
      cargar()
    } catch {
      toast.error('Error al eliminar')
    }
  }

  // Función para normalizar la URL de la imagen
  const getImagenUrl = (ruta) => {
    if (!ruta) return null;
    if (ruta.startsWith('http')) return ruta;
    // Limpiamos la ruta para obtener solo el nombre del archivo
    const nombreArchivo = ruta.split(/[\\/]/).pop();
    return `${BASE_URL}/Uploads/${nombreArchivo}`;
  }

  return (
    <div className="container-fluid pb-5">
      <h4 className="fw-bold mb-4">
        <i className="bi bi-box me-2 text-success"></i>Gestión de Productos (Productor)
      </h4>

      {/* Formulario Original */}
      <div className="card border-0 shadow-sm mb-4">
        <div className={`card-header text-white fw-semibold ${editando ? 'bg-primary' : 'bg-success'}`}>
          <i className={`bi ${editando ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
          {editando ? 'Editar información' : 'Nuevo registro de producto'}
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardar}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Tomate cherry"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold small">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripción breve"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold small">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={e => setForm({ ...form, precio: e.target.value })}
                  required
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold small">URL externa (Opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="http://..."
                  value={form.imagenUrl}
                  onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className={`btn ${editando ? 'btn-primary' : 'btn-success'}`}>
                <i className="bi bi-check-lg me-1"></i>{editando ? 'Actualizar Datos' : 'Guardar Producto'}
              </button>
              {editando && (
                <button type="button" className="btn btn-outline-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Tabla con todas las funcionalidades: Editar, Eliminar y Subir Imagen */}
      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="px-4">Vista</th>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Vincular Imagen</th>
                    <th className="text-end px-4">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.idProducto}>
                      <td className="px-4">
                        <img
                          src={getImagenUrl(p.imagenUrl) || 'https://placehold.co/50x50?text=S/F'}
                          alt={p.nombre}
                          style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 8 }}
                          onError={(e) => { e.target.src = 'https://placehold.co/50x50?text=Error'; }}
                        />
                      </td>
                      <td className="fw-bold">{p.nombre}</td>
                      <td className="text-success fw-bold">${p.precio?.toFixed(2)}</td>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm"
                          style={{ maxWidth: 200 }}
                          disabled={subiendoImagen}
                          onChange={e => handleSubirImagen(p.idProducto, e.target.files[0])}
                        />
                      </td>
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleEditar(p)}>
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(p.idProducto)}>
                          <i className="bi bi-trash"></i>
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

export default ProductorProductos