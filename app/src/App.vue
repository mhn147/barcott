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
      <video ref="videoElm" autoplay="true" src=""></video>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const videoElm = ref(null);
const videoStream = ref(null);
const permissionDenied = ref(false);
const started = ref(false);
const frontCamera = ref(true);

const toggleVideo = async () => {
  try {
    if (started.value) {
      // stop old recording
      videoStream.value?.getTracks().forEach(track => track.stop());
    } else {
      await startRecording();
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
    videoStream.value?.getTracks().forEach(track => track.stop());
    await startRecording();

  } catch (err) {
    console.error(err);
  }
}

const startRecording = async () => {
  videoStream.value = await navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: frontCamera.value ? "user" : "environment"
    }
  });
  videoElm.value.srcObject = videoStream.value;
}

onMounted(async () => {
  if (!navigator.mediaDevices.getUserMedia) {
    permissionDenied.value = true;
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(track => track.stop());
  } catch (err) {
    permissionDenied.value = true;
    console.error(err);
  }
});

onUnmounted(() => {
  // stop recording
  videoStream.value?.getTracks().forEach(track => track.stop());
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
