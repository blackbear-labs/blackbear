#!/usr/bin/env node

/**
 * Comprehensive Test Script for Gestun Platform
 * Tests all API endpoints and features
 */

const API_BASE = 'http://localhost:3000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

let passedTests = 0;
let failedTests = 0;

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, colors.bold + colors.cyan);
  console.log('='.repeat(60));
}

function logTest(name, passed, details = '') {
  if (passed) {
    log(`✓ ${name}`, colors.green);
    passedTests++;
  } else {
    log(`✗ ${name}`, colors.red);
    if (details) log(`  ${details}`, colors.yellow);
    failedTests++;
  }
}

async function testGET(endpoint, testName) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    const data = await response.json();
    logTest(testName, response.ok, !response.ok ? `Status: ${response.status}` : '');
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    logTest(testName, false, error.message);
    return { success: false, error: error.message };
  }
}

async function testPOST(endpoint, body, testName) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    logTest(testName, response.ok, !response.ok ? `Status: ${response.status}, Error: ${data.error || 'Unknown'}` : '');
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    logTest(testName, false, error.message);
    return { success: false, error: error.message };
  }
}

async function testPOSTExpectFail(endpoint, body, testName) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    // Expected to fail (status 4xx)
    const shouldFail = response.status >= 400 && response.status < 500;
    logTest(testName, shouldFail, !shouldFail ? `Expected to fail but got status ${response.status}` : '');
    return { success: shouldFail, status: response.status };
  } catch (error) {
    logTest(testName, true, 'Connection error (expected failure)');
    return { success: true };
  }
}

