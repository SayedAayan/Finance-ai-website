async function test() {
  const url = 'https://news.google.com/rss/articles/CBMi0wFBVV95cUxQQ2dhV2pyakZOMmJYTGwza05fV0FyTzVwb1lpdGFxREVKRUpqbTc3VGdXRW9uMmFqMmpwWExOZTlQUDJ5T01ZRjN6bWVyYzNxTWhaRlhRRFY5bVFVNUtBcjV0WFhuRzlYdTFSUffvcEVUZVZVZFBYUhTV1p1b0VFaGcxYm5GbmhKRFNHSnNUek5zU0Y1NFZ6TlNRMFJyd1VjeWJWYlU3cEROMlpYVUdzNGN6ZGtUa1ZNTVVKTllraFNXV3BhdDIxUU1ncHBhVWM1MFRkYVQwaDFObUZUVldsYVRoUVdoZDNMR2R1eTAxUjBnSFdBVUZWWDMxRTE1RmNUVkhWM0ZNYm5oWVQybExMV3BXVEVkRk4xSlpSbkYwUkUxcE5XRmhWV1Y0YUZyb2NIZEtUa05qYUcxTlhSb2VUcXljWHA0WkRBMFVtdFNTM0JMUlV0a2QxMW1Na1ZQVDFGallsaHBOalF4V25VemRHazVXVTVJTkZaa2NGaGZkM2hSZFhoUlZnMWNXcHFlUzF5VVU5RlUxQXRNRTlXWjFkQ1kzMVFNYnhaeTFKT1doMGFYSXpaMHBOTjAxMDBHeFRpMHhiVFJvVDJnMlJUSTFVMWczTFU1UWQxUk5ORUszUlhWTWNXXzU2TlVWVFVGRjJWakV3ZFVSS1lXcENVVVIxVTNGQ1d2b3lPREZpYjBFJTNGb2M?oc=5';
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    });
    console.log('Status:', res.status);
    console.log('Final URL:', res.url);
    const text = await res.text();
    console.log('Body length:', text.length);
  } catch(e) {
    console.error(e.message);
  }
}
test();
