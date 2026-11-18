const URL_MODELO = "https://teachablemachine.withgoogle.com/models/TU_MODELO_AQUI/";

let model, webcam, maxPredictions;
let estadoActual = "Alerta de Hongo / Humedad";

async function iniciarCamara() {
  const modelURL = URL_MODELO + "model.json";
  const metadataURL = URL_MODELO + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(256, 256, flip);
  await webcam.setup();
  await webcam.play();

  const container = document.getElementById("webcam-container");
  container.innerHTML = "";
  container.appendChild(webcam.canvas);

  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update();
  await predecir();
  window.requestAnimationFrame(loop);
}

async function predecir() {
  const prediction = await model.predict(webcam.canvas);
  let mejorClase = "";
  let mayorProb = 0;

  for (let i = 0; i < maxPredictions; i++) {
    if (prediction[i].probability > mayorProb) {
      mayorProb = prediction[i].probability;
      mejorClase = prediction[i].className;
    }
  }
  estadoActual = mejorClase;
  document.getElementById("label-container").innerText = 
    `Detección: ${mejorClase} (${(mayorProb * 100).toFixed(0)}%)`;
}

async function evaluarImpacto() {
  const cultivo = document.getElementById("cultivo").value;
  const hectareas = parseFloat(document.getElementById("hectareas").value);

  const respuesta = await fetch("http://127.0.0.1:5000/calcular-impacto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cultivo: cultivo,
      hectareas: hectareas,
      diagnostico: estadoActual
    })
  });

  const data = await respuesta.json();
  const panel = document.getElementById("panel-resultado");
  panel.classList.remove("hidden");
  document.getElementById("texto-resultado").innerHTML = `
    <strong>Estado:</strong> ${data.diagnostico}<br>
    <strong>Pérdida estimada sin acción:</strong> S/ ${data.perdida_estimada}<br>
    <strong>Acción recomendada:</strong> ${data.recomendacion}
  `;
}