namespace TrazabilidadAgro.Domain.Entities;

public class Lote
{
    public int IdLote { get; set; }
    public int IdProducto { get; set; }
    public DateOnly? FechaSiembra { get; set; }
    public DateOnly? FechaCosecha { get; set; }
    public decimal? Cantidad { get; set; }
    public string? CodigoQr { get; set; }

    public Producto Producto { get; set; } = null!;
    public ICollection<LoteInsumo> LoteInsumos { get; set; } = new List<LoteInsumo>();
    public ICollection<MovimientoTrazabilidad> Movimientos { get; set; } = new List<MovimientoTrazabilidad>();
}