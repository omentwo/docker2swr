<script setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["execute-workflow", "credentials-update"]);

const githubToken = ref("");
const workflowUrl = ref("");
const imageName = ref("");
const loading = ref(false);

// Parse workflow URL to get owner, repo, and workflow file
function parseWorkflowUrl(url) {
  try {
    const regex = /github\.com\/([^/]+)\/([^/]+)\/blob\/[^/]+\/\.github\/workflows\/(.+)$/;
    const match = url.match(regex);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        workflow_file: match[3],
      };
    }
    throw new Error("Invalid workflow URL format");
  } catch (error) {
    throw new Error("Failed to parse workflow URL");
  }
}

// Save data to localStorage
function saveToLocalStorage() {
  localStorage.setItem("githubToken", githubToken.value);
  localStorage.setItem("workflowUrl", workflowUrl.value);
}

// Load data from localStorage
function loadFromLocalStorage() {
  githubToken.value = localStorage.getItem("githubToken") || "";
  workflowUrl.value = localStorage.getItem("workflowUrl") || "";
  emit("credentials-update", { token: githubToken.value, url: workflowUrl.value });
}

// Watch for credentials changes
function handleCredentialsChange() {
  emit("credentials-update", { token: githubToken.value, url: workflowUrl.value });
  saveToLocalStorage();
}

// Execute workflow
async function executeWorkflow() {
  if (!githubToken.value || !workflowUrl.value || !imageName.value) return;

  try {
    loading.value = true;

    const { owner, repo, workflow_file } = parseWorkflowUrl(workflowUrl.value);

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow_file}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken.value}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          image: imageName.value,
        },
      }),
    });

    if (response.ok) {
      // Clear image name after successful trigger
      imageName.value = "";
      saveToLocalStorage();

      // Delay success notification and emit event
      setTimeout(() => {
        emit("workflow-triggered", { owner, repo, workflow_file });
      }, 1000);
    } else {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to trigger workflow");
    }
  } catch (error) {
  } finally {
    loading.value = false;
  }
}

// Load data on mount
loadFromLocalStorage();
</script>

<template>
  <div class="mb-8">
    <h1 class="text-center text-gray-800 mb-8 text-2xl">GitHub Action Trigger</h1>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">GitHub Token:</label>
      <input 
        type="password" 
        v-model="githubToken" 
        placeholder="Enter your GitHub token" 
        @input="handleCredentialsChange"
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">Workflow URL:</label>
      <input 
        type="text" 
        v-model="workflowUrl" 
        placeholder="https://github.com/owner/repo/blob/main/.github/workflows/file.yml" 
        @input="handleCredentialsChange"
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <div class="mb-5">
      <label class="block mb-1 text-gray-800">Image Name:</label>
      <input 
        type="text" 
        v-model="imageName" 
        placeholder="Enter image name"
        class="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button 
      @click="executeWorkflow" 
      :disabled="loading || !githubToken || !workflowUrl || !imageName"
      class="w-full py-2.5 bg-green-500 text-white rounded text-base disabled:bg-green-300 disabled:cursor-not-allowed"
    >
      {{ loading ? "Executing..." : "Execute Workflow" }}
    </button>
  </div>
</template>
