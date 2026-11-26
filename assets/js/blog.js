function coverImage(post) {
  if (!post.cover || !/^https:\/\//i.test(post.cover)) return null;
  const img=document.createElement('img');
  img.src=post.cover;img.alt='';img.loading='lazy';img.className='journal-cover';
  img.addEventListener('error',()=>img.remove(),{once:true});
  return img;
}
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
      document.getElementById('allPosts').hidden=true; const body=articleBody(data.body);
      body.className = 'article-text';
      const image=coverImage(data); if(image) articles.append(image);
      articles.append(element('time',[data.category,date(data.published_at)].filter(Boolean).join(' · ')),body);
      return;
    }
    if (!data.length) articles.textContent = 'No articles published yet.';
    if (!data.length) return;
    const label=element('label','Search articles');
    const search=document.createElement('input');
    search.type='search';label.append(search);articles.append(label);
    const results=document.createElement('div');results.className='blog-grid';articles.append(results);
    function render(){
    results.replaceChildren();
    const query=search.value.toLowerCase().trim();
    for(const post of data.filter(p=>[p.title,p.category,p.excerpt].join(' ').toLowerCase().includes(query))) {
      const row = document.createElement('article');
      row.className='blog-card'; const heading = document.createElement('h2');
      const link = element('a',post.title);
      link.href = '/blog/?id='+encodeURIComponent(post.id);
      heading.append(link);
      const img=coverImage(post); if(img)row.append(img);
      row.append(element('time',[post.category,date(post.published_at)].filter(Boolean).join(' · ')),heading,element('p',post.excerpt));
      results.append(row);
    }
    if(!results.children.length) results.textContent='No matching articles.';
    } search.oninput=render;render();
  } catch(error) { articles.textContent = error.message; }
}
showArticles();
