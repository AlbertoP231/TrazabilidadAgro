import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ProductorProductos = () => {
  const [productos, setProductos] = useState([])
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', imagenUrl: '' })
  const [editando, setEditando] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  const cargar = () => {
    api.get('/productos/mis-productos')
      .then(({ data }) => setProductos(data))
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
        toast.success('Producto actualizado')
      } else {
        await api.post('/productos', form)
        toast.success('Producto creado')
      }
      resetForm()
      cargar()
    } catch {
      toast.error('Error al guardar producto')
    }
  }

  const handleSubirImagen = async (idProducto, archivo) => {
    if (!archivo) return
    setSubiendoImagen(true)
    try {
      const formData = new FormData()
      formData.append('archivo', archivo)
      const { data } = await api.post(`/productos/${idProducto}/imagen`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      toast.success('Imagen subida correctamente')
      cargar()
    } catch {
      toast.error('Error al subir imagen')
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

  return (
    <div>
      <h4 className="fw-bold mb-4">
        <i className="bi bi-box me-2 text-success"></i>Mis productos
      </h4>

      {/* Formulario */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-success text-white fw-semibold">
          <i className={`bi ${editando ? 'bi-pencil' : 'bi-plus-circle'} me-2`}></i>
          {editando ? 'Editar producto' : 'Nuevo producto'}
        </div>
        <div className="card-body">
          <form onSubmit={handleGuardar}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Nombre</label>
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
                <label className="form-label fw-semibold">Descripción</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Descripción del producto"
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">Precio ($)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={form.precio}
                  onChange={e => setForm({ ...form, precio: e.target.value })}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label fw-semibold">URL imagen</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="https://..."
                  value={form.imagenUrl}
                  onChange={e => setForm({ ...form, imagenUrl: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3 d-flex gap-2">
              <button type="submit" className="btn btn-success">
                <i className="bi bi-check-lg me-1"></i>{editando ? 'Actualizar' : 'Guardar'}
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

      {/* Tabla con opción de subir imagen */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          {cargando ? (
            <div className="text-center py-4"><div className="spinner-border text-success"></div></div>
          ) : productos.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1"></i>
              <p className="mt-2">No tienes productos registrados</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Precio</th>
                    <th>Subir imagen</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => (
                    <tr key={p.idProducto}>
                      <td>
                        {p.imagenUrl ? (
                          <img
                            src={p.imagenUrl.startsWith('http')
                              ? p.imagenUrl
                              : `http://localhost:5000${p.imagenUrl}`}
                            alt={p.nombre}
                            style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 6 }}
                          />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center rounded"
                            style={{ width: 50, height: 50 }}>
                            <i className="bi bi-image text-muted"></i>
                          </div>
                        )}
                      </td>
                      <td className="fw-semibold">{p.nombre}</td>
                      <td className="text-muted">{p.descripcion || '—'}</td>
                      <td className="text-success fw-semibold">${p.precio?.toFixed(2)}</td>
                      <td>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control form-control-sm"
                          style={{ maxWidth: 180 }}
                          disabled={subiendoImagen}
                          onChange={e => handleSubirImagen(p.idProducto, e.target.files[0])}
                        />
                      </td>
                      <td className="text-end">
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