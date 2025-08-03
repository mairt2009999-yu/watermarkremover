# Vercel Prisma 错误解决方案

## 问题分析

错误显示 Prisma Client 6.6.0 无法找到查询引擎，但我们的项目：
1. 实际使用 Drizzle ORM，不使用 Prisma
2. 某些依赖项在运行时尝试加载 Prisma
3. Vercel 上显示的版本（6.6.0）与我们指定的版本不匹配

## 立即解决步骤

### 1. 清除 Vercel 构建缓存（最重要）

在 Vercel 仪表板中：
1. 进入项目设置（Settings）
2. 找到 "Advanced" 部分
3. 点击 "Clear Build Cache"
4. 重新部署

### 2. 设置环境变量

在 Vercel 项目设置中添加：
```
PRISMA_HIDE_UPDATE_MESSAGE=true
PRISMA_ENGINES_MIRROR=https://binaries.prisma.sh
```

### 3. 如果仍然失败，尝试以下方案

#### 方案 A：使用兼容的 Prisma 版本
```bash
# 先删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 安装与错误匹配的版本
pnpm add @prisma/client@6.6.0
pnpm add -D prisma@6.6.0

# 重新安装所有依赖
pnpm install

# 提交并推送
git add .
git commit -m "Update Prisma to version 6.6.0"
git push
```

#### 方案 B：完全移除 Prisma 依赖
如果项目确实不需要 Prisma，可以：
1. 找出哪个包依赖 Prisma
2. 寻找不依赖 Prisma 的替代方案
3. 或者 fork 该包并移除 Prisma 依赖

## 根本原因

这个问题通常是因为：
1. Vercel 的构建缓存包含旧版本的依赖
2. 某个依赖项的 peer dependencies 引入了不同版本的 Prisma
3. pnpm 的 workspace 或 monorepo 设置导致版本冲突

## 长期解决方案

考虑：
1. 调查哪个依赖真正需要 Prisma
2. 向上游项目报告问题
3. 使用补丁或 fork 来移除不必要的 Prisma 依赖