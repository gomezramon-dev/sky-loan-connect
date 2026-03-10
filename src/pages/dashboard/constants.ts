export const MONTHS = [
  { value: "01", label: "Enero" },
  { value: "02", label: "Febrero" },
  { value: "03", label: "Marzo" },
  { value: "04", label: "Abril" },
  { value: "05", label: "Mayo" },
  { value: "06", label: "Junio" },
  { value: "07", label: "Julio" },
  { value: "08", label: "Agosto" },
  { value: "09", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" },
] as const;

export const CREDIT_TYPES = [
  {
    value: "capital_trabajo",
    label: "Capital de Trabajo",
    description: "Financiamiento para operaciones del día a día",
  },
  {
    value: "adquisicion_activos",
    label: "Adquisición de Activos",
    description: "Compra de maquinaria, equipo o inmuebles",
  },
  {
    value: "proyectos_inversion",
    label: "Proyectos de Inversión y Crecimiento",
    description: "Expansión, nuevos mercados o líneas de negocio",
  },
] as const;

export const FORMALIDAD_TYPES = [
  {
    value: "total",
    label: "Total",
    description: "Empresa con contabilidad formal completa",
  },
  {
    value: "parcial",
    label: "Parcial",
    description: "Contabilidad parcialmente formalizada",
  },
  {
    value: "basica",
    label: "Básica",
    description: "Registros contables básicos o simplificados",
  },
  {
    value: "informal",
    label: "Informal",
    description: "Sin contabilidad formal registrada",
  },
] as const;

export const FORMALIDAD_TO_NUMBER: Record<string, number> = {
  total: 100,
  parcial: 70,
  basica: 50,
  informal: 30,
};

export const ACCEPTED_FILE_TYPES = ".xlsx,.xls,.pdf,.csv";
