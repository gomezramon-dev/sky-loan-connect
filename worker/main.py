"""
Worker de extracción OCR para bank statements.
Expone el endpoint /extract-bank-statements que usa datalab_sdk.
"""
from dotenv import load_dotenv

load_dotenv()

import base64
import json
import os
import tempfile
from pathlib import Path

from flask import Flask, request, jsonify
from datalab_sdk import DatalabClient, ExtractOptions

app = Flask(__name__)

# Schema para extracción de bank statements - POR DEFINIR
# Ejemplo base que puedes ajustar según tus necesidades
BANK_STATEMENT_SCHEMA = {
    "type": "object",
    "properties": {
        "invoice_number": {"type": "string", "description": "Invoice ID or number"},
        "total_amount": {"type": "number", "description": "Total amount due"},
        "vendor_name": {"type": "string", "description": "Company or vendor name"},
    },
    "required": ["invoice_number", "total_amount"],
}


def extract_from_base64(base64_content: str, client: DatalabClient) -> dict | None:
    """
    Decodifica base64, guarda en archivo temporal y extrae con datalab_sdk.
    """
    try:
        pdf_bytes = base64.b64decode(base64_content)
    except Exception as e:
        return {"error": f"Invalid base64: {str(e)}"}

    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        options = ExtractOptions(
            page_schema=json.dumps(BANK_STATEMENT_SCHEMA),
            mode="balanced",
        )
        result = client.extract(tmp_path, options=options)
        extracted = json.loads(result.extraction_schema_json)
        return extracted
    except Exception as e:
        return {"error": str(e)}
    finally:
        Path(tmp_path).unlink(missing_ok=True)


@app.route("/extract-bank-statements", methods=["POST"])
def extract_bank_statements():
    """
    POST /extract-bank-statements
    Body: { "bank_statements": { "BBVA": { "202401MXN": "base64...", ... }, ... } }
    """
    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()
    bank_statements = data.get("bank_statements")

    if not bank_statements or not isinstance(bank_statements, dict):
        return (
            jsonify(
                {
                    "error": "Missing or invalid bank_statements",
                    "expected": '{"bank_statements": {"BANK_NAME": {"period": "base64..."}}}',
                }
            ),
            400,
        )

    # Verificar API key de Datalab
    if not os.getenv("DATALAB_API_KEY"):
        return (
            jsonify(
                {
                    "error": "DATALAB_API_KEY not configured",
                    "message": "Set DATALAB_API_KEY in the worker environment",
                }
            ),
            500,
        )

    client = DatalabClient()
    results = {}

    for bank_name, periods in bank_statements.items():
        if not isinstance(periods, dict):
            results[bank_name] = {"error": "Periods must be a dict of period -> base64"}
            continue

        bank_results = {}
        for period_id, base64_content in periods.items():
            if not isinstance(base64_content, str):
                bank_results[period_id] = {"error": "Content must be base64 string"}
                continue

            extracted = extract_from_base64(base64_content, client)
            bank_results[period_id] = extracted

        results[bank_name] = bank_results

    return jsonify(results)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "extract-bank-statements-worker"})


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8081))
    app.run(host="0.0.0.0", port=port)
