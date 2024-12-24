# Docker2SWR：轻松将 Docker 镜像同步至华为云 SWR

在容器化部署方案中，镜像仓库的选择对于应用的分发和部署效率有着重要影响。对于国内用户来说，使用华为云 SWR（Software Repository for Container）作为容器镜像仓库，可以获得更快的镜像拉取速度和更稳定的服务体验。Docker2SWR 就是一个帮助你轻松将 Docker 镜像同步到华为云 SWR 的便捷工具。

## 使用场景

在以下场景中，Docker2SWR 可以帮助你解决镜像同步的问题：

1. **加速国内访问**：当你需要使用 DockerHub 等国外镜像仓库的镜像，但受限于网络问题导致拉取速度慢
2. **批量镜像同步**：需要将大量 Docker 镜像从其他仓库同步到华为云 SWR
3. **自动化工作流**：希望在 CI/CD 流程中自动完成镜像的同步工作
4. **多源镜像管理**：需要统一管理来自不同镜像源的容器镜像

## 核心功能

Docker2SWR 提供了以下核心功能：

- **多源支持**：支持从任何公开的容器镜像仓库同步镜像，包括但不限于：

  - DockerHub
  - GitHub Container Registry (ghcr.io)
  - Google Container Registry
  - 其他公开的容器镜像仓库

- **便捷操作**：

  - 提供直观的 Web 界面，方便镜像管理
  - 支持一键添加同步任务
  - 实时查看同步状态和历史记录

- **自动化支持**：
  - 支持通过 GitHub Actions 自动执行同步任务
  - 可配置定时同步，保持镜像版本更新

## 使用效果

![HU3fMG](https://cdn.jsdelivr.net/gh/houxiaozhao/imageLibrary@master/uPic/2024/12/24/HU3fMG.png)

## 使用说明

1. **准备工作**

   - 需要有华为云账号并开通 SWR 服务
   - 获取 SWR 的登录凭证

2. **添加同步任务**

   - 在 Web 界面输入源镜像地址
   - 配置目标 SWR 仓库信息
   - 选择需要同步的标签
   - 点击创建任务即可开始同步

3. **查看同步状态**
   - 在任务列表中实时查看同步进度
   - 可以查看历史同步记录
   - 支持查看同步日志，方便排查问题

## 开始使用

### 在线体验

访问演示站点：[https://docker2swr.houxiaozhao.com/](https://docker2swr.houxiaozhao.com/)

### 开源地址

[此处添加开源仓库地址]

## 更多说明

Docker2SWR 是一个开源项目，欢迎社区贡献和使用。如果你在使用过程中遇到问题或有新的需求，欢迎通过 Issues 反馈。

[在此处添加功能使用截图]
