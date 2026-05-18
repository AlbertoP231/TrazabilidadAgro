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
// Solo requerimos que el usuario esté autenticado de forma general.
// Esto previene el error 403 Forbidden en el Gateway inicial.
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
                    fechaExpiracion = l.FechaExpiracion, // <-- Se expone para el catálogo
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
            // Extraer el rol del usuario desde los claims manualmente
            var userRole = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value?.ToUpper() ?? "";

            // Si el usuario no es Administrador ni Productor, denegar acceso
            if (userRole != "ADMINISTRADOR" && userRole != "ADMIN" && userRole != "PRODUCTOR")
            {
                return Forbid();
            }

            var query = _context.Lotes.Include(l => l.Producto).AsQueryable();

            // Filtrar la consulta solo si el usuario es explícitamente un Productor
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
            // Los administradores saltan el filtro y ven todo

            var lotes = await query.Select(l => new
            {
                idLote = l.IdLote,
                idProducto = l.IdProducto,
                productoNombre = l.Producto != null ? l.Producto.Nombre : "Producto sin nombre",
                fechaSiembra = l.FechaSiembra,
                fechaCosecha = l.FechaCosecha,
                cantidad = l.Cantidad,
                cantidadDisponible = l.CantidadDisponible,
                fechaExpiracion = l.FechaExpiracion, // <-- Variable vital para el Reloj de React
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
    // Restricción de rol específica aplicada solo a la creación de lotes
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
            // Guardamos la fecha de expiración sumando los días desde el momento exacto de la creación
            FechaExpiracion = DateTime.Now.AddDays(dto.DiasAnaquel),
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