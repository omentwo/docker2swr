<template>
  <div class="mt-5 border-t border-gray-200 pt-5">
    <div class="flex justify-between items-center mb-5">
      <h2 class="text-gray-800 m-0 text-lg">Image List</h2>
      <button class="px-3 py-1.5 bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded min-w-[90px] text-sm" @click="fetchImageList" :disabled="loading">
        <span v-if="loading">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div class="my-4">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap w-50">Name</th>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap">tags</th>
            <th class="p-2 text-left bg-gray-50 text-gray-800 font-semibold border-b border-gray-200 whitespace-nowrap w-50">更新时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center text-gray-600 p-3">加载中...</td>
          </tr>
          <tr v-else v-for="item in imageList" :key="item.name" class="hover:bg-gray-50">
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">{{ item.name }}</td>
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">
              <div class="flex items-center">
                <span v-for="tag in item.tags" :key="tag" class="mr-2 cursor-pointer text-blue-500 hover:underline" @click="handleTagClick(item, tag)">{{ tag }}</span>
              </div>
            </td>
            <td class="p-2 text-gray-800 border-b border-gray-200 whitespace-nowrap">{{ formatTime(item.updated_at) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination Controls -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-gray-700">Showing {{ currentPage * pageSize + 1 }} to {{ Math.min((currentPage + 1) * pageSize, total) }} of {{ total }} results</div>
        <div class="flex space-x-2">
          <button class="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded disabled:bg-gray-100 disabled:text-gray-400" :disabled="currentPage === 0" @click="handlePageChange(currentPage - 1)">Previous</button>
          <button class="px-3 py-1.5 bg-white border border-gray-300 text-sm rounded disabled:bg-gray-100 disabled:text-gray-400" :disabled="(currentPage + 1) * pageSize >= total" @click="handlePageChange(currentPage + 1)">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import signer from "./../signer.js";

export default defineComponent({
  name: "SWRImageList",
  setup() {
    const loading = ref(false);
    const imageList = ref([]);
    const error = ref(null);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const total = ref(0);

    const getSignedRequest = url => {
      const sig = new signer.Signer();
      sig.Key = localStorage.getItem("swr_access_key");
      sig.Secret = localStorage.getItem("swr_secret_key");

      const request = new signer.HttpRequest("GET", url);

      return sig.Sign(request);
    };

    const handlePageChange = newPage => {
      currentPage.value = newPage;
      fetchImageList();
    };

    const fetchImageList = async () => {
      try {
        loading.value = true;
        error.value = null;
        const offset = currentPage.value * pageSize.value;
        const url = `https://swr-api.cn-north-4.myhuaweicloud.com/v2/manage/repos?limit=${pageSize.value}&offset=${offset}&order_column=updated_time&order_type=desc`;
        const signedOpts = getSignedRequest(url);

        const headers = new Headers();
        headers.append("Authorization", signedOpts.headers.Authorization);
        headers.append("X-Sdk-Date", signedOpts.headers["X-Sdk-Date"]);
        headers.append("host", signedOpts.headers.host);
        const response = await fetch(`https://swr-cors.891855179.workers.dev/?url=${encodeURIComponent(url)}`, {
          method: "GET",
          headers: headers,
          redirect: "follow",
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // 从响应头中获取原始的 content-range
        const contentRange = response.headers.get("content-range"); // 注意：header 名称是小写的
        console.log("Content-Range:", contentRange);
        for (let [key, value] of response.headers.entries()) {
          console.log(key, value);
        }
        if (contentRange) {
          // 使用正则表达式匹配格式：offset-count/total
          const matches = contentRange.match(/(\d+)-(\d+)\/(\d+)/);
          if (matches) {
            const [, offset, count, totalCount] = matches;
            total.value = parseInt(totalCount);
            console.log(`Pagination info: offset=${offset}, count=${count}, total=${totalCount}`);
          }
        }

        const data = await response.json();
        console.log("Response data:", data);
        imageList.value = data || [];
      } catch (error) {
        error.value = error.message;
        console.error("Error fetching image list:", error);
      } finally {
        loading.value = false;
      }
    };

    const viewDetails = record => {
      console.log("View details for:", record);
      // Implement detail view logic here
    };
    const handleTagClick = (record, tag) => {
      console.log("View details for:", `${record.path}:${tag}`);
      // Implement detail view logic here
      // docker pull swr.cn-north-4.myhuaweicloud.com/axyw/nginx:1.27
    };

    const formatTime = timeStr => {
      if (!timeStr) return "";
      const date = new Date(timeStr);
      return date.toLocaleString("zh-CN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    };

    onMounted(() => {
      fetchImageList();
    });

    return {
      loading,
      imageList,
      error,
      currentPage,
      pageSize,
      total,
      viewDetails,
      handleTagClick,
      handlePageChange,
      fetchImageList,
      formatTime,
    };
  },
});
</script>
