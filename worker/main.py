"""
Worker de extracción OCR para bank statements y generación de Master Cliente.
Endpoints: /extract-bank-statements, /generate-master
"""
from dotenv import load_dotenv

load_dotenv()

import os

# Debug: verificar que DATALAB_API_KEY esté cargada
print("DATALAB_API_KEY:", os.getenv("DATALAB_API_KEY") or "(no configurada)")

import base64
import json
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/generate-master", methods=["POST"])
def generate_master_endpoint():
    """
    POST /generate-master
    Body: {
      "creditType": "adquisicion_activos" | "proyectos_inversion" | "capital_trabajo",
      "formalidad": 100,
      "experienceYears": 5,
      "creditScore": 720,
      "esgScore": 75,
      "bankStatements": {
        "BBVA": {
          "MXN": { "202401": "base64...", "202402": "base64...", "202403": "base64..." },
          "USD": { "202401": "base64..." }
        },
        "Santander": { "MXN": { ... } }
      },
      "financialStatements": {
        "2024": {
          "isComplete": true,
          "trimester": 0,
          "incomeStatement": {
            "ventas": 1500000,
            "costos_de_venta": 800000,
            "gastos_de_operacion": 250000,
            "gastos_financieros": 45000,
            "otros_productos": 12000,
            "otros_gastos": 8000,
            "impuestos": 95000
          },
          "balanceSheet": {
            "activo_circulante": 850000,
            "efectivo_y_equivalentes": 320000,
            "inventarios": 280000,
            "clientes": 180000,
            "deudores_diversos": 70000,
            "activo_fijo": 420000,
            "terreno_y_edificios": 200000,
            "maquinaria_y_equipo": 150000,
            "equipo_de_transporte": 50000,
            "depreciacion_acumulada": -80000,
            "otros_activos": 45000,
            "activo_total": 1315000,
            "pasivo_circulante": 380000,
            "proveedores": 150000,
            "acreedores_diversos": 80000,
            "docs_x_pagar_cp": 150000,
            "pasivo_largo_plazo": 200000,
            "docs_x_pagar_lp": 200000,
            "otros_pasivos": 0,
            "pasivo_total": 580000,
            "capital_social": 500000,
            "ut_ejercicios_anteriores": 185000,
            "capital_contable": 735000
          }
        },
        "2025": {
          "isComplete": false,
          "trimester": 1,
          "incomeStatement": {
            "ventas": 420000,
            "costos_de_venta": 220000,
            "gastos_de_operacion": 65000,
            "gastos_financieros": 12000,
            "otros_productos": 3000,
            "otros_gastos": 2000,
            "impuestos": 28000
          },
          "balanceSheet": {
            "activo_circulante": 920000,
            "efectivo_y_equivalentes": 380000,
            "inventarios": 310000,
            "clientes": 165000,
            "deudores_diversos": 65000,
            "activo_fijo": 395000,
            "terreno_y_edificios": 200000,
            "maquinaria_y_equipo": 140000,
            "equipo_de_transporte": 45000,
            "depreciacion_acumulada": -90000,
            "otros_activos": 42000,
            "activo_total": 1357000,
            "pasivo_circulante": 410000,
            "proveedores": 180000,
            "acreedores_diversos": 75000,
            "docs_x_pagar_cp": 155000,
            "pasivo_largo_plazo": 180000,
            "docs_x_pagar_lp": 180000,
            "otros_pasivos": 0,
            "pasivo_total": 590000,
            "capital_social": 500000,
            "ut_ejercicios_anteriores": 217000,
            "capital_contable": 767000
          }
        }
      }
    }
    - bankStatements: Estado de Cuenta por banco, moneda (MXN/USD) y periodo (YYYYMM).
    - financialStatements: Estados Financieros por año; isComplete=true año completo, false=parcial;
      trimester: 0=completo, 1-4=Q1-Q4. incomeStatement y balanceSheet: si vienen en base64 (PDF),
      se extraen con datalab_sdk; si ya son objetos, se usan tal cual.
    Retorna: { "success": true, "file_base64": "..." }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    payload = request.get_json()
    if not payload:
        return jsonify({"error": "Payload vacío"}), 400

    # DEBUG: rastrear qué llega y qué se procesa
    fs = payload.get("financialStatements")
    print("[DEBUG] financialStatements recibido:", "SÍ" if fs else "NO")
    if fs:
        for y, d in fs.items():
            inc = d.get("incomeStatement") if isinstance(d, dict) else "?"
            bal = d.get("balanceSheet") if isinstance(d, dict) else "?"
            inc_type = "base64" if isinstance(inc, str) else ("dict" if isinstance(inc, dict) else type(inc).__name__)
            bal_type = "base64" if isinstance(bal, str) else ("dict" if isinstance(bal, dict) else type(bal).__name__)
            print(f"  Año {y}: incomeStatement={inc_type}, balanceSheet={bal_type}")

    try:
        from master_generator import generate_master
        from financial_extractor import process_financial_statements

        # Extraer datos de PDFs de estados financieros (base64 -> objetos datalab_sdk)
        if payload.get("financialStatements"):
            payload = dict(payload)
            try:
                payload["financialStatements"] = process_financial_statements(
                    payload["financialStatements"]
                )
                print("[DEBUG] process_financial_statements OK")
            except Exception as ex:
                print(f"[DEBUG] process_financial_statements FALLÓ: {ex}")
                raise

        file_bytes = generate_master(payload)
        file_base64 = base64.b64encode(file_bytes).decode("utf-8")
        return jsonify({"success": True, "file_base64": file_base64})
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 500
    except Exception as e:
        return jsonify({"error": f"Error generando master: {str(e)}"}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "extract-bank-statements-worker"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8081))
    app.run(host="0.0.0.0", port=port)
