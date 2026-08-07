async function test() {
  const res = await fetch('https://finance-ai-website.onrender.com/api/cms');
  const data = await res.json();
  console.log(JSON.stringify(data.navbar, null, 2));
}
test();
