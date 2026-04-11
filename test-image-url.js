// Quick test to check if image URLs are accessible
const axios = require('axios');

const testImageURL = async () => {
  try {
    // Test the onboarding API
    const response = await axios.get('http://192.168.1.22:9000/api/onboarding');
    console.log('📋 Onboarding API Response:');
    console.log(JSON.stringify(response.data, null, 2));
    
    // Test if any images exist and are accessible
    if (response.data && response.data.length > 0) {
      for (const slide of response.data) {
        if (slide.image) {
          console.log(`\n🔍 Testing image: ${slide.title}`);
          console.log(`📸 Image path: ${slide.image}`);
          
          // Construct the full URL
          let imageUrl;
          if (slide.image.startsWith('http')) {
            imageUrl = slide.image;
          } else if (slide.image.includes('uploads')) {
            const relativePath = slide.image.substring(slide.image.indexOf('uploads'));
            imageUrl = `http://192.168.1.22:9000/${relativePath}`;
          } else {
            imageUrl = `http://192.168.1.22:9000/${slide.image}`;
          }
          
          console.log(`🌐 Full URL: ${imageUrl}`);
          
          try {
            const imgResponse = await axios.head(imageUrl);
            console.log(`✅ Image accessible - Status: ${imgResponse.status}, Content-Type: ${imgResponse.headers['content-type']}`);
          } catch (imgError) {
            console.log(`❌ Image not accessible - Error: ${imgError.message}`);
            console.log(`   Status: ${imgError.response?.status}, Message: ${imgError.response?.statusText}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error testing:', error.message);
  }
};

testImageURL();