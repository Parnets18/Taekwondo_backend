/**
 * Test Certificate Statistics Endpoint
 * Run this to verify the fix works before deploying
 */

const axios = require('axios');

// Test configuration
const BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const PRODUCTION_URL = 'https://taekwon-frontend.onrender.com/api';

console.log('🧪 Testing Certificate Statistics Endpoint\n');

async function testEndpoint(url, label) {
  console.log(`\n📡 Testing ${label}: ${url}`);
  console.log('─'.repeat(60));
  
  try {
    const startTime = Date.now();
    const response = await axios.get(url);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Status: ${response.status} OK`);
    console.log(`⏱️  Response Time: ${duration}ms`);
    console.log(`📦 Data Structure:`);
    
    const data = response.data;
    
    // Verify response structure
    if (data.status === 'success') {
      console.log('   ✓ status: "success"');
    } else {
      console.log('   ✗ status:', data.status);
    }
    
    if (data.data) {
      console.log('   ✓ data object exists');
      
      const stats = data.data;
      
      // Check statistics fields
      if (stats.totalCertificates !== undefined) {
        console.log(`   ✓ totalCertificates: ${stats.totalCertificates}`);
      }
      if (stats.activeCertificates !== undefined) {
        console.log(`   ✓ activeCertificates: ${stats.activeCertificates}`);
      }
      if (stats.revokedCertificates !== undefined) {
        console.log(`   ✓ revokedCertificates: ${stats.revokedCertificates}`);
      }
      
      // Check byType
      if (stats.byType) {
        console.log(`   ✓ byType: ${Object.keys(stats.byType).length} types`);
      }
      
      // Check byYear
      if (stats.byYear) {
        console.log(`   ✓ byYear: ${Object.keys(stats.byYear).length} years`);
      }
      
      // Check recentCertificates
      if (stats.recentCertificates && Array.isArray(stats.recentCertificates)) {
        console.log(`   ✓ recentCertificates: ${stats.recentCertificates.length} certificates`);
        
        // Verify first certificate has required fields
        if (stats.recentCertificates.length > 0) {
          const cert = stats.recentCertificates[0];
          console.log('\n   📋 First Certificate Fields:');
          
          const requiredFields = [
            'id', 'student', 'studentName', 'title', 'type', 
            'category', 'issuedDate', 'status', 'examiner', 'verificationCode'
          ];
          
          requiredFields.forEach(field => {
            if (cert[field] !== undefined) {
              console.log(`      ✓ ${field}: ${typeof cert[field] === 'object' ? 'Date' : cert[field]}`);
            } else {
              console.log(`      ✗ ${field}: MISSING`);
            }
          });
        }
      } else {
        console.log('   ✗ recentCertificates: missing or not an array');
      }
    } else {
      console.log('   ✗ data object missing');
    }
    
    return true;
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    if (error.response) {
      console.log(`   Status: ${error.response.status}`);
      console.log(`   Data:`, error.response.data);
    }
    return false;
  }
}

async function runTests() {
  console.log('Starting tests...\n');
  
  // Test 1: Local server (if running)
  const localSuccess = await testEndpoint(
    `${BASE_URL}/certificates/statistics`,
    'Local Server'
  );
  
  // Test 2: Production server
  const prodSuccess = await testEndpoint(
    `${PRODUCTION_URL}/certificates/statistics`,
    'Production Server (Render.com)'
  );
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Local Server:      ${localSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Production Server: ${prodSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log('='.repeat(60));
  
  if (prodSuccess) {
    console.log('\n✅ Production endpoint is working!');
    console.log('   Admin dashboard should load without crashes.');
  } else {
    console.log('\n❌ Production endpoint is NOT working!');
    console.log('   Please deploy the latest changes to Render.com');
    console.log('   See DEPLOY_FIX_TO_RENDER.md for instructions');
  }
  
  console.log('\n');
}

// Run tests
runTests().catch(error => {
  console.error('Test script error:', error);
  process.exit(1);
});
