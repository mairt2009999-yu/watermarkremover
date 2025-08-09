// Test database connection and credit system
require('dotenv').config({ path: '.env.local' });

async function testDatabase() {
  console.log('Testing database connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  console.log('CREDIT_SYSTEM_VERSION:', process.env.NEXT_PUBLIC_CREDIT_SYSTEM_VERSION);
  
  try {
    // Direct SQLite connection for testing
    const Database = require('better-sqlite3');
    const dbPath = process.env.DATABASE_URL.replace('file:', '');
    const db = new Database(dbPath);
    console.log('Database file:', dbPath);
    
    console.log('✅ Database connected successfully');
    
    // Test credit system configuration
    const configs = db.prepare('SELECT * FROM subscription_credit_config').all();
    console.log('✅ Credit configurations found:', configs.length);
    
    for (const config of configs) {
      console.log(`  - ${config.plan_id}: ${config.monthly_credits} credits/month`);
    }
    
    // Test tables exist
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('✅ Tables found:', tables.map(t => t.name).join(', '));
    
    db.close();
    
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
}

testDatabase().then(success => {
  console.log(success ? '\n🎉 All tests passed!' : '\n💥 Tests failed!');
  process.exit(success ? 0 : 1);
});