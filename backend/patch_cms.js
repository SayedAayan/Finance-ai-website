async function patchLiveCms() {
  const url = 'https://finance-ai-website.onrender.com/api/cms';
  
  // 1. Fetch live config
  const res = await fetch(url);
  let data = await res.json();
  
  if (!data.navbar) {
    console.log("No navbar in live config, creating it!");
    data.navbar = {};
  }
  
  // 2. Overwrite navItems with the new intended structure
  data.navbar.navItems = [
    { id: '1', label: 'Home', path: '/' },
    { id: '4', label: 'Pro Playbook', path: '/investors-strategy' },
    { id: '2', label: 'Compare', path: '/compare' },
    { id: '3', label: 'Watchlist', path: '/watchlist' },
    { id: '5', label: 'Others ▾', subItems: [
      { id: '5-6', label: 'News', path: '/news' },
      { id: '5-3', label: 'Stock Profile', path: '/stock' },
      { id: '5-4', label: 'Fund Profile', path: '/fund' },
      { id: '5-1', label: 'Markets Overview', path: '/markets' }
    ]}
  ];
  
  // 3. Post back to live server
  const postRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  const postData = await postRes.json();
  console.log("Patched successfully:", postData);
}
patchLiveCms();
