import { redisClient } from '../config/redis';

async function testRedis() {
  try {
    // Set a value
    await redisClient.set('test-key', 'hello redis', { EX: 10 });
    console.log('✅ Set test-key');

    // Get the value
    const value = await redisClient.get('test-key');
    console.log('✅ Got test-key:', value);

    // Delete the value
    await redisClient.del('test-key');
    console.log('✅ Deleted test-key');

    // Disconnect
    await redisClient.quit();
    console.log('✅ Disconnected from Redis');
  } catch (err) {
    console.error('❌ Redis test failed:', err);
    process.exit(1);
  }
}

testRedis(); 