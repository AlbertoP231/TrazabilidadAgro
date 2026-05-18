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
// We only require the user to be authenticated, NOT a specific role here.
// This prevents the 403 Forbidden error at the gateway.
[Authorize]
public class LotesController : ControllerBase
{
    private readonly AppDbContext _context;

    public LotesController(AppDbContext context)
    {
        _context = context;
    }
    [HttpGet("catalogo")]
    [AllowAnonymous]
    public async Task<IActionResult> GetCatalogoPublico()
    {
        try
        {
            var lotesDisponibles = await _context.Lotes
                .Include(l => l.Producto)
                    .ThenInclude(p => p.Productor)
                        .ThenInclude(pr => pr.Usuario)
                .Where(l => l.CantidadDisponible > 0)
                .Select(l => new
                {
                    idLote = l.IdLote,
                    idProducto = l.IdProducto,
                    nombre = l.Producto.Nombre,
                    descripcion = l.Producto.Descripcion,
                    precio = l.Producto.Precio,
                    imagenUrl = l.Producto.ImagenUrl,
                    nombreProductor = l.Producto.Productor.Usuario.Nombre,
                    fechaCosecha = l.FechaCosecha,
                    cantidadDisponible = l.CantidadDisponible,
                    codigoQr = l.CodigoQr
                }).ToListAsync();

            return Ok(lotesDisponibles);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener el catálogo de lotes", detalle = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetLotes()
    {
        try
        {
            // Extract the user's role from the claims manually to see exactly what they have
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value?.ToUpper() ?? "";

            // If the user is neither an Administrator nor a Productor, deny access manually
            if (userRole != "ADMINISTRADOR" && userRole != "ADMIN" && userRole != "PRODUCTOR")
            {
                return Forbid(); // Or return Unauthorized()
            }

            var query = _context.Lotes.Include(l => l.Producto).AsQueryable();

            // Only filter the query if the user is explicitly a Productor
            if (userRole == "PRODUCTOR")
            {
                var idUsuarioClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (idUsuarioClaim != null)
                {
                    var idUsuario = int.Parse(idUsuarioClaim.Value);
                    var productor = await _context.Productores.FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

                    if (productor != null)
                    {
                        query = query.Where(l => l.Producto.IdProductor == productor.IdProductor);
                    }
                    else
                    {
                        return Ok(new List<object>());
                    }
                }
            }
            // Administrators bypass the filter and see everything

            var lotes = await query.Select(l => new
            {
                idLote = l.IdLote,
                idProducto = l.IdProducto,
                productoNombre = l.Producto != null ? l.Producto.Nombre : "Producto sin nombre",
                fechaSiembra = l.FechaSiembra,
                fechaCosecha = l.FechaCosecha,
                cantidad = l.Cantidad,
                cantidadDisponible = l.CantidadDisponible,
                codigoQr = l.CodigoQr,
                codigoHash = l.CodigoQr
            }).ToListAsync();

            return Ok(lotes);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error al obtener lotes", detalle = ex.Message });
        }
    }

    [HttpPost]
    // Specific role restriction applied only to creation
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> Crear([FromBody] CrearLoteDto dto)
    {
        var codigoQr = $"LOTE-{Guid.NewGuid().ToString()[..8].ToUpper()}";

        var lote = new Lote
        {
            IdProducto = dto.IdProducto,
            FechaSiembra = dto.FechaSiembra,
            FechaCosecha = dto.FechaCosecha,
            Cantidad = dto.Cantidad,
            CantidadDisponible = dto.Cantidad,
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
            .Select(li => new
            {
                nombre = li.Insumo.Nombre,
                tipo = li.Insumo.Tipo,
                descripcion = li.Descripcion
            }).ToListAsync();

        return Ok(insumos);
    }

    [HttpPost("{id}/insumos")]
    [Authorize(Roles = "PRODUCTOR")]
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