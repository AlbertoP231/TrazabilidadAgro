namespace TrazabilidadAgro.Domain.Entities;

public class MovimientoTrazabilidad
{
    public int IdMovimiento { get; set; }
    public int IdLote { get; set; }
    public string? TipoMovimiento { get; set; }
    public string? Descripcion { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public int RegistradoPor { get; set; }

    public Lote Lote { get; set; } = null!;
    public Usuario Usuario { get; set; } = null!;
    public TransaccionBlockchain? Transaccion { get; set; }
}