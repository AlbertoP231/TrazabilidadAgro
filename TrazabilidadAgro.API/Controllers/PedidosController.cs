using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "CLIENTE")]
public class PedidosController : ControllerBase
{
    private readonly AppDbContext _context;

    public PedidosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetMisPedidos()
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var pedidos = await _context.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .Where(p => p.IdUsuario == idUsuario)
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

    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] CrearPedidoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var pedido = new Pedido
        {
            IdUsuario = idUsuario,
            Fecha = DateTime.Now,
            Estado = "PENDIENTE",
            Total = dto.Detalles.Sum(d => d.Precio * d.Cantidad),
            Detalles = dto.Detalles.Select(d => new DetallePedido
            {
                IdProducto = d.IdProducto,
                Cantidad = d.Cantidad,
                Precio = d.Precio
            }).ToList()
        };

        _context.Pedidos.Add(pedido);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Pedido creado", idPedido = pedido.IdPedido });
    }
}

public class CrearPedidoDto
{
    public List<DetallePedidoDto> Detalles { get; set; } = new();
}

public class DetallePedidoDto
{
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
    public decimal Precio { get; set; }
}