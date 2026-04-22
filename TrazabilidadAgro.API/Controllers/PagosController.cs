using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MercadoPago.Config;
using MercadoPago.Client.Preference;
using MercadoPago.Resource.Preference;
using MercadoPago.Client.Payment;
using TrazabilidadAgro.Infrastructure.Data;
using System.Net;

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
        try
        {
            var pedido = await _context.Pedidos
                .Include(p => p.Detalles).ThenInclude(d => d.Producto)
                .FirstOrDefaultAsync(p => p.IdPedido == idPedido);

            if (pedido == null)
                return NotFound(new { mensaje = "Pedido no encontrado" });

            // 1. Configurar Access Token (Asegúrate que en appsettings empiece con TEST-)
            var accessToken = _config["MercadoPago:AccessToken"];
            if (string.IsNullOrEmpty(accessToken))
            {
                return StatusCode(500, new { error = "Configuración faltante", detalle = "AccessToken no configurado" });
            }
            MercadoPagoConfig.AccessToken = accessToken;

            var client = new PreferenceClient();

            // 2. Mapear items (Validando que el precio sea mayor a 0)
            var items = pedido.Detalles.Select(d => new PreferenceItemRequest
            {
                Title = d.Producto.Nombre,
                Quantity = d.Cantidad ?? 1,
                UnitPrice = d.Precio > 0 ? d.Precio : 1,
                CurrencyId = "MXN"
            }).ToList();

            // 3. Crear la solicitud de preferencia
            var request = new PreferenceRequest
            {
                Items = items,
                ExternalReference = idPedido.ToString(),
                // Simplificamos las URLs para evitar el error 400 en localhost
                BackUrls = new PreferenceBackUrlsRequest
                {
                    Success = "http://localhost:5173/pago/exitoso",
                    Failure = "http://localhost:5173/pago/fallido",
                    Pending = "http://localhost:5173/pago/pendiente"
                },
                // Mantenemos AutoReturn desactivado para entornos de desarrollo local
                AutoReturn = null,
                // NotificationUrl = "https://tu-url-ngrok.com/api/pagos/webhook" 
            };

            // 4. Ejecutar creación en Mercado Pago
            Preference preference = await client.CreateAsync(request);

            // Devolvemos el sandboxInitPoint que es el que usarás con tu token TEST
            return Ok(new
            {
                preferenceId = preference.Id,
                initPoint = preference.InitPoint,
                sandboxInitPoint = preference.SandboxInitPoint
            });
        }
        catch (MercadoPago.Error.MercadoPagoApiException apiEx)
        {
            int statusCode = apiEx.StatusCode.HasValue
                ? (int)apiEx.StatusCode.Value
                : (int)HttpStatusCode.InternalServerError;

            return StatusCode(statusCode, new
            {
                error = "Error de API Mercado Pago",
                detalle = apiEx.Message
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Error interno", detalle = ex.Message });
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromQuery] string? type, [FromQuery(Name = "data.id")] string? dataId)
    {
        if (type == "payment" && dataId != null)
        {
            try
            {
                MercadoPagoConfig.AccessToken = _config["MercadoPago:AccessToken"]!;
                var paymentClient = new PaymentClient();
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
            catch (Exception ex)
            {
                Console.WriteLine($"Error en Webhook: {ex.Message}");
            }
        }
        return Ok();
    }
}