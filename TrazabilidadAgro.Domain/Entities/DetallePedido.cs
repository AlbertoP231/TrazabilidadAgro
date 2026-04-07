namespace TrazabilidadAgro.Domain.Entities;

public class DetallePedido
{
    public int IdDetalle { get; set; }
    public int IdPedido { get; set; }
    public int IdProducto { get; set; }
    public int? Cantidad { get; set; }
    public decimal? Precio { get; set; }

    public Pedido Pedido { get; set; } = null!;
    public Producto Producto { get; set; } = null!;
}