namespace TrazabilidadAgro.Domain.Entities;

public class Productor
{
    public int IdProductor { get; set; }
    public int IdUsuario { get; set; }
    public string? WalletBlockchain { get; set; }
    public string? Ubicacion { get; set; }
    public string? Telefono { get; set; }

    public Usuario Usuario { get; set; } = null!;
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}