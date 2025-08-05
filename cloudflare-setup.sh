#!/bin/bash

echo "Cloudflare 部署设置脚本"
echo "======================="

# 检查是否安装了必要的依赖
echo "1. 检查依赖..."
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler 未安装。请运行: pnpm add -D wrangler"
else
    echo "✅ Wrangler 已安装"
fi

# 创建必要的环境变量文件
echo ""
echo "2. 创建 Cloudflare 环境变量模板..."
cat > .env.cloudflare.example << 'EOF'
# Cloudflare 部署环境变量
# 复制此文件为 .env.cloudflare 并填写实际值

# Cloudflare 账户信息
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token

# 数据库连接（使用外部 PostgreSQL 服务）
# 推荐使用 Neon、Supabase 或 PlanetScale
DATABASE_URL=postgresql://user:password@host:5432/database

# 应用配置
NEXT_PUBLIC_BASE_URL=https://your-app.pages.dev

# 认证配置
BETTER_AUTH_SECRET=your-auth-secret

# 支付配置（Stripe）
STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret

# 邮件服务（Resend）
RESEND_API_KEY=your-resend-key

# 存储服务（Cloudflare R2）
STORAGE_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=your-r2-access-key
STORAGE_SECRET_ACCESS_KEY=your-r2-secret-key
STORAGE_BUCKET_NAME=your-bucket-name
EOF

echo "✅ 创建了 .env.cloudflare.example"

# 创建 Cloudflare Pages 配置
echo ""
echo "3. 创建 Cloudflare Pages 函数目录..."
mkdir -p functions/api

# 创建示例 Edge 函数
cat > functions/api/health.js << 'EOF'
export async function onRequest(context) {
  return new Response(JSON.stringify({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
EOF

echo "✅ 创建了示例 Edge 函数"

# 创建部署脚本
echo ""
echo "4. 创建部署脚本..."
cat > deploy-cloudflare.sh << 'EOF'
#!/bin/bash

# 构建项目
echo "构建项目..."
pnpm build

# 使用 wrangler pages 部署
echo "部署到 Cloudflare Pages..."
wrangler pages deploy .next/static --project-name=watermarkremovertools-template

echo "部署完成！"
EOF

chmod +x deploy-cloudflare.sh
echo "✅ 创建了部署脚本"

echo ""
echo "设置完成！下一步："
echo "1. 复制 .env.cloudflare.example 为 .env.cloudflare 并填写配置"
echo "2. 登录 Cloudflare: wrangler login"
echo "3. 创建 Pages 项目: wrangler pages project create watermarkremovertools-template"
echo "4. 运行部署: ./deploy-cloudflare.sh"