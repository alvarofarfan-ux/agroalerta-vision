from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

VALOR_HECTAREA = {
    "limon": 14000,
    "mango": 12500,
    "arroz": 8500
}

@app.route('/calcular-impacto', methods=['POST'])
def calcular_impacto():
    datos = request.json
    cultivo = datos.get('cultivo', 'limon')
    hectareas = float(datos.get('hectareas', 1))
    diagnostico = datos.get('diagnostico', '')

    valor_total = VALOR_HECTAREA.get(cultivo, 10000) * hectareas

    if "Sana" in diagnostico:
        perdida = 0
        recomendacion = "Cultivo saludable. Mantener drenajes limpios ante próximas lluvias."
    elif "Hongo" in diagnostico or "Alerta" in diagnostico:
        perdida = round(valor_total * 0.35, 2)
        recomendacion = "Aplicar fungicida cúprico preventivo en las próximas 48h. Califica para bono de insumos."
    else:
        perdida = round(valor_total * 0.75, 2)
        recomendacion = "Aislar zona afectada y emitir reporte para solicitud de microcrédito de emergencia."

    return jsonify({
        "diagnostico": diagnostico,
        "perdida_estimada": f"{perdida:,.2f}",
        "recomendacion": recomendacion
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)