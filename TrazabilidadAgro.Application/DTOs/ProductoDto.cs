namespace TrazabilidadAgro.Application.DTOs;

public class ProductoDto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal? Precio { get; set; }
    public int IdProductor { get; set; }
    public string? NombreProductor { get; set; }
}

public class CrearProductoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal? Precio { get; set; }
}