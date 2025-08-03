# Prisma Error Fix for Vercel Deployment

## 问题说明
即使项目使用 Drizzle ORM，但某些依赖项（可能是 better-auth 或其他包）在运行时尝试加载 Prisma Client，导致在 Vercel 上出现错误。

## 已应用的修复

### 1. 添加了 Prisma 依赖
在 `package.json` 中添加：
- `@prisma/client`: 作为生产依赖
- `prisma`: 作为开发依赖

### 2. 创建了 Prisma Schema
创建了 `prisma/schema.prisma` 文件，包含最小配置。

### 3. 更新了构建脚本
- `postinstall`: 运行 `prisma generate` 生成客户端
- `vercel-build`: 自定义 Vercel 构建命令

### 4. 配置了 Next.js
在 `next.config.ts` 中添加了 webpack 配置，将 Prisma 标记为外部依赖。

### 5. 更新了 Vercel 配置
`vercel.json` 使用自定义构建命令。

## 部署步骤

1. **提交并推送更改**
   ```bash
   git add .
   git commit -m "Fix Prisma error on Vercel deployment"
   git push
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **在 Vercel 中重新部署**
   - 等待自动部署或手动触发
   - 确保使用了新的构建配置

## 验证修复

部署后检查：
1. 没有 Prisma 相关错误
2. Google OAuth 正常工作
3. 应用正常运行

## 注意事项

- 这是一个临时解决方案，用于满足依赖项的要求
- 实际的数据库操作仍然使用 Drizzle ORM
- Prisma 只是为了防止运行时错误而添加的