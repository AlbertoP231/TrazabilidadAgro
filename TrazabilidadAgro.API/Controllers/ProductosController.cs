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

    public ProductosController(AppDbContext context)
    {
        _context = context;
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
    [Authorize(Roles = "PRODUCTOR,Productor")]
    public async Task<IActionResult> GetMisProductos()
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores.FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);
        if (productor == null) return NotFound(new { mensaje = "Perfil no encontrado" });

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
    [Authorize(Roles = "PRODUCTOR,Productor")]
    public async Task<IActionResult> Crear([FromBody] CrearProductoDto dto)
    {
        var idUsuario = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var productor = await _context.Productores.FirstOrDefaultAsync(p => p.IdUsuario == idUsuario);

        var producto = new Producto
        {
            Nombre = dto.Nombre,
            Descripcion = dto.Descripcion,
            Precio = dto.Precio,
            IdProductor = productor!.IdProductor,
            ImagenUrl = dto.ImagenUrl
        };
        _context.Productos.Add(producto);
        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Producto creado", idProducto = producto.IdProducto });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "PRODUCTOR,Productor")]
    public async Task<IActionResult> Actualizar(int id, [FromBody] CrearProductoDto dto)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();

        producto.Nombre = dto.Nombre;
        producto.Descripcion = dto.Descripcion;
        producto.Precio = dto.Precio;
        if (!string.IsNullOrEmpty(dto.ImagenUrl)) producto.ImagenUrl = dto.ImagenUrl;

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Producto actualizado" });
    }

    // EL MÉTODO QUE TE DABA 404 (RESTAURADO Y CORREGIDO)
    [HttpPost("{id}/imagen")]
    [Authorize(Roles = "PRODUCTOR,Productor")]
    public async Task<IActionResult> SubirImagen(int id, IFormFile archivo)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();

        if (archivo != null && archivo.Length > 0)
        {
            var nombreArchivo = $"prod_{id}_{Guid.NewGuid()}{Path.GetExtension(archivo.FileName)}";
            var rutaUploads = Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
            if (!Directory.Exists(rutaUploads)) Directory.CreateDirectory(rutaUploads);

            var rutaCompleta = Path.Combine(rutaUploads, nombreArchivo);
            using (var stream = new FileStream(rutaCompleta, FileMode.Create))
            {
                await archivo.CopyToAsync(stream);
            }

            producto.ImagenUrl = nombreArchivo; // Guardamos solo el nombre
            await _context.SaveChangesAsync();
            return Ok(new { imagenUrl = nombreArchivo });
        }
        return BadRequest("No se recibió imagen");
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "PRODUCTOR,Productor")]
    public async Task<IActionResult> Eliminar(int id)
    {
        var producto = await _context.Productos.FindAsync(id);
        if (producto == null) return NotFound();
        _context.Productos.Remove(producto);
        await _context.SaveChangesAsync();
        return Ok();
    }
}