async function patchLiveCms() {
  const url = 'https://finance-ai-website.onrender.com/api/cms';
  
  // 1. Fetch live config
  const res = await fetch(url);
  const data = await res.json();
  
  if (!data.navbar) {
    console.log("No navbar in live config, nothing to patch!");
    return;
  }
  
  // 2. Find "Others" menu
  const othersMenu = data.navbar.navItems.find(item => item.id === '5');
  if (othersMenu) {
    const hasStrategy = othersMenu.subItems.some(i => i.id === '5-5');
    if (!hasStrategy) {
      othersMenu.subItems.push({
        id: '5-5',
        label: 'Investors Strategy',
        path: '/investors-strategy'
      });
      
      // 3. Post back to live server
      const postRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const postData = await postRes.json();
      console.log("Patched successfully:", postData);
    } else {
      console.log("Strategy already exists in live config.");
    }
  }
}
patchLiveCms();
