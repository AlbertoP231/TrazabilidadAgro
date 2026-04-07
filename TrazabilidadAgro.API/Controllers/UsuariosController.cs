using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN")]
public class UsuariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsuariosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetTodos()
    {
        var usuarios = await _context.Usuarios
            .Include(u => u.Rol)
            .Select(u => new
            {
                u.IdUsuario,
                u.Nombre,
                u.Email,
                u.Activo,
                u.FechaCreacion,
                Rol = u.Rol.Nombre
            }).ToListAsync();

        return Ok(usuarios);
    }

    [HttpPut("{id}/activar")]
    public async Task<IActionResult> Activar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        usuario.Activo = true;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Usuario activado" });
    }

    [HttpPut("{id}/desactivar")]
    public async Task<IActionResult> Desactivar(int id)
    {
        var usuario = await _context.Usuarios.FindAsync(id);
        if (usuario == null) return NotFound();

        usuario.Activo = false;
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Usuario desactivado" });
    }
}