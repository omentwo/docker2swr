<script setup>
import { ref } from "vue";
import WorkflowForm from "./components/WorkflowForm.vue";
import WorkflowList from "./components/WorkflowList.vue";
import SWRForm from "./components/SWRForm.vue";

const githubToken = ref("");
const workflowUrl = ref("");
const workflowListRef = ref(null);

function handleCredentialsUpdate({ token, url }) {
  githubToken.value = token;
  workflowUrl.value = url;
}

function handleWorkflowTriggered() {
  workflowListRef.value?.refreshWorkflowStatus();
}
</script>

<template>
  <div class="flex gap-5 p-5 min-h-screen bg-gray-50">
    <!-- Left Column -->
    <div class="flex-1 bg-white p-5 rounded-lg shadow-sm dark:bg-dark-800">
      <WorkflowForm @credentials-update="handleCredentialsUpdate" @workflow-triggered="handleWorkflowTriggered" />
      <WorkflowList ref="workflowListRef" :token="githubToken" :workflowUrl="workflowUrl" />
    </div>

    <!-- Right Column -->
    <div class="flex-1 bg-white p-5 rounded-lg shadow-sm dark:bg-dark-800">
      <SWRForm />
    </div>
  </div>
</template>
