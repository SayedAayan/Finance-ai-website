async function test() {
  const res = await fetch('https://finance-ai-website.onrender.com/api/news');
  const data = await res.json();
  console.log('Fetched articles:', data.articles.length);
  const first = data.articles[0];
  console.log('First title:', first.title);
  console.log('First link:', first.link);
  console.log('First source:', first.source);
}
test();
