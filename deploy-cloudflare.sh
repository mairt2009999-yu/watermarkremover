#!/bin/bash

# 构建项目
echo "构建项目..."
pnpm build

# 使用 wrangler pages 部署
echo "部署到 Cloudflare Pages..."
wrangler pages deploy .next/static --project-name=mksaas-template

echo "部署完成！"
