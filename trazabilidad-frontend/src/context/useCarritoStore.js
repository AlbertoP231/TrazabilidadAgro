import { create } from 'zustand'

const useCarritoStore = create((set, get) => ({
  items: [],

  agregar: (producto) => {
    const items = get().items
    const existe = items.find(i => i.idProducto === producto.idProducto)
    if (existe) {
      set({
        items: items.map(i =>
          i.idProducto === producto.idProducto
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        )
      })
    } else {
      set({ items: [...items, { ...producto, cantidad: 1 }] })
    }
  },

  quitar: (idProducto) => {
    set({ items: get().items.filter(i => i.idProducto !== idProducto) })
  },

  cambiarCantidad: (idProducto, cantidad) => {
    if (cantidad < 1) return
    set({
      items: get().items.map(i =>
        i.idProducto === idProducto ? { ...i, cantidad } : i
      )
    })
  },

  vaciar: () => set({ items: [] }),

  total: () => get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),
}))

export default useCarritoStore