namespace TrazabilidadAgro.Domain.Entities;

public class Insumo
{
    public int IdInsumo { get; set; }
    public string? Nombre { get; set; }
    public string? Tipo { get; set; }

    public ICollection<LoteInsumo> LoteInsumos { get; set; } = new List<LoteInsumo>();
}