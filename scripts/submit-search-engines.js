#!/usr/bin/env node

/**
 * Submit The Civic OS URLs to search engines via the IndexNow protocol
 * (Supported by Microsoft Bing, Yandex, Seznam.cz, Naver, and DuckDuckGo).
 */

const HOST = 'civic-os-opensourcism.cloud';
const KEY = 'c7f92e4a81b34d589e6a0d2f47c815b2';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/#bounties`,
  `https://${HOST}/#justice`,
  `https://${HOST}/#legislature`,
  `https://${HOST}/#commons`,
  `https://${HOST}/#membership`,
  `https://${HOST}/#audit`,
  `https://${HOST}/#ckbtc`,
  `https://${HOST}/#chat`
];

const ENDPOINTS = [
  { name: 'IndexNow Central (Bing, Yandex, Seznam, Naver)', url: 'https://api.indexnow.org/indexnow' },
  { name: 'Microsoft Bing IndexNow', url: 'https://www.bing.com/indexnow' }
];

async function submitToIndexNow() {
  console.log('='.repeat(60));
  console.log(' Submitting The Civic OS to Major Search Engines');
  console.log(` Host:         https://${HOST}`);
  console.log(` Sitemap:      https://${HOST}/sitemap.xml`);
  console.log(` IndexNow Key: ${KEY}`);
  console.log(` URLs Count:   ${URLS.length}`);
  console.log('='.repeat(60));

  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: URLS
  });

  for (const endpoint of ENDPOINTS) {
    try {
      process.stdout.write(`\nSubmitting to ${endpoint.name}...\n`);
      const resp = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: payload
      });

      if (resp.status === 200 || resp.status === 202) {
        console.log(`  ✅ Success (HTTP ${resp.status}): URLs accepted for priority indexing.`);
      } else {
        const text = await resp.text();
        console.log(`  ⚠️ Notice (HTTP ${resp.status}): ${text.slice(0, 100)}`);
      }
    } catch (err) {
      console.error(`  ❌ Error submitting to ${endpoint.url}:`, err.message);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(' Webmaster Tools & Manual Console Registration Links:');
  console.log('-'.repeat(60));
  console.log(' • Google Search Console:');
  console.log(`   Submit Sitemap: https://search.google.com/search-console/sitemaps?resource_id=https%3A%2F%2F${encodeURIComponent(HOST)}%2F`);
  console.log(`   Inspect Root:   https://search.google.com/search-console/inspect?resource_id=https%3A%2F%2F${encodeURIComponent(HOST)}%2F&id=https%3A%2F%2F${encodeURIComponent(HOST)}%2F`);
  console.log('\n • Microsoft Bing Webmaster Tools:');
  console.log('   Dashboard:      https://www.bing.com/webmasters');
  console.log('   Submit Sitemap: https://www.bing.com/webmasters/sitemaps');
  console.log('\n • Yandex Webmaster:');
  console.log('   Submit Sitemap: https://webmaster.yandex.com/site/indexing/sitemap/');
  console.log('='.repeat(60));
}

submitToIndexNow();
