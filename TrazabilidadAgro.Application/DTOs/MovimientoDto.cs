namespace TrazabilidadAgro.Application.DTOs;

public class MovimientoDto
{
    public int IdMovimiento { get; set; }
    public int IdLote { get; set; }
    public string? TipoMovimiento { get; set; }
    public string? Descripcion { get; set; }
    public DateTime Fecha { get; set; }
    public string? RegistradoPorNombre { get; set; }
    public string? TxHash { get; set; }
}

public class CrearMovimientoDto
{
    public int IdLote { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
}