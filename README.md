# docker2swr

把 docker 镜像发布到华为云 SWR 上 (Publish Docker images to Huawei Cloud SWR)

## 简介 (Introduction)

这个项目可以帮助你将 Docker 镜像自动发布到华为云容器镜像服务(SWR)。

This project helps you automatically publish Docker images to Huawei Cloud Software Repository for Container (SWR).

## 功能特点 (Features)

- 推送 Docker 镜像到华为云 SWR，方便国内用户使用
- 支持任何注册表的镜像，比如 DockerHub、ghcr.io。理论上 github 能拉取的都能推送过去

## 首先

克隆项目到你的 GitHub 仓库

请不要使用 Fork！因为 Fork 仓库运行 GitHub Actions 会受到运行时长限制。使用以下方法通过 Git 导入项目：

1. 点击此链接进入 GitHub 的导入页面：[GitHub 导入页面](https://github.com/new/import)
2. 在 "Your old repository’s clone URL" 一栏中输入：
   ```
   https://github.com/houxiaozhao/docker2swr.git
   ```
3. 根据提示完成项目导入。

## 使用方法 (Usage)

1. 配置 GitHub Secrets

   - 设置 `LOGINCOMMAND`: 华为云 SWR 的登录命令
   - 获取登录指令
     ![image](images/获取登录指令.png)
   - 创建密钥
     ![image](images/创建密钥.png)
   - 设置密钥
     ![image](images/密钥.png)

     ```bash
     # 示例 (Example):
     docker login -u cn-north-4@xxxxxxx -p xxxxx swr.cn-north-4.myhuaweicloud.com
     ```

     > 注意：请使用你自己的登录凭证替换上述示例中的值。
     > Note: Please replace the credentials in the example with your own.

2. 配置环境变量
   ![image](images/设置变量.png)

   - 设置 `SWR_REGISTRY`: 华为云 SWR 镜像仓库地址
     ![image](images/变量1.png)

     ```bash
     # 示例 (Example):
     swr.cn-north-4.myhuaweicloud.com
     ```

   - 设置 `ORG`: 华为云 SWR 组织名称
     ![image](images/变量2.png)

     ```bash
     # 示例 (Example):
     your-organization-name
     ```

3. 运行 GitHub Actions 工作流

   ![image](images/image.png)
   最后输入要推送的镜像名称，例如 `nginx:latest`、``

4. 等待推送完成
   ![image](images/等待推送.png)
5. 查看推送结果
   去华为云的 SWR 控制台查看
   ![image](images/推送结果.png)

## 环境要求 (Requirements)

- 华为云账号和 SWR 访问权限
- GitHub Actions
