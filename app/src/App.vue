<template>
  <main ref="mainElement">
    <div v-if="cameraAccessDenied" class="premissionDenied">
      <p>⚠️ Camera permission denied. Please allow it in order to use this app.</p>
    </div>
    <div v-else id="video">
      <div v-if="detected">
         <ul>
          <li>Code: {{ detected.codeResult.code }}</li>
          <li>Format: {{ detected.codeResult.format }}</li>
         </ul>
      </div>
      <template v-else>
        <audio id="barcodeAudio" ref="barcodeAudioElement" src="/barcode-scan.mp3" />
        <video @play="resizeCanvas" ref="videoElement" />
        <canvas class="drawingBuffer" ref="canvasElement" />
      </template>
    </div>
  </main>
  <footer>
    <div class="action-buttons-ctr">
      <button v-if="started" @click="stopScan" class="action_btn">Stop</button>
      <button v-else @click="startScan" class="action_btn">Scan</button>
      <button v-if="started" @click="onFlipCamera" class="action_btn flip_btn"><img src="/camera_flip.png" /></button>
    </div>
  </footer>
</template>

<script setup>
import Quagga from "@ericblade/quagga2";
import { QuaggaScanner } from "./scanner.js";
import { onMounted, onUnmounted, ref } from 'vue';

const cameraAccessDenied = ref(false);
const mainElement = ref(null);
const barcodeAudioElement = ref(null);
const videoElement = ref(null);
const canvasElement = ref(null);
const started = ref(false);
const detected = ref(null);
let scanner;
let scannerConfig;

onMounted(() => {
  scannerConfig = {
    input: {
      type: 'LiveStream',
      target: document.querySelector("#video"),
      constraints: {
        width: mainElement.value.widthOffset,
        height: mainElement.value.heightOffset,
        facingMode: "environment",
        aspectRatio: { min: 1, max: 2 },
      },
    }
  }
});

const startScan = async () => {
  try {
    const scannerInitialized = Boolean(scanner);
    if (!scannerInitialized) {
      const access = await askForCameraAccess();
      if (!access) {
        console.warn("User denied camera access");
        cameraAccessDenied.value = true;
        return;
      }
    }

    if (scannerInitialized) {
      scanner.stop();
    }

    detected.value = null;

    scanner = new QuaggaScanner({
      inputStream: scannerConfig.input
    }, onDetected, onProcessed);

    started.value = true;
  } catch (error) {
    console.error(error);
  }
}

const stopScan = async () => {
  try {
    scanner.stop();
    started.value = false;
  } catch (err) {
    console.error(err);
  }
}

const onFlipCamera = async () => {
  try {
    scannerConfig.input.constraints.facingMode = scannerConfig.input.constraints.facingMode === "environment"
      ? "user"
      : "environment"

    // stop old recording
    scanner.stop();
    console.log(scannerConfig.input)
    scanner = new QuaggaScanner({
      inputStream: scannerConfig.input
    }, onProcessed, onDetected);
  } catch (err) {
    console.error(err);
  }
}

const resizeCanvas = () => {
  canvasElement.value.widthOffset = videoElement.value.widthOffset;
  canvasElement.value.heightOffset = videoElement.value.heightOffset;
}

const askForCameraAccess = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

const onDetected = (result) => {
  barcodeAudioElement.value.play();
  stopScan();
  detected.value = result
};

const onProcessed = (result) => {
  if (!result) return;

  console.log(result);

  let drawingCtx = Quagga.canvas.ctx.overlay;
  let drawingCanvas = Quagga.canvas.dom.overlay;

  if (result.boxes) {
    drawingCtx.clearRect(
      0,
      0,
      parseInt(drawingCanvas.getAttribute('width')),
      parseInt(drawingCanvas.getAttribute('height'))
    );
    result.boxes
      .filter(function (box) {
        return box !== result.box;
      })
      .forEach(function (box) {
        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, {
          color: 'green',
          lineWidth: 2,
        });
      });
  }
  if (result.box) {
    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, {
      color: '#00F',
      lineWidth: 2,
    });
  }

  if (result.codeResult && result.codeResult.code) {
    Quagga.ImageDebug.drawPath(
      result.line,
      { x: 'x', y: 'y' },
      drawingCtx,
      { color: 'red', lineWidth: 3 }
    );
  }
};

onUnmounted(() => {
  scanner?.stop();
})

</script>

<style scoped>
footer {
  height: 6vh;
  width: 100vw;
  padding: 0.2rem 0.4rem;
  border-top: 1px solid #aaa;
}

.action-buttons-ctr {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.action_btn {
  height: 95%;
  padding: 0.4rem;
  font-size: 1rem;
}

.flip_btn {
  margin-left: 0.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.flip_btn img {
  width: 24px;
  height: 24px;
}

main {
  padding: 0.4rem;
  width: 100vw;
  height: 94vh;
  display: flex;
  align-items: center;
}

#video {
  height: 70%;
  width: 100%;
  position: relative;
}

video {
  width: 100%;
  height: 100%;
  background-color: #333;
}

.drawingBuffer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.premissionDenied {
  padding: 0.4rem;
  background-color: rgb(57, 57, 57);
  color: #eee;
}

.premissionDenied p {
  margin: 0;
}
</style>