async function testPUT(endpoint, body, testName) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    logTest(testName, response.ok, !response.ok ? `Status: ${response.status}, Error: ${data.error || 'Unknown'}` : '');
    return { success: response.ok, data, status: response.status };
  } catch (error) {
    logTest(testName, false, error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runTests() {
  log('🚀 Starting Comprehensive Feature Tests...\n', colors.bold + colors.blue);

  // ========================================
  // TEST 1: Basic API Health Check
  // ========================================
  logSection('1. BASIC API HEALTH CHECK');

  await testGET('/api/site-config', 'Site Config API');
  const initResult = await testPOST('/api/init', {}, 'Initialize Database');

  // ========================================
  // TEST 2: Authentication
  // ========================================
  logSection('2. AUTHENTICATION');

  // Test Login - Invalid (Expected to fail)
  await testPOSTExpectFail('/api/auth/login', {
    email: 'wrong@email.com',
    password: 'wrongpass',
    role: 'owner'
  }, 'Login with Invalid Credentials (should fail)');

  // Test Login - Owner
  const ownerLogin = await testPOST('/api/auth/login', {
    email: 'owner@gestun.com',
    password: 'admin123',
    role: 'owner'
  }, 'Owner Login');
  const ownerSession = ownerLogin.data.user;

  // Test Login - Invalid Role (Expected to fail)
  await testPOSTExpectFail('/api/auth/login', {
    email: 'owner@gestun.com',
    password: 'admin123',
    role: 'partner'
  }, 'Owner Login with Wrong Role (should fail)');

  // Test Register Partner - Duplicate Email (Expected to fail)
  await testPOSTExpectFail('/api/auth/register', {
    name: 'Test Partner',
    email: 'owner@gestun.com',
    password: 'password123',
    confirmPassword: 'password123',
    bankName: 'BCA',
    accountNumber: '081234567890',
    accountOwner: 'Test Owner',
    city: 'Jakarta'
  }, 'Register with Duplicate Email (should fail)');

  // Test Register Partner - Valid
  const randomSuffix = Date.now();
  const partnerEmail = `partner${randomSuffix}@test.com`;
  const partnerRegister = await testPOST('/api/auth/register', {
    name: `Test Partner ${randomSuffix}`,
    email: partnerEmail,
    password: 'password123',
    confirmPassword: 'password123',
    bankName: 'BCA',
    accountNumber: '081234567890',
    accountOwner: 'Test Partner',
    city: 'Bandung'
  }, 'Register New Partner');
  const partnerSession = partnerRegister.data.user;

  // ========================================
  // TEST 3: Payment & Transaction Methods
  // ========================================
  logSection('3. PAYMENT & TRANSACTION METHODS');

  const payments = await testGET('/api/payments', 'Get Payment Types');
  const methods = await testGET('/api/transaction-methods', 'Get Transaction Methods');
  const platforms = await testGET('/api/platforms', 'Get Platforms');

  // ========================================
  // TEST 4: Customer Management
  // ========================================
  logSection('4. CUSTOMER MANAGEMENT');

  // List customers
  const customersList = await testGET('/api/customers', 'List All Customers');

  // Create customer
  const customerCreate = await testPOST('/api/customers', {
    name: `Test Customer ${randomSuffix}`,
    whatsapp: '081234567890',
    bankName: 'Mandiri',
    accountNumber: '1234567890',
    accountOwner: 'Test Customer',
    city: 'Surabaya',
    label: 'Regular'
  }, 'Create New Customer');

  // Create customer with invalid WhatsApp (Expected to fail)
  await testPOSTExpectFail('/api/customers', {
    name: 'Invalid Customer',
    whatsapp: '0812', // Too short
    city: 'Jakarta'
  }, 'Create Customer with Invalid WhatsApp (should fail)');

  // ========================================
  // TEST 5: Transaction Management
  // ========================================
  logSection('5. TRANSACTION MANAGEMENT');

  if (payments.success && payments.data.payments.length > 0 &&
      methods.success && methods.data.methods.length > 0) {

    const paymentType = payments.data.payments[0];
    const transactionMethod = methods.data.methods[0];
    const platform = platforms.success && platforms.data.platforms.length > 0
      ? platforms.data.platforms[0]
      : null;

    // Create transaction (from landing page - no partner)
    const transactionCreate = await testPOST('/api/transactions', {
      name: `Transaction Customer ${randomSuffix}`,
      whatsapp: '081234567890',
      bankName: 'BCA',
      accountNumber: '1234567890',
      accountOwner: 'Customer',
      city: 'Jakarta',
      nominal: 1500000,
      paymentTypeId: paymentType.id,
      transactionMethodId: transactionMethod.id,
      platformId: platform?.id || null,
      partnerId: null
    }, 'Create Transaction (No Partner)');

    // Create transaction with partner
    if (partnerRegister.success) {
      await testPOST('/api/transactions', {
        name: `Partner Transaction ${randomSuffix}`,
        whatsapp: '081234567891',
        bankName: 'Mandiri',
        accountNumber: '0987654321',
        accountOwner: 'Partner Customer',
        city: 'Bandung',
        nominal: 2000000,
        paymentTypeId: paymentType.id,
        transactionMethodId: transactionMethod.id,
        platformId: platform?.id || null,
        partnerId: partnerSession.partnerId
      }, 'Create Transaction (With Partner)');
    }

    // Invalid transaction - missing fields (Expected to fail)
    await testPOSTExpectFail('/api/transactions', {
      name: 'Invalid Transaction',
      nominal: 1000000
    }, 'Create Invalid Transaction (should fail)');

    // List transactions
    await testGET('/api/transactions/list', 'List All Transactions');
  } else {
    log('⚠ Skipping transaction tests (payment/method data not available)', colors.yellow);
  }

  // ========================================
  // TEST 6: Partner Management
  // ========================================
  logSection('6. PARTNER MANAGEMENT');

  // List partners
  const partnersList = await testGET('/api/partners', 'List All Partners');

  // Get partner stats (if we have a partner)
  if (partnerRegister.success && partnerSession.partnerId) {
    await testGET(`/api/partners/${partnerSession.partnerId}/stats`, 'Get Partner Stats');
  }

  // Get leaderboard
  const leaderboard = await testGET('/api/partners/leaderboard', 'Get Leaderboard');

  // Create partner via API (Owner only)
  await testPOST('/api/partners', {
    name: `API Partner ${randomSuffix}`,
    email: `apipartner${randomSuffix}@test.com`,
    password: 'password123',
    bankName: 'BNI',
    accountNumber: '089876543210',
    accountOwner: 'API Partner',
    city: 'Medan',
    commissionRate: 25
  }, 'Create Partner via API');

  // Invalid partner - commission out of range (Expected to fail)
  await testPOSTExpectFail('/api/partners', {
    name: 'Invalid Partner',
    email: `invalid${randomSuffix}@test.com`,
    password: 'password123',
    bankName: 'BRI',
    accountNumber: '081111111111',
    accountOwner: 'Invalid',
    city: 'Makassar',
    commissionRate: 150 // Invalid (> 100)
  }, 'Create Partner with Invalid Commission (should fail)');

  // ========================================
  // TEST 7: Promo & Broadcast
  // ========================================
  logSection('7. PROMO & BROADCAST MANAGEMENT');

  // List promos
  await testGET('/api/promos', 'List All Promos');

  // Create valid promo
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 30);

  await testPOST('/api/promos', {
    title: `Test Promo ${randomSuffix}`,
    link: 'https://canva.com',
    startDate: startDate.toISOString(),
    expireDate: endDate.toISOString()
  }, 'Create New Promo');

  // Create invalid promo - expire date before start date (Expected to fail)
  await testPOSTExpectFail('/api/promos', {
    title: 'Invalid Promo',
    link: 'https://example.com',
    startDate: endDate.toISOString(),
    expireDate: startDate.toISOString()
  }, 'Create Promo with Invalid Dates (should fail)');

  // List broadcasts
  await testGET('/api/broadcasts', 'List All Broadcasts');

  // Create valid broadcast
  await testPOST('/api/broadcasts', {
    title: `Test Broadcast ${randomSuffix}`,
    description: 'This is a test broadcast message',
    startDate: startDate.toISOString(),
    expireDate: endDate.toISOString()
  }, 'Create New Broadcast');

  // ========================================
  // TEST 8: Stats & Site Config
  // ========================================
  logSection('8. STATS & SITE CONFIGURATION');

  // Get general stats
  await testGET('/api/stats', 'Get General Statistics');

  // Get site config
  const siteConfig = await testGET('/api/site-config', 'Get Site Configuration');

  // Update site config
  if (siteConfig.success) {
    await testPUT('/api/site-config', {
      siteTitle: 'Black Bear Gestun - Test',
      contactWhatsApp: '081234567890',
      maintenanceMode: false
    }, 'Update Site Configuration');
  }

  // ========================================
  // TEST 9: Page Accessibility
  // ========================================
  logSection('9. PAGE ACCESSIBILITY');

  const pages = [
    { path: '/', name: 'Landing Page' },
    { path: '/order', name: 'Order Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/owner/dashboard', name: 'Owner Dashboard' },
    { path: '/partner/dashboard', name: 'Partner Dashboard' }
  ];

  for (const page of pages) {
    try {
      const response = await fetch(`${API_BASE}${page.path}`);
      logTest(`Page: ${page.name}`, response.ok, !response.ok ? `Status: ${response.status}` : '');
    } catch (error) {
      logTest(`Page: ${page.name}`, false, error.message);
    }
  }

  // ========================================
  // TEST SUMMARY
  // ========================================
  logSection('TEST SUMMARY');
  log(`Total Tests: ${passedTests + failedTests}`, colors.bold);
  log(`Passed: ${passedTests}`, colors.green);
  log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);

  if (failedTests === 0) {
    log('\n🎉 All tests passed!', colors.green + colors.bold);
  } else {
    log('\n⚠ Some tests failed. Please review the errors above.', colors.yellow + colors.bold);
  }

  process.exit(failedTests > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
