# BulkImageSEO.com 部署配置

## 1. Google OAuth 配置

### 在 Google Cloud Console 更新设置：
1. 访问 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 选择你的 OAuth 2.0 客户端 ID
3. 在"已授权的重定向 URI"中添加：
   ```
   https://bulkimageseo.com/api/auth/callback/google
   ```
4. 保存更改

## 2. Vercel 环境变量配置

在 Vercel 项目设置中，确保以下环境变量设置正确：

```bash
# 必须设置为你的自定义域名
NEXT_PUBLIC_BASE_URL=https://bulkimageseo.com

# Google OAuth（从 Google Console 获取）
GOOGLE_CLIENT_ID=你的Google客户端ID
GOOGLE_CLIENT_SECRET=你的Google客户端密钥

# Better Auth 密钥（使用以下命令生成）
# openssl rand -base64 32
BETTER_AUTH_SECRET=你生成的密钥

# 数据库连接
DATABASE_URL=你的PostgreSQL连接字符串

# 其他必要的环境变量...
```

## 3. 检查清单

- [ ] Google Console 中已添加 `https://bulkimageseo.com/api/auth/callback/google`
- [ ] Vercel 中 `NEXT_PUBLIC_BASE_URL` 设置为 `https://bulkimageseo.com`
- [ ] 所有 OAuth 密钥都已正确设置
- [ ] 数据库连接字符串包含 SSL 参数（如需要）

## 4. 故障排查

如果 Google 登录仍然失败：

1. **检查浏览器控制台错误**
   - 打开浏览器开发者工具
   - 查看 Console 和 Network 标签

2. **验证重定向 URL**
   - 确保没有尾部斜杠
   - URL 必须完全匹配（包括协议 https://）

3. **检查 Vercel 函数日志**
   - 在 Vercel 仪表板查看函数日志
   - 查找具体的错误信息

4. **常见错误**
   - `redirect_uri_mismatch`: Google Console 中的 URI 不匹配
   - `invalid_client`: 客户端 ID 或密钥错误
   - `unauthorized_client`: OAuth 应用未正确配置

## 5. 测试步骤

1. 清除浏览器缓存和 cookies
2. 访问 https://bulkimageseo.com
3. 点击 Google 登录按钮
4. 应该重定向到 Google 授权页面
5. 授权后应返回到你的网站并成功登录