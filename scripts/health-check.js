#!/usr/bin/env node

// scripts/health-check.js - SMART HEALTH CHECK pentru toate environments
const https = require('https');
const http = require('http');

// Detectează environment automat
const getHealthCheckURL = () => {
  // 1. Production - PRIORITIZEAZĂ porverse.com
  if (process.env.NODE_ENV === 'production') {
    return 'https://www.porverse.com/api/health';
  }
  
  // 2. Verifică dacă rulează în Digital Ocean (prin env vars)
  if (process.env.DO_APP_URL) {
    return process.env.DO_APP_URL + '/api/health';
  }
  
  // 3. Verifică dacă e staging/preview
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/health`;
  }
  
  // 4. Development - doar atunci localhost
  const port = process.env.PORT || 3000;
  return `http://localhost:${port}/api/health`;
};

// Functie pentru HTTP/HTTPS request
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const request = client.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          try {
            const healthData = JSON.parse(data);
            resolve({
              success: true,
              status: response.statusCode,
              data: healthData
            });
          } catch (error) {
            resolve({
              success: true,
              status: response.statusCode,
              data: { raw: data }
            });
          }
        } else {
          reject({
            success: false,
            status: response.statusCode,
            error: `HTTP ${response.statusCode}: ${data}`
          });
        }
      });
    });
    
    request.on('error', (error) => {
      reject({
        success: false,
        error: error.message,
        code: error.code
      });
    });
    
    // Timeout după 10 secunde
    request.setTimeout(10000, () => {
      request.destroy();
      reject({
        success: false,
        error: 'Health check timeout (10s)',
        code: 'TIMEOUT'
      });
    });
  });
};

// Main health check function
const performHealthCheck = async () => {
  const url = getHealthCheckURL();
  const startTime = Date.now();
  
  console.log(`🏥 PorVerse Health Check`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Checking: ${url}`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log('─'.repeat(50));
  
  try {
    const result = await makeRequest(url);
    const duration = Date.now() - startTime;
    
    console.log(`✅ Health Check PASSED`);
    console.log(`📊 Status: ${result.status}`);
    console.log(`⚡ Response Time: ${duration}ms`);
    
    if (result.data) {
      console.log(`📋 Health Data:`);
      if (result.data.status) console.log(`   Status: ${result.data.status}`);
      if (result.data.timestamp) console.log(`   Timestamp: ${result.data.timestamp}`);
      if (result.data.version) console.log(`   Version: ${result.data.version}`);
      if (result.data.database) console.log(`   Database: ${result.data.database}`);
      if (result.data.services) console.log(`   Services: ${result.data.services}`);
    }
    
    console.log('─'.repeat(50));
    console.log(`🎉 PorVerse is healthy and operational!`);
    
    // Success exit
    process.exit(0);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.log(`❌ Health Check FAILED`);
    console.log(`📊 Duration: ${duration}ms`);
    console.log(`🚨 Error: ${error.error || error.message}`);
    
    if (error.status) {
      console.log(`📋 HTTP Status: ${error.status}`);
    }
    
    if (error.code) {
      console.log(`🔍 Error Code: ${error.code}`);
    }
    
    console.log('─'.repeat(50));
    console.log(`💥 PorVerse health check failed!`);
    
    // Provide troubleshooting info
    console.log(`\n🔧 Troubleshooting:`);
    console.log(`   1. Check if the server is running`);
    console.log(`   2. Verify the health endpoint exists: ${url}`);
    console.log(`   3. Check network connectivity`);
    console.log(`   4. Review server logs for errors`);
    
    if (url.includes('localhost')) {
      console.log(`   5. Try: npm run dev (for development)`);
    } else {
      console.log(`   5. Check production deployment status`);
    }
    
    // Error exit
    process.exit(1);
  }
};

// Extended health check with retries pentru production
const performHealthCheckWithRetries = async (maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`\n🔄 Retry attempt ${attempt}/${maxRetries}`);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
      
      await performHealthCheck();
      return; // Success, exit
      
    } catch (error) {
      if (attempt === maxRetries) {
        console.log(`\n💀 All ${maxRetries} health check attempts failed`);
        process.exit(1);
      }
      console.log(`❌ Attempt ${attempt} failed, retrying...`);
    }
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const hasRetryFlag = args.includes('--retry') || args.includes('-r');
const maxRetries = hasRetryFlag ? 3 : 1;

// Run health check
if (maxRetries > 1) {
  performHealthCheckWithRetries(maxRetries);
} else {
  performHealthCheck();
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Health check interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n\n🛑 Health check terminated');
  process.exit(1);
});