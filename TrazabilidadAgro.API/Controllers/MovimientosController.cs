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
[Authorize(Roles = "ADMIN")]
public class MovimientosController : ControllerBase
{
    private readonly AppDbContext _context;

    public MovimientosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTodos()
    {
        var movimientos = await _context.MovimientosTrazabilidad
            .Include(m => m.Lote).ThenInclude(l => l.Producto)
            .Include(m => m.Usuario)
            .Include(m => m.Transaccion)
            .Select(m => new MovimientoDto
            {
                IdMovimiento = m.IdMovimiento,
                IdLote = m.IdLote,
                TipoMovimiento = m.TipoMovimiento,
                Descripcion = m.Descripcion,
                Fecha = m.Fecha,
                RegistradoPorNombre = m.Usuario.Nombre,
                TxHash = m.Transaccion != null ? m.Transaccion.TxHash : null
            }).ToListAsync();

        return Ok(movimientos);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar([FromBody] CrearMovimientoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var movimiento = new MovimientoTrazabilidad
        {
            IdLote = dto.IdLote,
            TipoMovimiento = dto.TipoMovimiento,
            Descripcion = dto.Descripcion,
            Fecha = DateTime.Now,
            RegistradoPor = idUsuario
        };

        _context.MovimientosTrazabilidad.Add(movimiento);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Movimiento registrado", idMovimiento = movimiento.IdMovimiento });
    }
}