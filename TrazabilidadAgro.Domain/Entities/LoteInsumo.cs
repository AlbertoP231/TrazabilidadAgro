namespace TrazabilidadAgro.Domain.Entities;

public class LoteInsumo
{
    public int IdLoteInsumo { get; set; }
    public int IdLote { get; set; }
    public int IdInsumo { get; set; }
    public string? Descripcion { get; set; }

    public Lote Lote { get; set; } = null!;
    public Insumo Insumo { get; set; } = null!;
}