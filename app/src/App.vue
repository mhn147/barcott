<template>
  <main>
    <div v-if="cameraAccessDenied" class="premissionDenied">
      <p>⚠️ Camera permission denied. Please allow it in order to use this app.</p>
    </div>
    <div v-else>
      <h1>Capture Video</h1>
      <button v-if="started" @click="onStopClicked" class="videoBtn">Stop</button>
      <button v-else @click="onStartClicked" class="videoBtn">Start</button>
      <button @click="onFlipCamera">Flip Camera</button>
      <br>
      <div id="interactive" class="viewport">
        <video />
        <canvas class="drawingBuffer" />
      </div>
    </div>
  </main>
</template>

<script setup>
import { QuaggaScanner } from "./scanner.js";
import { onUnmounted, ref } from 'vue';

const cameraAccessDenied = ref(false);
const started = ref(false);
const rearCamera = ref(true);
let scanner;
const scannerConfig = {
  input: {
    type: 'LiveStream',
    target: document.querySelector("#scannerContainer"),
    constraints: {
      width: { min: "640" },
      height: { min: "480" },
      facingMode: rearCamera.value ? "environment" : "user",
      aspectRatio: { min: 1, max: 2 },
    },
  }
}


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

<style>
body {
  background-color: #eee;
}

* {
  font-family: arial, sans-serif;
}
</style>

<style scoped>
main {
  width: 90%;
  margin: 0 auto;
  padding: 1rem;
  background-color: #cccccc;
  border-radius: 8px;
}

.premissionDenied {
  padding: 0.4rem;
  background-color: rgb(57, 57, 57);
  color: #eee;
}

.premissionDenied p {
  margin: 0;
}

h1 {
  margin-top: 0;
  margin-bottom: 0.8rem;
}

video {
  width: 400px;
  max-width: 100%;
  height: 375px;
  background-color: #333;
}

.videoBtn {
  padding: 0.4rem;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  margin-right: 0.4rem;
}
</style>
