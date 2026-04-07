using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TrazabilidadAgro.Application.DTOs;
using TrazabilidadAgro.Domain.Entities;
using TrazabilidadAgro.Infrastructure.Data;

namespace TrazabilidadAgro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Rol)
            .FirstOrDefaultAsync(u => u.Email == dto.Email && u.Activo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
            return Unauthorized(new { mensaje = "Credenciales incorrectas" });

        var token = GenerarToken(usuario);

        return Ok(new LoginResponseDto
        {
            Token = token,
            Nombre = usuario.Nombre,
            Email = usuario.Email,
            Rol = usuario.Rol.Nombre,
            IdUsuario = usuario.IdUsuario
        });
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Registro([FromBody] RegisterRequestDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { mensaje = "El email ya está registrado" });

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            IdRol = dto.IdRol,
            Activo = true,
            FechaCreacion = DateTime.Now
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        // Si es productor crear perfil de productor automáticamente
        if (dto.IdRol == 2)
        {
            _context.Productores.Add(new Productor { IdUsuario = usuario.IdUsuario });
            await _context.SaveChangesAsync();
        }

        return Ok(new { mensaje = "Usuario registrado correctamente", idUsuario = usuario.IdUsuario });
    }

    private string GenerarToken(Usuario usuario)
    {
        var jwtSettings = _config.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["SecretKey"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.IdUsuario.ToString()),
            new Claim(ClaimTypes.Email, usuario.Email),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Role, usuario.Rol.Nombre)
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(double.Parse(jwtSettings["ExpirationHours"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}