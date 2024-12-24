<script setup>
import { ref, defineProps, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
  workflowUrl: {
    type: String,
    required: true,
  },
});

const workflows = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const perPage = 10;
const refreshInterval = ref(null);

// Parse workflow URL to get owner, repo
function parseWorkflowUrl(url) {
  try {
    const regex = /github\.com\/([^/]+)\/([^/]+)\/blob\/[^/]+\/\.github\/workflows\/(.+)$/;
    const match = url.match(regex);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
      };
    }
    throw new Error("Invalid workflow URL format");
  } catch (error) {
    console.error("Error parsing workflow URL:", error);
    return null;
  }
}

// Get status color based on workflow status and conclusion
function getStatusColor(status, conclusion) {
  if (status === "completed") {
    switch (conclusion) {
      case "success":
        return "#2ecc71"; // Green
      case "failure":
        return "#e74c3c"; // Red
      case "cancelled":
        return "#95a5a6"; // Gray
      default:
        return "#7f8c8d"; // Dark Gray
    }
  }
  if (status === "in_progress") {
    return "#3498db"; // Blue
  }
  if (status === "queued") {
    return "#f1c40f"; // Yellow
  }
  return "#7f8c8d"; // Default Dark Gray
}

// Format status for display
function formatStatus(status, conclusion) {
  if (status === "completed") {
    return conclusion || "completed";
  }
  return status.replace("_", " ");
}

// Format date for display
function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

// Refresh workflow status
async function refreshWorkflowStatus() {
  if (!props.token || !props.workflowUrl) return;
  loading.value = true;

  try {
    const repoInfo = parseWorkflowUrl(props.workflowUrl);
    if (!repoInfo) return;

    const { owner, repo } = repoInfo;

    // Get all workflow runs for the repository
    const runsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=${perPage}&page=${currentPage.value}&timestamp=${Date.now()}`, {
      headers: {
        Authorization: `Bearer ${props.token}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!runsResponse.ok) {
      throw new Error("Failed to fetch workflow runs");
    }

    const runsData = await runsResponse.json();
    workflows.value = runsData.workflow_runs.map(run => ({
      owner,
      repo,
      run_id: run.id,
      workflow_name: run.name,
      status: run.status,
      conclusion: run.conclusion,
      started_at: run.created_at,
      html_url: run.html_url,
    }));

    // Calculate total pages
    const totalCount = runsData.total_count;
    totalPages.value = Math.ceil(totalCount / perPage);
  } catch (error) {
    console.error("Error refreshing workflow status:", error);
  } finally {
    loading.value = false;
  }
}

function handlePageChange(page) {
  currentPage.value = page;
  refreshWorkflowStatus();
}

// Start auto-refresh
function startAutoRefresh() {
  if (!refreshInterval.value) {
    refreshWorkflowStatus();
    refreshInterval.value = setInterval(refreshWorkflowStatus, 5000);
  }
}

// Stop auto-refresh
function stopAutoRefresh() {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
}

// Setup auto-refresh when component is mounted
onMounted(() => {
  startAutoRefresh();
});

// Cleanup interval when component is unmounted
onUnmounted(() => {
  stopAutoRefresh();
});

// Watch for changes in token and URL
watch([() => props.token, () => props.workflowUrl], ([newToken, newUrl], [oldToken, oldUrl]) => {
  if (newToken && newUrl) {
    // Restart auto-refresh with new values
    stopAutoRefresh();
    startAutoRefresh();
  }
});

// Initial load if credentials are available
if (props.token && props.workflowUrl) {
  refreshWorkflowStatus();
}
</script>

<template>
  <div class="mt-5 border-t border-gray-200 pt-5">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-gray-800 m-0 text-lg">Workflow History</h2>
      <button class="px-3 py-1.5 bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded min-w-[90px] text-sm" @click="refreshWorkflowStatus" :disabled="loading">
        <span v-if="loading">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div v-if="workflows.length > 0" class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap">Name</th>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap">Status</th>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap">Started At</th>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="workflow in workflows" :key="workflow.run_id" class="hover:bg-gray-50">
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">{{ workflow.workflow_name }}</td>
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">
              <span :style="{ color: getStatusColor(workflow.status, workflow.conclusion) }">
                {{ formatStatus(workflow.status, workflow.conclusion) }}
              </span>
            </td>
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">{{ formatDate(workflow.started_at) }}</td>
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">
              <a :href="workflow.html_url" target="_blank" class="text-blue-500 no-underline hover:underline text-sm">View</a>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center mt-4 gap-3">
        <button :disabled="currentPage === 1 || loading" @click="handlePageChange(currentPage - 1)" class="px-2 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">Previous</button>
        <span class="text-gray-800 text-sm">Page {{ currentPage }} of {{ totalPages }}</span>
        <button :disabled="currentPage === totalPages || loading" @click="handlePageChange(currentPage + 1)" class="px-2 py-1 bg-blue-500 text-white rounded text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">Next</button>
      </div>
    </div>

    <div v-else class="text-center text-gray-600 p-4 bg-gray-50 rounded text-sm">No workflows found</div>
  </div>
</template>
