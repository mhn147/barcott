<template>
  <main ref="mainElement">
    <div v-if="cameraAccessDenied" class="premissionDenied">
      <p>⚠️ Camera permission denied. Please allow it in order to use this app.</p>
    </div>
    <div v-else id="video">
      <video />
      <canvas class="barcodeDetection" />
    </div>
  </main>
  <footer>
    <div class="action-buttons-ctr">
      <button v-if="started" @click="onStopClicked" class="action_btn">Stop</button>
      <button v-else @click="onStartClicked" class="action_btn">Scan</button>
      <button @click="onFlipCamera" class="action_btn flip_btn"><img src="/camera_flip.png" /></button>
    </div>
  </footer>
</template>

<script setup>
import { QuaggaScanner } from "./scanner.js";
import { onMounted, onUnmounted, ref } from 'vue';

const cameraAccessDenied = ref(false);
const mainElement = ref(null);
const started = ref(false);
const rearCamera = ref(true);
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
        facingMode: rearCamera.value ? "environment" : "user",
        aspectRatio: { min: 1, max: 2 },
      },
    }
  }
});

const onStartClicked = async () => {
  try {
    const scannerInitialized = Boolean(scanner);
    if (scannerInitialized) {
      scanner.start();
    } else {
      const access = await askForCameraAccess();
      if (!access) {
        console.warn("User denied camera access");
        cameraAccessDenied.value = true;
        return;
      }
      scanner = new QuaggaScanner({
        inputStream: scannerConfig.input
      }, onDetected, onProcessed);
    }
    started.value = !started.value;
  } catch (error) {
    console.error(error);
  }
}

const onStopClicked = async () => {
  try {
    scanner.stop();
    started.value = !started.value;
  } catch (err) {
    console.error(err);
  }
}

const onFlipCamera = async () => {
  try {
    rearCamera.value = !rearCamera.value;
    if (!started.value) return;

    // stop old recording
    scanner.stop();
    scanner.start();
  } catch (err) {
    console.error(err);
  }
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
  console.log("Detected: ", result);
};

const onProcessed = (result) => {
  console.log("Processed: ", result);
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
.barcodeDetection {
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
