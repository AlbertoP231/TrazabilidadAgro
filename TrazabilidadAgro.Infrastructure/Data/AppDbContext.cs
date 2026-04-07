using Microsoft.EntityFrameworkCore;
using TrazabilidadAgro.Domain.Entities;

namespace TrazabilidadAgro.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Rol> Roles { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Productor> Productores { get; set; }
    public DbSet<Producto> Productos { get; set; }
    public DbSet<Lote> Lotes { get; set; }
    public DbSet<Insumo> Insumos { get; set; }
    public DbSet<LoteInsumo> LoteInsumos { get; set; }
    public DbSet<MovimientoTrazabilidad> MovimientosTrazabilidad { get; set; }
    public DbSet<TransaccionBlockchain> TransaccionesBlockchain { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<DetallePedido> DetallesPedidos { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Mapeo de nombres de tablas exactos de tu BD
        modelBuilder.Entity<Rol>().ToTable("Roles").HasKey(r => r.IdRol);
        modelBuilder.Entity<Rol>().Property(r => r.IdRol).ValueGeneratedNever();

        modelBuilder.Entity<Usuario>().ToTable("Usuarios").HasKey(u => u.IdUsuario);
        modelBuilder.Entity<Usuario>().HasIndex(u => u.Email).IsUnique();
        modelBuilder.Entity<Usuario>()
            .HasOne(u => u.Rol)
            .WithMany(r => r.Usuarios)
            .HasForeignKey(u => u.IdRol);

        modelBuilder.Entity<Productor>().ToTable("Productores").HasKey(p => p.IdProductor);
        modelBuilder.Entity<Productor>()
            .HasOne(p => p.Usuario)
            .WithOne(u => u.Productor)
            .HasForeignKey<Productor>(p => p.IdUsuario);

        modelBuilder.Entity<Producto>().ToTable("Productos").HasKey(p => p.IdProducto);
        modelBuilder.Entity<Producto>()
            .HasOne(p => p.Productor)
            .WithMany(pr => pr.Productos)
            .HasForeignKey(p => p.IdProductor);

        modelBuilder.Entity<Lote>().ToTable("Lotes").HasKey(l => l.IdLote);
        modelBuilder.Entity<Lote>()
            .HasOne(l => l.Producto)
            .WithMany(p => p.Lotes)
            .HasForeignKey(l => l.IdProducto);

        modelBuilder.Entity<Insumo>().ToTable("Insumos").HasKey(i => i.IdInsumo);

        modelBuilder.Entity<LoteInsumo>().ToTable("Lote_Insumos").HasKey(li => li.IdLoteInsumo);
        modelBuilder.Entity<LoteInsumo>()
            .HasOne(li => li.Lote)
            .WithMany(l => l.LoteInsumos)
            .HasForeignKey(li => li.IdLote);
        modelBuilder.Entity<LoteInsumo>()
            .HasOne(li => li.Insumo)
            .WithMany(i => i.LoteInsumos)
            .HasForeignKey(li => li.IdInsumo);

        modelBuilder.Entity<MovimientoTrazabilidad>().ToTable("Movimientos_Trazabilidad")
            .HasKey(m => m.IdMovimiento);
        modelBuilder.Entity<MovimientoTrazabilidad>()
            .HasOne(m => m.Lote)
            .WithMany(l => l.Movimientos)
            .HasForeignKey(m => m.IdLote);
        modelBuilder.Entity<MovimientoTrazabilidad>()
            .HasOne(m => m.Usuario)
            .WithMany(u => u.Movimientos)
            .HasForeignKey(m => m.RegistradoPor);

        modelBuilder.Entity<TransaccionBlockchain>().ToTable("Transacciones_Blockchain")
            .HasKey(t => t.IdTransaccion);
        modelBuilder.Entity<TransaccionBlockchain>()
            .HasOne(t => t.Movimiento)
            .WithOne(m => m.Transaccion)
            .HasForeignKey<TransaccionBlockchain>(t => t.IdMovimiento);

        modelBuilder.Entity<Pedido>().ToTable("Pedidos").HasKey(p => p.IdPedido);
        modelBuilder.Entity<Pedido>()
            .HasOne(p => p.Usuario)
            .WithMany(u => u.Pedidos)
            .HasForeignKey(p => p.IdUsuario);

        modelBuilder.Entity<DetallePedido>().ToTable("Detalle_Pedidos").HasKey(d => d.IdDetalle);
        modelBuilder.Entity<DetallePedido>()
            .HasOne(d => d.Pedido)
            .WithMany(p => p.Detalles)
            .HasForeignKey(d => d.IdPedido);
        modelBuilder.Entity<DetallePedido>()
            .HasOne(d => d.Producto)
            .WithMany(p => p.DetallesPedido)
            .HasForeignKey(d => d.IdProducto);

        // Seed de roles
        modelBuilder.Entity<Rol>().HasData(
            new Rol { IdRol = 1, Nombre = "ADMIN", Descripcion = "Administrador del sistema" },
            new Rol { IdRol = 2, Nombre = "PRODUCTOR", Descripcion = "Productor agrícola" },
            new Rol { IdRol = 3, Nombre = "CLIENTE", Descripcion = "Cliente consumidor" }
        );
    }
}