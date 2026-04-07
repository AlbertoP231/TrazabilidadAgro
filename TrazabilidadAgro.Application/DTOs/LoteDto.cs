namespace TrazabilidadAgro.Application.DTOs;

public class LoteDto
{
    public int IdLote { get; set; }
    public int IdProducto { get; set; }
    public string? NombreProducto { get; set; }
    public DateOnly? FechaSiembra { get; set; }
    public DateOnly? FechaCosecha { get; set; }
    public decimal? Cantidad { get; set; }
    public string? CodigoQr { get; set; }
}

public class CrearLoteDto
{
    public int IdProducto { get; set; }
    public DateOnly? FechaSiembra { get; set; }
    public DateOnly? FechaCosecha { get; set; }
    public decimal? Cantidad { get; set; }
}