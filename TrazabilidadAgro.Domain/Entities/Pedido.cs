namespace TrazabilidadAgro.Domain.Entities;

public class Pedido
{
    public int IdPedido { get; set; }
    public int IdUsuario { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Estado { get; set; }
    public decimal? Total { get; set; }

    public Usuario Usuario { get; set; } = null!;
    public ICollection<DetallePedido> Detalles { get; set; } = new List<DetallePedido>();
}