using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InsumosController : ControllerBase
{
    private readonly AppDbContext _context;

    public InsumosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTodos()
    {
        var insumos = await _context.Insumos.ToListAsync();
        return Ok(insumos);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,PRODUCTOR")]
    public async Task<IActionResult> Crear([FromBody] CrearInsumoDto dto)
    {
        var insumo = new Insumo
        {
            Nombre = dto.Nombre,
            Tipo = dto.Tipo
        };

        _context.Insumos.Add(insumo);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Insumo creado", idInsumo = insumo.IdInsumo });
    }
}

public class CrearInsumoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
}