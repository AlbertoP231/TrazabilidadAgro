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
public class ProductosController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IWebHostEnvironment _env;

    public ProductosController(AppDbContext context, IWebHostEnvironment env)
    {
        _context = context;
        _env = env;
    }

    [HttpGet]
    public async Task<IActionResult> GetTodos()
    {
        var productos = await _context.Productos
            .Include(p => p.Productor).ThenInclude(pr => pr.Usuario)
            .Select(p => new ProductoDto
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Precio = p.Precio,
                IdProductor = p.IdProductor,
                NombreProductor = p.Productor.Usuario.Nombre,
                ImagenUrl = p.ImagenUrl
            }).ToListAsync();

        return Ok(productos);
    }

    [HttpGet("mis-productos")]
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> GetMisProductos()
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        if (productor == null)
            return NotFound(new { mensaje = "Perfil de productor no encontrado" });

        var productos = await _context.Productos
            .Where(p => p.IdProductor == productor.IdProductor)
            .Select(p => new ProductoDto
            {
                IdProducto = p.IdProducto,
                Nombre = p.Nombre,
                Descripcion = p.Descripcion,
                Precio = p.Precio,
                IdProductor = p.IdProductor,
                ImagenUrl = p.ImagenUrl
            }).ToListAsync();

        return Ok(productos);
    }

    [HttpPost]
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> Crear([FromBody] CrearProductoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        if (productor == null)
            return NotFound(new { mensaje = "Perfil de productor no encontrado" });

        var producto = new Producto
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            IdProductor = productor.IdProductor,
            ImagenUrl = dto.ImagenUrl
        };

        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();

        return Ok(new { mensaje = "Producto creado", idProducto = producto.IdProducto });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] CrearProductoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.IdProducto == id && p.IdProductor == productor!.IdProductor);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Precio = dto.Precio;
        producto.ImagenUrl = dto.ImagenUrl;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Producto actualizado" });
    }

    // Subida de imagen al servidor
    [HttpPost("{id}/imagen")]
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> SubirImagen(int id, IFormFile archivo)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.IdProducto == id && p.IdProductor == productor!.IdProductor);

        if (producto == null)
            return NotFound();

        if (archivo == null || archivo.Length == 0)
            return BadRequest(new { mensaje = "No se recibió archivo" });

        var extensionesPermitidas = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var extension = Path.GetExtension(archivo.FileName).ToLower();

        if (!extensionesPermitidas.Contains(extension))
            return BadRequest(new { mensaje = "Solo se permiten imágenes jpg, png, webp" });

        var carpeta = Path.Combine(_env.WebRootPath ?? "wwwroot", "imagenes", "productos");
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"producto_{id}_{Guid.NewGuid()}{extension}";
        var rutaCompleta = Path.Combine(carpeta, nombreArchivo);

        using (var stream = new FileStream(rutaCompleta, FileMode.Create))
        {
            await archivo.CopyToAsync(stream);
        }

        producto.ImagenUrl = $"/imagenes/productos/{nombreArchivo}";
        await _context.SaveChangesAsync();

        return Ok(new { imagenUrl = producto.ImagenUrl });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PRODUCTOR")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores
            .FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        var producto = await _context.Productos
            .FirstOrDefaultAsync(p => p.IdProducto == id && p.IdProductor == productor!.IdProductor);

        if (producto == null)
            return NotFound(new { mensaje = "Producto no encontrado" });

        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Producto eliminado" });
    }
}