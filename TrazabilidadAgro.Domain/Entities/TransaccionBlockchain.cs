namespace TrazabilidadAgro.Domain.Entities;

public class TransaccionBlockchain
{
    public int IdTransaccion { get; set; }
    public int IdMovimiento { get; set; }
    public string? TxHash { get; set; }
    public string? WalletOrigen { get; set; }
    public string? Network { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;

    public MovimientoTrazabilidad Movimiento { get; set; } = null!;
}