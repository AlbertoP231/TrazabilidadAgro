using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrazabilidadAgro.Application.DTOs;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrazabilidadController : ControllerBase
{
    private readonly AppDbContext _context;

    public TrazabilidadController(AppDbContext context)
    {
        _context = context;
    }

    // Endpoint público — se llama al escanear el QR
    [HttpGet("{codigoQr}")]
    public async Task<IActionResult> GetTrazabilidad(string codigoQr)
    {
        var lote = await _context.Lotes
            .Include(l => l.Producto).ThenInclude(p => p.Productor).ThenInclude(pr => pr.Usuario)
            .Include(l => l.LoteInsumos).ThenInclude(li => li.Insumo)
            .Include(l => l.Movimientos).ThenInclude(m => m.Transaccion)
            .FirstOrDefaultAsync(l => l.CodigoQr == codigoQr);

        if (lote == null)
            return NotFound(new { mensaje = "Lote no encontrado" });

        var resultado = new TrazabilidadPublicaDto
        {
            NombreProducto = lote.Producto.Nombre,
            NombreProductor = lote.Producto.Productor.Usuario.Nombre,
            UbicacionProductor = lote.Producto.Productor.Ubicacion,
            FechaSiembra = lote.FechaSiembra,
            FechaCosecha = lote.FechaCosecha,
            Cantidad = lote.Cantidad,
            Insumos = lote.LoteInsumos.Select(li => new InsumoDto
            {
                Nombre = li.Insumo.Nombre,
                Tipo = li.Insumo.Tipo,
                Descripcion = li.Descripcion
            }).ToList(),
            Movimientos = lote.Movimientos.Select(m => new MovimientoDto
            {
                IdMovimiento = m.IdMovimiento,
                IdLote = m.IdLote,
                TipoMovimiento = m.TipoMovimiento,
                Descripcion = m.Descripcion,
                Fecha = m.Fecha,
                TxHash = m.Transaccion?.TxHash
            }).ToList(),
            TxHash = lote.Movimientos
                .Where(m => m.Transaccion != null)
                .OrderByDescending(m => m.Fecha)
                .FirstOrDefault()?.Transaccion?.TxHash
        };

        return Ok(resultado);
    }
}