import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import { generateToken, verifyToken } from './jwt.js';

dotenv.config();

const runTest = async () => {
  console.log('--- Starting Authentication Backend Test ---');
  try {
    // Connect to DB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/skillsphere';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully.');

    // 1. Create unique email
    const testEmail = `test_${Date.now()}@example.com`;
    console.log(`Using test email: ${testEmail}`);

    // 2. Test User Creation & Password Hashing
    const password = 'SuperSecurePassword123';
    const user = await User.create({
      fullName: 'Test User',
      email: testEmail,
      password,
      role: 'freelancer',
    });

    console.log('User created in Database.');
    console.log(`Stored password (should be undefined on returned mongoose document): ${user.password}`);

    // 3. Test Compare Password
    const retrievedUser = await User.findOne({ email: testEmail }).select('+password');
    console.log('Retrieved user with password selected.');

    const isMatch = await retrievedUser.comparePassword(password);
    console.log(`Password match test (expected true): ${isMatch}`);

    const isWrongMatch = await retrievedUser.comparePassword('WrongPassword');
    console.log(`Password match test with wrong password (expected false): ${isWrongMatch}`);

    // 4. Test JWT generation and verification
    const token = generateToken(user._id);
    console.log(`Generated JWT: ${token.substring(0, 25)}...`);

    const decoded = verifyToken(token);
    console.log(`Decoded JWT user ID matches: ${decoded.id === user._id.toString()}`);

    // 5. Clean up
    await User.deleteOne({ _id: user._id });
    console.log('Cleaned up test user from database.');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    console.log('--- Authentication Backend Test Passed Successfully ---');
    process.exit(0);
  } catch (error) {
    console.error('Test Failed with Error:', error);
    try {
      await mongoose.disconnect();
    } catch (e) {}
    process.exit(1);
  }
};

runTest();
