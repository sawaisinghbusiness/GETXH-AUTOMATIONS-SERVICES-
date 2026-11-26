const articles = document.getElementById('articles');
const element = (tag,text) => {
  const item = document.createElement(tag);
  item.textContent = text;
  return item;
};
async function showArticles() {
  const id = new URLSearchParams(location.search).get('id');
  document.getElementById('back').hidden = !id;
  try {
    const res = await fetch('https://backend-for-getxh-automation.onrender.com/api/blog' + (id ? '?id='+encodeURIComponent(id) : ''));
    if (!res.ok) throw Error(res.status===404 && id ? 'Article not found.' : 'Articles could not be loaded.');
    const data = await res.json();
    articles.replaceChildren();
    const date = value => new Date(value).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
    if(id) {
      document.title = data.title+' | GetXH Automation';
      document.getElementById('journalTitle').textContent = data.title;
      const body = element('div',data.body);
      body.className = 'article-text';
      articles.append(element('time',date(data.published_at)),body);
      return;
    }
    if (!data.length) articles.textContent = 'No articles published yet.';
    for(const post of data) {
      const row = document.createElement('article');
      const heading = document.createElement('h2');
      const link = element('a',post.title);
      link.href = 'blog.html?id='+encodeURIComponent(post.id);
      heading.append(link);
      row.append(element('time',date(post.published_at)),heading,element('p',post.excerpt));
      articles.append(row);
    }
  } catch(error) { articles.textContent = error.message; }
}
showArticles();
