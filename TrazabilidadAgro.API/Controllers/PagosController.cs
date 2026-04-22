using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoPago.Config;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Preference;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PagosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public PagosController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("crear-preferencia/{idPedido}")]
    [Authorize(Roles = "CLIENTE")]
    public async Task<IActionResult> CrearPreferencia(int idPedido)
    {
        var pedido = await _context.Pedidos
            .Include(p => p.Detalles).ThenInclude(d => d.Producto)
            .FirstOrDefaultAsync(p => p.IdPedido == idPedido);

        if (pedido == null)
            return NotFound(new { mensaje = "Pedido no encontrado" });

        // Configura el token de MercadoPago
        MercadoPagoConfig.AccessToken = _config["MercadoPago:AccessToken"]!;

        var client = new PreferenceClient();

        var items = pedido.Detalles.Select(d => new PreferenceItemRequest
        {
            Title = d.Producto.Nombre,
            Quantity = d.Cantidad ?? 1,
            UnitPrice = d.Precio ?? 0,
            CurrencyId = "MXN"
        }).ToList();

        var request = new PreferenceRequest
        {
            Items = items,
            ExternalReference = idPedido.ToString(),
            BackUrls = new PreferenceBackUrlsRequest
            {
                Success = $"http://localhost:5173/pago/exitoso?pedido={idPedido}",
                Failure = $"http://localhost:5173/pago/fallido?pedido={idPedido}",
                Pending = $"http://localhost:5173/pago/pendiente?pedido={idPedido}"
            },
            AutoReturn = "approved",
            NotificationUrl = $"http://localhost:5000/api/pagos/webhook"
        };

        Preference preference = await client.CreateAsync(request);

        return Ok(new
        {
            preferenceId = preference.Id,
            initPoint = preference.InitPoint,       // URL producción
            sandboxInitPoint = preference.SandboxInitPoint // URL sandbox (usa esta)
        });
    }

    // MercadoPago llama a este endpoint cuando cambia el estado del pago
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromQuery] string? type, [FromQuery(Name = "data.id")] string? dataId)
    {
        if (type == "payment" && dataId != null)
        {
            MercadoPagoConfig.AccessToken = _config["MercadoPago:AccessToken"]!;

            var paymentClient = new MercadoPago.Client.Payment.PaymentClient();
            var payment = await paymentClient.GetAsync(long.Parse(dataId));

            if (payment.Status == "approved" && payment.ExternalReference != null)
            {
                var idPedido = int.Parse(payment.ExternalReference);
                var pedido = await _context.Pedidos.FindAsync(idPedido);

                if (pedido != null)
                {
                    pedido.Estado = "EN_PROCESO";
                    await _context.SaveChangesAsync();
                }
            }
        }

        return Ok();
    }
}