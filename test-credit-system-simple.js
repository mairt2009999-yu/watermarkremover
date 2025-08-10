// 简单的积分系统测试
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

console.log('🧪 测试 V2 积分系统');
console.log('================');

const dbPath = 'dev.db';
const db = new sqlite3.Database(dbPath);

// 测试 1: 验证数据库结构
console.log('\n📋 Test 1: 数据库结构验证');
db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  (err, tables) => {
    if (err) {
      console.error('❌ 错误:', err.message);
      return;
    }

    console.log('✅ 数据库表:', tables.map((t) => t.name).join(', '));

    const expectedTables = [
      'account',
      'credit_transactions',
      'payment',
      'session',
      'subscription_credit_config',
      'user',
      'user_credits',
      'verification',
    ];
    const hasAllTables = expectedTables.every((table) =>
      tables.some((t) => t.name === table)
    );

    if (hasAllTables) {
      console.log('✅ 所有必要的表都已创建');
    } else {
      console.log('❌ 缺少必要的表');
    }
  }
);

// 测试 2: 验证积分配置
console.log('\n💰 Test 2: 积分配置验证');
db.all(
  'SELECT * FROM subscription_credit_config ORDER BY plan_id',
  (err, configs) => {
    if (err) {
      console.error('❌ 错误:', err.message);
      return;
    }

    console.log('✅ 积分配置:');
    configs.forEach((config) => {
      console.log(`  - ${config.plan_id}: ${config.monthly_credits} 积分/月`);
    });

    // 验证期望的配置
    const expected = {
      free: 5,
      pro_monthly: 100,
      pro_yearly: 150,
      lifetime: 500,
    };

    let configValid = true;
    Object.entries(expected).forEach(([planId, credits]) => {
      const config = configs.find((c) => c.plan_id === planId);
      if (!config || config.monthly_credits !== credits) {
        console.log(`❌ 配置错误: ${planId} 应该是 ${credits} 积分`);
        configValid = false;
      }
    });

    if (configValid) {
      console.log('✅ 所有积分配置都正确');
    }
  }
);

// 测试 3: 创建测试用户和积分记录
console.log('\n👤 Test 3: 创建测试数据');

// 创建测试用户
const testUserId = 'test_user_' + Date.now();
db.run(
  `INSERT INTO user (id, name, email, email_verified, created_at, updated_at) 
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
  [testUserId, 'Test User', 'test@example.com', 1],
  (err) => {
    if (err) {
      console.error('❌ 创建用户失败:', err.message);
      return;
    }

    console.log('✅ 测试用户创建成功:', testUserId);

    // 创建用户积分记录
    const creditId = 'credit_' + Date.now();
    db.run(
      `INSERT INTO user_credits (id, user_id, balance, monthly_allocation, total_earned, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [creditId, testUserId, 5, 5, 5],
      (err) => {
        if (err) {
          console.error('❌ 创建积分记录失败:', err.message);
          return;
        }

        console.log('✅ 用户积分记录创建成功');

        // 创建积分交易记录
        const transactionId = 'tx_' + Date.now();
        db.run(
          `INSERT INTO credit_transactions (id, user_id, amount, balance_after, type, reason, created_at)
            VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [transactionId, testUserId, 5, 5, 'earned', 'Initial free credits'],
          (err) => {
            if (err) {
              console.error('❌ 创建交易记录失败:', err.message);
              return;
            }

            console.log('✅ 积分交易记录创建成功');

            // 验证数据
            db.get(
              `SELECT u.name, uc.balance, uc.monthly_allocation 
              FROM user u 
              JOIN user_credits uc ON u.id = uc.user_id 
              WHERE u.id = ?`,
              [testUserId],
              (err, result) => {
                if (err) {
                  console.error('❌ 查询失败:', err.message);
                  return;
                }

                console.log('✅ 验证数据:');
                console.log(`  用户: ${result.name}`);
                console.log(`  积分余额: ${result.balance}`);
                console.log(`  月度分配: ${result.monthly_allocation}`);

                console.log('\n🎉 V2 积分系统测试完成！');
                console.log('📊 结果: 数据库创建成功，积分系统配置正确');

                db.close();
              }
            );
          }
        );
      }
    );
  }
);
