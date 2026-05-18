using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    [Authorize(Roles = "CLIENTE")]
    public async Task<IActionResult> GetMisPedidos()
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var pedidos = await _context.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .Where(p => p.IdUsuario == idUsuario)
            .OrderByDescending(p => p.Fecha)
            .Select(p => new
            {
                p.IdPedido,
                p.Fecha,
                p.Estado,
                p.Total,
                Detalles = p.Detalles.Select(d => new
                {
                    d.IdDetalle,
                    d.IdProducto,
                    NombreProducto = d.Producto.Nombre,
                    d.Cantidad,
                    d.Precio
                })
            }).ToListAsync();

        return Ok(pedidos);
    }

    // Admin ve todos los pedidos
    [HttpGet("todos")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> GetTodos()
    {
        var pedidos = await _context.Pedidos
            .Include(p => p.Usuario)
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .OrderByDescending(p => p.Fecha)
            .Select(p => new
            {
                p.IdPedido,
                p.Fecha,
                p.Estado,
                p.Total,
                NombreCliente = p.Usuario.Nombre,
                EmailCliente = p.Usuario.Email,
                Detalles = p.Detalles.Select(d => new
                {
                    d.IdDetalle,
                    NombreProducto = d.Producto.Nombre,
                    d.Cantidad,
                    d.Precio
                })
            }).ToListAsync();

        return Ok(pedidos);
    }

    // Admin cambia estado del pedido
    [HttpPut("{id}/estado")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CambiarEstado(int id, [FromBody] CambiarEstadoDto dto)
    {
        var estadosValidos = new[] { "PENDIENTE", "EN_PROCESO", "ENTREGADO", "CANCELADO" };

        if (!estadosValidos.Contains(dto.Estado))
            return BadRequest(new { mensaje = "Estado no válido" });

        var pedido = await _context.Pedidos.FindAsync(id);
        if (pedido == null)
            return NotFound(new { mensaje = "Pedido no encontrado" });

        pedido.Estado = dto.Estado;
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = $"Pedido actualizado a {dto.Estado}" });
    }

    [HttpPost]
    [Authorize(Roles = "CLIENTE")]
    public async Task<IActionResult> Crear([FromBody] CrearPedidoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var pedido = new Pedido
            {
                IdUsuario = idUsuario,
                Fecha = DateTime.Now,
                Estado = "PENDIENTE",
                Total = dto.Detalles.Sum(d => d.Precio * d.Cantidad),
                Detalles = new List<DetallePedido>()
            };

            _context.Pedidos.Add(pedido);

            foreach (var item in dto.Detalles)
            {
                // 1. Buscar el lote específico seleccionado por el cliente
                var lote = await _context.Lotes.FindAsync(item.IdLote);

                if (lote == null || lote.IdProducto != item.IdProducto)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { mensaje = $"El lote especificado para el producto ID {item.IdProducto} no existe o no coincide." });
                }

                // 2. Validar inventario del lote seleccionado
                decimal disponible = lote.CantidadDisponible ?? 0m;
                if (disponible < item.Cantidad)
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { mensaje = $"Inventario insuficiente para {lote.CodigoQr}. Solicitado: {item.Cantidad} kg, Disponible: {disponible} kg." });
                }

                // 3. Descontar el stock del lote
                lote.CantidadDisponible -= item.Cantidad;

                // 4. Registrar movimiento en el libro mayor de trazabilidad
                var movimiento = new MovimientoTrazabilidad
                {
                    IdLote = lote.IdLote,
                    TipoMovimiento = "Venta a Cliente",
                    Descripcion = $"Salida de {item.Cantidad} kg mediante compra directa en catálogo.",
                    Fecha = DateTime.Now,
                    RegistradoPor = idUsuario
                };
                _context.MovimientosTrazabilidad.Add(movimiento);

                // 5. Vincular al detalle del pedido con su lote correspondiente
                pedido.Detalles.Add(new DetallePedido
                {
                    IdProducto = item.IdProducto,
                    IdLote = item.IdLote, // <--- AGREGAR ESTA LÍNEA
                    Cantidad = item.Cantidad,
                    Precio = item.Precio
                });
            }

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();

            return Ok(new { mensaje = "Pedido creado con trazabilidad directa", idPedido = pedido.IdPedido });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new { mensaje = "Error al procesar la compra dirigida", detalle = ex.Message });
        }
    }
}

    public class CambiarEstadoDto
{
    public string Estado { get; set; } = string.Empty;
}

public class CrearPedidoDto
{
    public List<DetallePedidoDto> Detalles { get; set; } = new();
}

public class DetallePedidoDto
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }

    public int IdLote { get; set; }
    public decimal Precio { get; set; }
}