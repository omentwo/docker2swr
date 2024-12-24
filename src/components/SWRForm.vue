<script setup>
import { ref, onMounted } from "vue";
import SWRImageList from './SWRImageList.vue'

const accessKey = ref("");
const secretKey = ref("");
const endpoint = ref("");

// Save data to localStorage
function saveToLocalStorage() {
  localStorage.setItem("swr_access_key", accessKey.value);
  localStorage.setItem("swr_secret_key", secretKey.value);
  localStorage.setItem("swr_endpoint", endpoint.value);
}

// Load data from localStorage
function loadFromLocalStorage() {
  accessKey.value = localStorage.getItem("swr_access_key") || "";
  secretKey.value = localStorage.getItem("swr_secret_key") || "";
  endpoint.value = localStorage.getItem("swr_endpoint") || "";
}

function handleSubmit() {
  if (!accessKey.value || !secretKey.value || !endpoint.value) return;
  saveToLocalStorage();
}

// Load data on component mount
onMounted(() => {
  loadFromLocalStorage();
});
</script>

<template>
  <div class="mb-8">
    <h2 class="text-center text-gray-800 mb-8 text-2xl">SWR Configuration</h2>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">Access Key:</label>
      <input 
        type="password" 
        v-model="accessKey" 
        placeholder="Enter your Access Key" 
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">Secret Key:</label>
      <input 
        type="password" 
        v-model="secretKey" 
        placeholder="Enter your Secret Key" 
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">Endpoint:</label>
      <input 
        type="text" 
        v-model="endpoint" 
        placeholder="swr-api.cn-north-4.myhuaweicloud.com" 
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button 
      @click="handleSubmit" 
      :disabled="!accessKey || !secretKey || !endpoint"
      class="w-full py-2.5 bg-blue-500 text-white rounded text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      Confirm
    </button>
  </div>
  <SWRImageList v-if="accessKey && secretKey" />
</template>
