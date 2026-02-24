export interface Client {
  id: string;
  name: string;
  rfc: string;
  email: string;
  phone: string;
  sector: string;
  status: "activo" | "en_revision" | "pendiente";
  lastActivity: string;
  creditScore: number;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
}

export interface DocumentZone {
  reportesFinancieros: UploadedFile[];
  reportesFiscales: UploadedFile[];
  buroCredito: UploadedFile[];
}

export interface FinancingData {
  tipo: string;
  monto: number;
  plazo: number;
  tasaInteres: number;
  garantia: string;
  destino: string;
}

export const MOCK_CLIENTS: Client[] = [
  { id: "1", name: "Grupo Industrial Monterrey S.A.", rfc: "GIM850101ABC", email: "contacto@gim.mx", phone: "+52 81 1234 5678", sector: "Manufactura", status: "activo", lastActivity: "2024-01-15", creditScore: 780 },
  { id: "2", name: "Comercializadora del Pacífico", rfc: "CDP900215DEF", email: "admin@cdpacifico.mx", phone: "+52 33 9876 5432", sector: "Comercio", status: "en_revision", lastActivity: "2024-01-12", creditScore: 650 },
  { id: "3", name: "Tecnologías Avanzadas MX", rfc: "TAM880530GHI", email: "info@tamx.com", phone: "+52 55 5555 1234", sector: "Tecnología", status: "activo", lastActivity: "2024-01-18", creditScore: 820 },
  { id: "4", name: "Constructora del Valle", rfc: "CDV950710JKL", email: "gerencia@cdvalle.mx", phone: "+52 442 123 4567", sector: "Construcción", status: "pendiente", lastActivity: "2024-01-10", creditScore: 590 },
  { id: "5", name: "Agroindustrias del Norte", rfc: "ADN870320MNO", email: "ventas@adnorte.mx", phone: "+52 614 987 6543", sector: "Agroindustria", status: "activo", lastActivity: "2024-01-20", creditScore: 710 },
  { id: "6", name: "Servicios Logísticos Express", rfc: "SLE920805PQR", email: "ops@slexpress.mx", phone: "+52 222 456 7890", sector: "Logística", status: "en_revision", lastActivity: "2024-01-08", creditScore: 695 },
];
