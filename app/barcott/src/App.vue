<script setup>
import { Html5QrcodeScanner } from "html5-qrcode";
import { onMounted } from "vue";

const onScanSuccess = (decodedText, decodedResult) => {
  // handle the scanned code as you like, for example:
  console.log(`Code matched = ${decodedText}`, decodedResult);
}

const onScanFailure = (error) => {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  console.warn(`Code scan error = ${error}`);
}

onMounted(() => {
  let scanner = new Html5QrcodeScanner(
    "reader",
    { fps: 10, qrbox: { width: 250, height: 250 } }
  ).render(onScanSuccess, onScanFailure);
})
</script>

<template>
  <div id="reader" width="600px">
    <h1>hello</h1>
  </div>
</template>

<style scoped></style>
