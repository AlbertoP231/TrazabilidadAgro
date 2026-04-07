namespace TrazabilidadAgro.Domain.Entities;

public class Producto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal? Precio { get; set; }
    public int IdProductor { get; set; }

    public Productor Productor { get; set; } = null!;
    public ICollection<Lote> Lotes { get; set; } = new List<Lote>();
    public ICollection<DetallePedido> DetallesPedido { get; set; } = new List<DetallePedido>();
}