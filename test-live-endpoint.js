/**
 * Test Live Certificate Statistics Endpoint on Render
 * Run this after deploying to verify the fix
 */

const LIVE_URL = 'https://taekwon-frontend.onrender.com/api';

async function testLiveEndpoint() {
  console.log('🧪 Testing Live Certificate Statistics Endpoint...\n');
  console.log('📍 URL:', `${LIVE_URL}/certificates/statistics\n`);

  try {
    console.log('⏳ Fetching data...');
    const response = await fetch(`${LIVE_URL}/certificates/statistics`);
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response OK:', response.ok);
    
    if (!response.ok) {
      console.log('\n❌ ERROR: Got', response.status, response.statusText);
      console.log('\n🔧 Possible Issues:');
      console.log('   1. Backend not deployed yet');
      console.log('   2. Route not registered in server.js');
      console.log('   3. Server crashed on startup');
      console.log('\n💡 Solutions:');
      console.log('   1. Deploy backend: git push origin main');
      console.log('   2. Check Render logs for errors');
      console.log('   3. Verify server.js has the statistics route');
      return;
    }

    const data = await response.json();
    console.log('\n✅ SUCCESS! Endpoint is working!\n');
    console.log('📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));

    // Verify data structure
    console.log('\n🔍 Validating Data Structure...');
    
    if (data.status === 'success') {
      console.log('✅ Status: success');
    } else {
      console.log('❌ Status:', data.status);
    }

    if (data.data) {
      console.log('✅ Data object exists');
      
      if (data.data.recentCertificates && Array.isArray(data.data.recentCertificates)) {
        console.log('✅ recentCertificates array exists');
        console.log('   Count:', data.data.recentCertificates.length);
        
        // Check first certificate for examiner field
        if (data.data.recentCertificates.length > 0) {
          const firstCert = data.data.recentCertificates[0];
          console.log('\n📋 First Certificate:');
          console.log('   ID:', firstCert.id);
          console.log('   Student:', firstCert.student);
          console.log('   Title:', firstCert.title);
          
          if (firstCert.examiner) {
            console.log('   ✅ Examiner:', firstCert.examiner);
          } else {
            console.log('   ❌ Examiner: MISSING!');
          }
          
          if (firstCert.achievementDetails?.examiner) {
            console.log('   ✅ achievementDetails.examiner:', firstCert.achievementDetails.examiner);
          } else {
            console.log('   ⚠️  achievementDetails.examiner: MISSING');
          }
        }
      } else {
        console.log('❌ recentCertificates array missing or invalid');
      }
    } else {
      console.log('❌ Data object missing');
    }

    console.log('\n🎉 Test Complete! Admin panel should work now.');
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\n🔧 Possible Issues:');
    console.log('   1. Network error - check internet connection');
    console.log('   2. Backend server is down');
    console.log('   3. CORS issue (shouldn\'t happen with same domain)');
    console.log('\n💡 Solutions:');
    console.log('   1. Check Render service status');
    console.log('   2. Verify backend is deployed');
    console.log('   3. Check Render logs for startup errors');
  }
}

// Run the test
testLiveEndpoint();
