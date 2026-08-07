import RSSParser from 'rss-parser';

async function test() {
  const parser = new RSSParser({
    customFields: {
      item: ['source']
    }
  });
  const feed = await parser.parseURL('https://news.google.com/rss/search?q=Nifty&hl=en-IN&gl=IN&ceid=IN:en');
  console.log('First item keys:', Object.keys(feed.items[0]));
  console.log('First item source:', feed.items[0].source);
  console.log('First item link:', feed.items[0].link);
  console.log('First item guid:', feed.items[0].guid);
}
test();
