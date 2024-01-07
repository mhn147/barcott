<template>
  <main>
    <div v-if="permissionDenied" class="premissionDenied">
      <p>⚠️ Camera permission denied. Please allow it in order to use this app.</p>
    </div>
    <div v-else>
      <h1>Capture Video</h1>
      <button @click="toggleVideo" class="startBtn">{{ started ? 'Stop' : 'Start' }}</button>
      <button @click="onFlipCamera">Flip Camera</button>
      <br>
      <p>Detected: {{ detected }}</p>
      <div id="interactive" class="viewport">
        <video />
        <canvas class="drawingBuffer" />
      </div>
    </div>
  </main>
</template>

<script setup>
import Quagga from "@ericblade/quagga2";
import { onMounted, onUnmounted, ref } from 'vue';

const permissionDenied = ref(false);
const started = ref(false);
const frontCamera = ref(true);

const toggleVideo = async () => {
  try {


    if (started.value) {
      stopRecording();
    } else {
      startRecording();
    }
    started.value = !started.value;
  } catch (err) {
    console.error(err);
  }
}

const onFlipCamera = async () => {
  try {
    frontCamera.value = !frontCamera.value;
    if (!started.value) return;

    // stop old recording
    stopRecording();
    startRecording();
  } catch (err) {
    console.error(err);
  }
}

const startRecording = () => {
  Quagga.init({
    inputStream: {
      type: 'LiveStream',
      target: document.querySelector("#scannerContainer"),
      constraints: {
        width: { min: "640" },
        height: { min: "480" },
        facingMode: frontCamera.value ? "user" : "environment",
        aspectRatio: { min: 1, max: 2 },
      },
    },
    locator: {
      patchSize: 'medium',
      halfSample: true,
    },
    numOfWorkers: 2,
    frequency: 10,
    decoder: {
      readers: [
        "ean_reader",
        "ean_8_reader",
        {
          format: "ean_reader",
          config: {
            supplements: [
              'ean_5_reader', 'ean_2_reader'
            ]
          }
        },
        "upc_reader",
        "upc_e_reader",
        "code_128_reader",
      ],
    },
    locate: true,
  }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    Quagga.start();
    Quagga.onDetected(onDetected);
    Quagga.onProcessed(onProcessed);
  });
}

const stopRecording = () => {
  Quagga.stop();
}

const detected = ref(0);
const onDetected = (result) => {
  detected.value = result;
  console.log("Detected: ", result);
};

const onProcessed = (result) => {
  console.log("Processed: ", result);
};

onMounted(async () => {
  if (!navigator.mediaDevices.getUserMedia) {
    permissionDenied.value = true;
    return;
  }

  try {
    // const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    permissionDenied.value = true;
    console.error(err);
  }
});

onUnmounted(() => {
  // stop recording
  //videoStream.value?.getTracks().forEach(track => track.stop());
  if (this.onDetected) Quagga.offDetected(this.onDetected);
  if (this.onProcessed) Quagga.offProcessed(this.offProcessed);
  stopRecording();
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

.startBtn {
  padding: 0.4rem;
  font-size: 1rem;
  margin-bottom: 0.4rem;
  margin-right: 0.4rem;
}
</style>
