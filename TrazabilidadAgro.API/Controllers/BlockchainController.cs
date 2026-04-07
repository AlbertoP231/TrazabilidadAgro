using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class BlockchainController : ControllerBase
{
    private readonly AppDbContext _context;

    public BlockchainController(AppDbContext context)
    {
        _context = context;
    }

    // Movimientos sin hash todavía (pendientes de enviar a blockchain)
    [HttpGet("pendientes")]
    public async Task<IActionResult> GetPendientes()
    {
        var pendientes = await _context.MovimientosTrazabilidad
            .Include(m => m.Lote).ThenInclude(l => l.Producto)
            .Include(m => m.Transaccion)
            .Where(m => m.Transaccion == null)
            .Select(m => new
            {
                m.IdMovimiento,
                m.IdLote,
                NombreProducto = m.Lote.Producto.Nombre,
                m.TipoMovimiento,
                m.Descripcion,
                m.Fecha
            }).ToListAsync();

        return Ok(pendientes);
    }

    // React llama a esto después de firmar en MetaMask y obtener el hash
    [HttpPost("guardar-hash")]
    public async Task<IActionResult> GuardarHash([FromBody] GuardarHashDto dto)
    {
        var existe = await _context.TransaccionesBlockchain
            .AnyAsync(t => t.IdMovimiento == dto.IdMovimiento);

        if (existe)
            return BadRequest(new { mensaje = "Este movimiento ya tiene hash registrado" });

        var transaccion = new TransaccionBlockchain
        {
            IdMovimiento = dto.IdMovimiento,
            TxHash = dto.TxHash,
            WalletOrigen = dto.WalletOrigen,
            Network = dto.Network,
            Fecha = DateTime.Now
        };

        _context.TransaccionesBlockchain.Add(transaccion);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Hash guardado correctamente", idTransaccion = transaccion.IdTransaccion });
    }

    [HttpGet("historial")]
    public async Task<IActionResult> GetHistorial()
    {
        var historial = await _context.TransaccionesBlockchain
            .Include(t => t.Movimiento).ThenInclude(m => m.Lote).ThenInclude(l => l.Producto)
            .Select(t => new
            {
                t.IdTransaccion,
                t.TxHash,
                t.WalletOrigen,
                t.Network,
                t.Fecha,
                NombreProducto = t.Movimiento.Lote.Producto.Nombre,
                TipoMovimiento = t.Movimiento.TipoMovimiento
            }).ToListAsync();

        return Ok(historial);
    }
}

public class GuardarHashDto
{
    public int IdMovimiento { get; set; }
    public string TxHash { get; set; } = string.Empty;
    public string? WalletOrigen { get; set; }
    public string? Network { get; set; }
}