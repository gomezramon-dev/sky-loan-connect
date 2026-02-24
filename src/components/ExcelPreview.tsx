import { Download, FileSpreadsheet, Table } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Client, FinancingData } from "@/lib/types";
import * as XLSX from "xlsx";

interface ExcelPreviewProps {
  client: Client;
  financing: FinancingData;
}

const tipoLabels: Record<string, string> = {
  credito_simple: "Crédito Simple",
  linea_credito: "Línea de Crédito",
  arrendamiento: "Arrendamiento",
  factoraje: "Factoraje",
  credito_puente: "Crédito Puente",
};

const ExcelPreview = ({ client, financing }: ExcelPreviewProps) => {
  const monthlyRate = financing.tasaInteres / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (financing.monto * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -financing.plazo))
      : financing.monto / financing.plazo;

  const rows = Array.from({ length: Math.min(financing.plazo, 12) }, (_, i) => {
    const period = i + 1;
    const interest = (financing.monto - (monthlyPayment - financing.monto * monthlyRate) * i) * monthlyRate;
    const capital = monthlyPayment - interest;
    const balance = financing.monto - capital * period;
    return {
      period,
      payment: monthlyPayment,
      capital: Math.max(capital, 0),
      interest: Math.max(interest, 0),
      balance: Math.max(balance, 0),
    };
  });

  const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

  const handleDownload = () => {
    const header = [
      ["SOLICITUD DE FINANCIAMIENTO"],
      [],
      ["Cliente", client.name],
      ["RFC", client.rfc],
      ["Tipo", tipoLabels[financing.tipo] || financing.tipo],
      ["Monto", financing.monto],
      ["Plazo (meses)", financing.plazo],
      ["Tasa (%)", financing.tasaInteres],
      ["Garantía", financing.garantia],
      ["Destino", financing.destino],
      ["Pago Mensual", monthlyPayment],
      [],
      ["TABLA DE AMORTIZACIÓN"],
      ["Período", "Pago", "Capital", "Interés", "Saldo"],
    ];

    const dataRows = rows.map((r) => [r.period, r.payment, r.capital, r.interest, r.balance]);

    const ws = XLSX.utils.aoa_to_sheet([...header, ...dataRows]);
    ws["!cols"] = [{ wch: 12 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Financiamiento");
    XLSX.writeFile(wb, `Financiamiento_${client.rfc}.xlsx`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Table className="w-4 h-4 text-primary" />
          Vista Previa — Tabla de Amortización
        </h3>
        <Button
          onClick={handleDownload}
          className="sky-gradient text-sky-foreground font-semibold hover:opacity-90 transition-opacity border-0 gap-2"
        >
          <Download className="w-4 h-4" />
          Descargar .xlsx
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Monto", value: fmt(financing.monto) },
          { label: "Plazo", value: `${financing.plazo} meses` },
          { label: "Tasa", value: `${financing.tasaInteres}%` },
          { label: "Pago Mensual", value: fmt(monthlyPayment) },
        ].map((s) => (
          <div key={s.label} className="bg-accent/40 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table Preview */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary/10">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-foreground">Período</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-foreground">Pago</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-foreground">Capital</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-foreground">Interés</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-foreground">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.period} className={`border-t border-border/50 ${i % 2 === 0 ? "bg-card" : "bg-secondary/30"}`}>
                  <td className="px-4 py-2 text-muted-foreground">{r.period}</td>
                  <td className="px-4 py-2 text-right font-mono text-foreground">{fmt(r.payment)}</td>
                  <td className="px-4 py-2 text-right font-mono text-foreground">{fmt(r.capital)}</td>
                  <td className="px-4 py-2 text-right font-mono text-foreground">{fmt(r.interest)}</td>
                  <td className="px-4 py-2 text-right font-mono text-foreground">{fmt(r.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {financing.plazo > 12 && (
          <div className="px-4 py-2 text-xs text-muted-foreground bg-secondary/30 text-center border-t border-border/50">
            Mostrando primeros 12 de {financing.plazo} períodos. El archivo completo se incluye en la descarga.
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="flex items-center gap-2 px-4 py-2 bg-accent/40 rounded-full">
          <FileSpreadsheet className="w-4 h-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            El archivo incluirá datos completos del cliente y la tabla de amortización
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExcelPreview;
