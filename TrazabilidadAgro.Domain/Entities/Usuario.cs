namespace TrazabilidadAgro.Domain.Entities;

public class Usuario
{
    public int IdUsuario { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public int IdRol { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime FechaCreacion { get; set; } = DateTime.Now;

    public Rol Rol { get; set; } = null!;
    public Productor? Productor { get; set; }
    public ICollection<MovimientoTrazabilidad> Movimientos { get; set; } = new List<MovimientoTrazabilidad>();
    public ICollection<Pedido> Pedidos { get; set; } = new List<Pedido>();
}