import bcrypt from 'bcrypt';
import { db } from '../src/config/database';

async function createTestUser() {
  try {
    // Test user credentials
    const email = 'test@example.com';
    const password = 'TestPass123!';
    const username = 'testuser';
    
    // Hash the password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert the test user
    const user = await db.one(`
      INSERT INTO users (
        email,
        password_hash,
        username,
        first_name,
        last_name,
        email_verified,
        account_status,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
      ) RETURNING *
    `, [
      email,
      hashedPassword,
      username,
      'Test',
      'User',
      true, // email verified
      'active' // account status
    ]);

    console.log('✅ Test user created successfully!');
    console.log('\nLogin credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('\nUser details:', user);

    // Close database connection
    await db.$pool.end();
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
}

// Run the script
createTestUser(); 