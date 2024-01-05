<template>
  <main>
    <div v-if="permissionDenied" class="premissionDenied">
      <p>⚠️ Camera permission denied. Please allow it in order to use this app.</p>
    </div>
    <div v-else>
      <h1>Capture Video</h1>
      <button @click="toggleVideo" class="startBtn">{{ started ? 'Stop' : 'Start' }}</button>
      Select Device:
      <select v-if="videoDevices && videoDevices.length" name="cameraOptions" id="cameraOptions"
        @change="onDeviceChanged($event.target.value)">
        <option v-for="device in videoDevices" :value="device.deviceId" :key="device.deviceId">{{ device.label }}
        </option>
      </select>
      <br>
      <video ref="videoElm" autoplay="true" src=""></video>
      <ul v-if="selectedVideoDevice">
        <li>Device name: {{ selectedVideoDevice.label }}</li>
        <li>Device id: {{ selectedVideoDevice.deviceId }}</li>
      </ul>
    </div>
  </main>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const videoElm = ref(null);
const videoStream = ref(null);
const videoDevices = ref(null);
const selectedVideoDevice = ref(null)
const permissionDenied = ref(false);
const started = ref(false);

const toggleVideo = async () => {
  try {
    if (started.value) {
      // stop recording
      videoStream.value?.getTracks().forEach(track => track.stop());
    } else {
      console.log("here", selectedVideoDevice.value.deviceId);
      videoStream.value = await navigator.mediaDevices.getUserMedia({
        video: true,
        deviceId: {
          exact: selectedVideoDevice.value.deviceId
        }
      });
      videoElm.value.srcObject = videoStream.value;
    }
    started.value = !started.value;
  } catch (err) {
    console.error(err);
  }
}

const onDeviceChanged = async (deviceId) => {
  try {
    selectedVideoDevice.value = videoDevices.value.find(device => device.deviceId === deviceId);

    if (!started.value) return;

    // stop recording
    videoStream.value?.getTracks().forEach(track => track.stop());

    console.log(selectedVideoDevice.value.deviceId);
    videoStream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "environment"
      },
      deviceId: {
        exact: selectedVideoDevice.value.deviceId
      }
    });
    videoElm.value.srcObject = videoStream.value;
  } catch (err) {
    console.error(err);
  }
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

  videoDevices.value = (await navigator.mediaDevices.enumerateDevices())
    ?.filter(dev => dev.kind === "videoinput");
  selectedVideoDevice.value = videoDevices.value[0];
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

#cameraOptions {
  margin-bottom: 0.4rem;
}

.startBtn {
  padding: 0.4rem;
  font-size: 1rem;
  margin-bottom: 0.4rem;
}
</style>
