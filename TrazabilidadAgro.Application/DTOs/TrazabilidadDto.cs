namespace TrazabilidadAgro.Application.DTOs;

public class TrazabilidadPublicaDto
{
    public string NombreProducto { get; set; } = string.Empty;
    public string NombreProductor { get; set; } = string.Empty;
    public string? UbicacionProductor { get; set; }
    public DateOnly? FechaSiembra { get; set; }
    public DateOnly? FechaCosecha { get; set; }
    public decimal? Cantidad { get; set; }
    public List<InsumoDto> Insumos { get; set; } = new();
    public List<MovimientoDto> Movimientos { get; set; } = new();
    public string? TxHash { get; set; }
}

public class InsumoDto
{
    public string? Nombre { get; set; }
    public string? Tipo { get; set; }
    public string? Descripcion { get; set; }
}