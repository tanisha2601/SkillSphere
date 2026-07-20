import { validateRegister, validateLogin } from '../validators/auth.validator.js';
import { generateToken, verifyToken } from './jwt.js';

const runUnitTests = () => {
  console.log('--- Starting Auth Backend Unit Tests ---');
  let passCount = 0;
  let failCount = 0;

  const assert = (description, condition) => {
    if (condition) {
      console.log(`[PASS] ${description}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${description}`);
      failCount++;
    }
  };

  try {
    // 1. Test JWT Utilities
    console.log('\n--- 1. Testing JWT Utility ---');
    const testUserId = '507f1f77bcf86cd799439011';
    const token = generateToken(testUserId);
    assert('Token should be a string', typeof token === 'string');
    assert('Token should have length', token.length > 0);

    const decoded = verifyToken(token);
    assert('Decoded token user ID should match original ID', decoded.id === testUserId);

    // 2. Test Input Validation Middlewares
    console.log('\n--- 2. Testing Registration Validator ---');

    // Test Valid Data
    const mockReqValid = {
      body: {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'securepassword123',
        role: 'client',
      },
    };
    let nextCalled = false;
    validateRegister(mockReqValid, {}, (err) => {
      if (!err) nextCalled = true;
    });
    assert('Valid registration inputs should pass validation', nextCalled);

    // Test Invalid Data
    const mockReqInvalid = {
      body: {
        fullName: '',
        email: 'invalid-email',
        password: '123',
        role: 'invalid-role',
      },
    };
    try {
      validateRegister(mockReqInvalid, {}, (err) => {
        if (err) throw err;
      });
      assert('Invalid registration inputs should fail validation', false);
    } catch (error) {
      assert('Invalid inputs should throw ApiError with status 400', error.statusCode === 400);
      assert('Validation error should be user-facing success=false', error.success === false);
      assert('Validation error should contain list of detailed errors', Array.isArray(error.errors));
      assert('Validation error should report 4 fields failed', error.errors.length === 4);

      const fields = error.errors.map(e => e.field);
      assert('Error list should include fullName', fields.includes('fullName'));
      assert('Error list should include email', fields.includes('email'));
      assert('Error list should include password', fields.includes('password'));
      assert('Error list should include role', fields.includes('role'));
    }

    console.log('\n--- 3. Testing Login Validator ---');
    // Test Valid Data
    const mockLoginReqValid = {
      body: {
        email: 'jane@example.com',
        password: 'securepassword123',
      },
    };
    let loginNextCalled = false;
    validateLogin(mockLoginReqValid, {}, (err) => {
      if (!err) loginNextCalled = true;
    });
    assert('Valid login inputs should pass validation', loginNextCalled);

    // Test Invalid Data
    const mockLoginReqInvalid = {
      body: {
        email: '',
        password: '',
      },
    };
    try {
      validateLogin(mockLoginReqInvalid, {}, (err) => {
        if (err) throw err;
      });
      assert('Invalid login inputs should fail validation', false);
    } catch (error) {
      assert('Invalid login inputs should throw ApiError with status 400', error.statusCode === 400);
      assert('Validation error list should report 2 fields failed', error.errors.length === 2);
    }

    console.log('\n--- Test Summary ---');
    console.log(`Passed: ${passCount}`);
    console.log(`Failed: ${failCount}`);

    if (failCount > 0) {
      process.exit(1);
    } else {
      console.log('--- All Authentication Unit Tests Passed Successfully ---');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  }
};

runUnitTests();
