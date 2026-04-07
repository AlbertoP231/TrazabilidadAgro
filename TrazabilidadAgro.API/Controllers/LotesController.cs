using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrazabilidadAgro.Application.DTOs;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "PRODUCTOR")]
public class LotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LotesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMisLotes()
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores.FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        var lotes = await _context.Lotes
            .Include(l => l.Producto)
            .Where(l => l.Producto.IdProductor == productor!.IdProductor)
            .Select(l => new LoteDto
            {
                IdLote = l.IdLote,
                IdProducto = l.IdProducto,
                NombreProducto = l.Producto.Nombre,
                FechaSiembra = l.FechaSiembra,
                FechaCosecha = l.FechaCosecha,
                Cantidad = l.Cantidad,
                CodigoQr = l.CodigoQr
            }).ToListAsync();

        return Ok(lotes);
    }

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearLoteDto dto)
    {
        var codigoQr = $"LOTE-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var lote = new Lote
        {
            IdProducto = dto.IdProducto,
            FechaSiembra = dto.FechaSiembra,
            FechaCosecha = dto.FechaCosecha,
            Cantidad = dto.Cantidad,
            CodigoQr = codigoQr
        };

        _context.Lotes.Add(lote);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Lote creado", idLote = lote.IdLote, codigoQr });
    }

    [HttpGet("{id}/insumos")]
    public async Task<IActionResult> GetInsumos(int id)
    {
        var insumos = await _context.LoteInsumos
            .Include(li => li.Insumo)
            .Where(li => li.IdLote == id)
            .Select(li => new InsumoDto
            {
                Nombre = li.Insumo.Nombre,
                Tipo = li.Insumo.Tipo,
                Descripcion = li.Descripcion
            }).ToListAsync();

        return Ok(insumos);
    }

    [HttpPost("{id}/insumos")]
    public async Task<IActionResult> AgregarInsumo(int id, [FromBody] AgregarInsumoDto dto)
    {
        var loteInsumo = new LoteInsumo
        {
            IdLote = id,
            IdInsumo = dto.IdInsumo,
            Descripcion = dto.Descripcion
        };

        _context.LoteInsumos.Add(loteInsumo);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Insumo agregado al lote" });
    }
}

public class AgregarInsumoDto
{
    public int IdInsumo { get; set; }
    public string? Descripcion { get; set; }
}