export default {
    async fetch(request) {
        const url = new URL(request.url);

        // 获取传入的编码后的目标 URL
        const encodedTargetUrl = url.searchParams.get("url");
        if (!encodedTargetUrl) {
            return new Response("Missing 'url' query parameter", { status: 400 });
        }

        // 解码 URL
        let targetUrl;
        try {
            targetUrl = decodeURIComponent(encodedTargetUrl);
        } catch (error) {
            return new Response("Invalid URL encoding", { status: 400 });
        }

        // 验证目标 URL 是否有效
        let parsedUrl;
        try {
            parsedUrl = new URL(targetUrl);
        } catch (error) {
            return new Response("Invalid URL format", { status: 400 });
        }

        // 验证协议是否是 https
        if (parsedUrl.protocol !== "https:") {
            return new Response("Only HTTPS URLs are allowed", { status: 400 });
        }

        // 限制目标 URL 的域名，必须是 swr-api 子域名，并且以 .myhuaweicloud.com 结尾
        const allowedDomainPattern = /^swr-api\.[a-z0-9\-]+\.myhuaweicloud\.com$/;
        if (!allowedDomainPattern.test(parsedUrl.hostname)) {
            return new Response("Domain is not allowed", { status: 403 });
        }

        // 如果是预检请求（OPTIONS 方法），直接返回 CORS 头
        if (request.method === "OPTIONS") {
            return new Response(null, {
                status: 204,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
                    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-SDK-Date",
                },
            });
        }

        try {
            // 代理请求到目标 URL
            const modifiedRequest = new Request(targetUrl, {
                method: request.method,
                headers: request.headers,
                body: request.body,
            });

            const response = await fetch(modifiedRequest);

            // 获取 Content-Range 响应头
            const contentRange = response.headers.get('Content-Range');
            console.log('Content-Range:', contentRange);

            // 返回结果并添加 CORS 头
            const modifiedHeaders = new Headers(response.headers);
            modifiedHeaders.set("Access-Control-Allow-Origin", "*");
            modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            modifiedHeaders.set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-SDK-Date, Content-Range");  // 确保允许 Content-Range
            modifiedHeaders.set("Access-Control-Expose-Headers", "Content-Range");


            // 如果存在 Content-Range 头，将其传递给前端
            if (contentRange) {
                modifiedHeaders.set("Content-Range", contentRange);
            }

            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: modifiedHeaders,
            });
        } catch (error) {
            return new Response(`Proxy error: ${error.message}`, { status: 500 });
        }
    },
};
