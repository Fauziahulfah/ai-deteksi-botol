const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const startBtn = document.getElementById("startBtn");
const statusText = document.getElementById("status");

let model;

async function loadAI() {
    statusText.innerText = "Memuat model AI...";

    model = await cocoSsd.load();

    statusText.innerText = "Model AI siap.";
}

async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
        video: true
    });

    video.srcObject = stream;

    video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        detect();
    };

    statusText.innerText = "Kamera aktif - mencari botol...";
}

async function detect() {
    if (!model) return;

    const predictions = await model.detect(video);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let bottleFound = false;

    predictions.forEach(prediction => {

        if (prediction.class === "bottle" && prediction.score >= 0.5) {

            bottleFound = true;

            const [x, y, width, height] = prediction.bbox;

            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            ctx.font = "20px Arial";
            ctx.fillStyle = "red";

            const confidence =
                Math.round(prediction.score * 100);

            ctx.fillText(
                `Bottle ${confidence}%`,
                x,
                y > 25 ? y - 5 : y + 20
            );
        }
    });

    if (bottleFound) {
        statusText.innerText = "✅ Botol terdeteksi!";
    } else {
        statusText.innerText = "🔍 Tidak ada botol terdeteksi";
    }

    requestAnimationFrame(detect);
}

startBtn.addEventListener("click", startCamera);

loadAI();