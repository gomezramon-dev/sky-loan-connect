import { useState } from "react";
import { DollarSign, Calendar, Percent, Shield, Target } from "lucide-react";
import { FinancingData } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FinancingFormProps {
  onSubmit: (data: FinancingData) => void;
  loading: boolean;
}

const FinancingForm = ({ onSubmit, loading }: FinancingFormProps) => {
  const [data, setData] = useState<FinancingData>({
    tipo: "",
    monto: 0,
    plazo: 12,
    tasaInteres: 12.5,
    garantia: "",
    destino: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.tipo) e.tipo = "Seleccione un tipo";
    if (data.monto <= 0) e.monto = "Ingrese un monto válido";
    if (data.plazo <= 0) e.plazo = "Ingrese un plazo válido";
    if (!data.destino) e.destino = "Ingrese el destino del crédito";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-primary" />
        Solicitud de Financiamiento
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Tipo de Financiamiento</Label>
          <Select value={data.tipo} onValueChange={(v) => setData({ ...data, tipo: v })}>
            <SelectTrigger className="h-10 bg-secondary/50">
              <SelectValue placeholder="Seleccionar tipo..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credito_simple">Crédito Simple</SelectItem>
              <SelectItem value="linea_credito">Línea de Crédito</SelectItem>
              <SelectItem value="arrendamiento">Arrendamiento</SelectItem>
              <SelectItem value="factoraje">Factoraje</SelectItem>
              <SelectItem value="credito_puente">Crédito Puente</SelectItem>
            </SelectContent>
          </Select>
          {errors.tipo && <p className="text-xs text-destructive">{errors.tipo}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Monto Solicitado (MXN)</Label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              placeholder="1,000,000"
              value={data.monto || ""}
              onChange={(e) => setData({ ...data, monto: Number(e.target.value) })}
              className="pl-10 h-10 bg-secondary/50"
            />
          </div>
          {errors.monto && <p className="text-xs text-destructive">{errors.monto}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Plazo (meses)</Label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              value={data.plazo}
              onChange={(e) => setData({ ...data, plazo: Number(e.target.value) })}
              className="pl-10 h-10 bg-secondary/50"
            />
          </div>
          {errors.plazo && <p className="text-xs text-destructive">{errors.plazo}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Tasa de Interés (%)</Label>
          <div className="relative">
            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              step="0.1"
              value={data.tasaInteres}
              onChange={(e) => setData({ ...data, tasaInteres: Number(e.target.value) })}
              className="pl-10 h-10 bg-secondary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Garantía</Label>
          <div className="relative">
            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Hipotecaria, prendaria..."
              value={data.garantia}
              onChange={(e) => setData({ ...data, garantia: e.target.value })}
              className="pl-10 h-10 bg-secondary/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-foreground">Destino del Crédito</Label>
          <div className="relative">
            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Capital de trabajo, expansión..."
              value={data.destino}
              onChange={(e) => setData({ ...data, destino: e.target.value })}
              className="pl-10 h-10 bg-secondary/50"
            />
          </div>
          {errors.destino && <p className="text-xs text-destructive">{errors.destino}</p>}
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 sky-gradient text-sky-foreground font-semibold hover:opacity-90 transition-opacity border-0"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-sky-foreground/30 border-t-sky-foreground rounded-full animate-spin" />
            Procesando...
          </div>
        ) : (
          "Continuar / Generar"
        )}
      </Button>
    </form>
  );
};

export default FinancingForm;
