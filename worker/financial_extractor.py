"""
Extracción de datos de Estados Financieros (PDF) usando datalab_sdk.
Convierte base64 de incomeStatement y balanceSheet en objetos estructurados.
"""
import base64
import json
import os
import tempfile
from pathlib import Path

from datalab_sdk import DatalabClient, ExtractOptions

# Schema para Estado de Resultados (incomeStatement)
INCOME_STATEMENT_SCHEMA = {
    "type": "object",
    "properties": {
        "ventas": {
            "type": "number",
            "description": "Llamado también Total de Ingresos",
        },
        "costos_de_venta": {
            "type": "number",
            "description": "Llamado también Costo Directo Producción",
        },
        "gastos_de_operacion": {
            "type": "number",
            "description": "Llamado también Gastos de Administración",
        },
        "gastos_financieros": {
            "type": "number",
            "description": "Gastos derivados de financiamientos o intereses",
        },
        "otros_productos": {
            "type": "number",
            "description": "Ingresos secundarios no relacionados con la actividad principal",
        },
        "otros_gastos": {
            "type": "number",
            "description": "Gastos secundarios no relacionados con la actividad principal",
        },
        "impuestos": {
            "type": "number",
            "description": "Llamado también como Provisión de ISR y PTU",
        },
    },
    "required": ["ventas", "costos_de_venta", "gastos_de_operacion", "impuestos"],
}

# Schema para Balance General (balanceSheet)
BALANCE_SHEET_SCHEMA = {
    "type": "object",
    "properties": {
        "activo_circulante": {
            "type": "number",
            "description": "Es el total de todo lo Circulante",
        },
        "efectivo_y_equivalentes": {
            "type": "number",
            "description": "Llamado también como Bancos",
        },
        "inventarios": {
            "type": "number",
            "description": "Valor total de mercancías o inventarios",
        },
        "clientes": {
            "type": "number",
            "description": "Saldos pendientes de cobro por ventas",
        },
        "deudores_diversos": {
            "type": "number",
            "description": "Cuentas por cobrar distintas a clientes",
        },
        "activo_fijo": {
            "type": "number",
            "description": "Es el total de todo lo de Activo Fijo",
        },
        "terreno_y_edificios": {
            "type": "number",
            "description": "Llamado también como Terreno y Edificación",
        },
        "maquinaria_y_equipo": {
            "type": "number",
            "description": "Llamado también como Maq. y equipo",
        },
        "equipo_de_transporte": {
            "type": "number",
            "description": "Valor del parque vehicular de la empresa",
        },
        "depreciacion_acumulada": {
            "type": "number",
            "description": "Suma todos los Depreciación Acumulada",
        },
        "otros_activos": {
            "type": "number",
            "description": "Suma de todo lo Activo Diferido",
        },
        "activo_total": {
            "type": "number",
            "description": "También llamado Suma del Activo",
        },
        "pasivo_circulante": {
            "type": "number",
            "description": "El total de pasivo circulante",
        },
        "proveedores": {
            "type": "number",
            "description": "Adeudos con proveedores de mercancía",
        },
        "acreedores_diversos": {
            "type": "number",
            "description": "Adeudos por conceptos distintos a mercancía",
        },
        "docs_x_pagar_cp": {
            "type": "number",
            "description": "Documentos por pagar a Corto Plazo",
        },
        "pasivo_largo_plazo": {
            "type": "number",
            "description": "Total de pasivos con vencimiento mayor a un año",
        },
        "docs_x_pagar_lp": {
            "type": "number",
            "description": "Documentos por pagar a Largo Plazo",
        },
        "otros_pasivos": {
            "type": "number",
            "description": "Otros pasivos no clasificados anteriormente",
        },
        "pasivo_total": {
            "type": "number",
            "description": "También llamado como el total de Pasivo",
        },
        "capital_social": {
            "type": "number",
            "description": "Aportaciones de los socios o dueños",
        },
        "ut_ejercicios_anteriores": {
            "type": "number",
            "description": "También llamado como Res. Ejer Ant.",
        },
        "capital_contable": {
            "type": "number",
            "description": "El total de Capital",
        },
    },
    "required": ["activo_total", "pasivo_total", "capital_contable"],
}


def _extract_from_pdf(pdf_bytes: bytes, schema: dict) -> dict:
    """
    Extrae datos estructurados de un PDF usando datalab_sdk.
    """
    api_key = (os.getenv("DATALAB_API_KEY") or "").strip()
    if not api_key:
        raise ValueError("DATALAB_API_KEY no está configurada en .env")
    client = DatalabClient(api_key=api_key)
    options = ExtractOptions(
        page_schema=json.dumps(schema),
        mode="balanced",
    )

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        result = client.extract(tmp_path, options=options)
        return json.loads(result.extraction_schema_json)
    finally:
        Path(tmp_path).unlink(missing_ok=True)


def extract_income_statement(base64_pdf: str) -> dict:
    """Extrae Estado de Resultados de un PDF en base64."""
    pdf_bytes = base64.b64decode(base64_pdf)
    return _extract_from_pdf(pdf_bytes, INCOME_STATEMENT_SCHEMA)


def extract_balance_sheet(base64_pdf: str) -> dict:
    """Extrae Balance General de un PDF en base64."""
    pdf_bytes = base64.b64decode(base64_pdf)
    return _extract_from_pdf(pdf_bytes, BALANCE_SHEET_SCHEMA)


def process_financial_statements(financial_statements: dict | None) -> dict | None:
    """
    Procesa financialStatements: si incomeStatement y balanceSheet son base64,
    los extrae con datalab_sdk y los reemplaza por objetos.
    Si ya son objetos (dict), los deja intactos.
    """
    if not financial_statements:
        return financial_statements

    result = {}
    for year, data in financial_statements.items():
        if not isinstance(data, dict):
            result[year] = data
            continue

        year_data = dict(data)

        # incomeStatement: base64 -> extraer; dict -> usar tal cual
        inc = data.get("incomeStatement")
        if isinstance(inc, str):
            print(f"[DEBUG] Extrayendo incomeStatement año {year} (base64, {len(inc)} chars)...")
            year_data["incomeStatement"] = extract_income_statement(inc)
            print(f"[DEBUG] incomeStatement extraído: {list(year_data['incomeStatement'].keys())}")
        elif isinstance(inc, dict):
            print(f"[DEBUG] Año {year}: incomeStatement ya es dict, usando tal cual")
            year_data["incomeStatement"] = inc
        else:
            print(f"[DEBUG] Año {year}: incomeStatement ausente o tipo inesperado: {type(inc)}")

        # balanceSheet: base64 -> extraer; dict -> usar tal cual
        bal = data.get("balanceSheet")
        if isinstance(bal, str):
            print(f"[DEBUG] Extrayendo balanceSheet año {year} (base64, {len(bal)} chars)...")
            year_data["balanceSheet"] = extract_balance_sheet(bal)
            print(f"[DEBUG] balanceSheet extraído: {list(year_data['balanceSheet'].keys())}")
        elif isinstance(bal, dict):
            print(f"[DEBUG] Año {year}: balanceSheet ya es dict, usando tal cual")
            year_data["balanceSheet"] = bal
        else:
            print(f"[DEBUG] Año {year}: balanceSheet ausente o tipo inesperado: {type(bal)}")

        result[year] = year_data

    return result
