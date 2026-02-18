// Client-side markdown SPA: load posts.json, render feed and post view, support hash routing
document.addEventListener('DOMContentLoaded', async ()=>{
  const postsUrl = 'posts.json';
  const feedEl = document.getElementById('feed');
  const articlesEl = document.querySelector('.articles');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const themeToggle = document.getElementById('themeToggle');
  const navToggle = document.querySelector('.nav-toggle');
  const categoriesNav = document.querySelector('.categories');

  let posts = [];

  try{
    const res = await fetch(postsUrl);
    posts = await res.json();
  }catch(e){
    console.error('Failed to load posts.json',e);
    posts = [];
  }

  function makeCard(post){
    const a = document.createElement('article');
    a.className = 'card';
    a.dataset.category = post.category;
    a.innerHTML = `\
      <div class="card-media" style="background-image:url('${post.image || ''}')"></div>\
      <div class="card-body">\
        <div class="ribbon">${post.category}</div>\
        <div class="meta">${post.category} • ${post.date}</div>\
        <h2 class="card-title">${post.title}</h2>\
        <p class="excerpt">${post.excerpt || ''}</p>\
        <a class="read-more" href="#/post/${encodeURIComponent(post.path)}">קרא עוד</a>\
      </div>\
    `;
    return a;
  }

  function renderFeed(list){
    articlesEl.innerHTML = '';
    if(list.length===0){
      articlesEl.innerHTML = '<div class="widget">לא נמצאו פוסטים.</div>';
      return;
    }
    list.forEach(p=>articlesEl.appendChild(makeCard(p)));
  }

  function filterPosts(cat, query){
    let res = posts.slice();
    if(cat && cat !== 'all') res = res.filter(p=>p.category === cat);
    if(query) res = res.filter(p=> (p.title + ' ' + (p.excerpt||'') + ' ' + (p.tags||'')).toLowerCase().includes(query.toLowerCase()));
    return res;
  }

  function setActiveCategory(cat){
    categoriesNav.querySelectorAll('a').forEach(a=>a.classList.toggle('active', a.dataset.cat===cat));
  }

  // wire categories
  categoriesNav.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click', e=>{
      e.preventDefault();
      const cat = a.dataset.cat || 'all';
      setActiveCategory(cat);
      const filtered = filterPosts(cat, searchInput.value||'');
      renderFeed(filtered);
      location.hash = '#/';
    })
  });

  searchBtn.addEventListener('click', ()=>{
    const q = searchInput.value||'';
    const currentCat = document.querySelector('.categories a.active')?.dataset.cat || 'all';
    renderFeed(filterPosts(currentCat, q));
  });

  searchInput.addEventListener('input', ()=>{
    const q = searchInput.value||'';
    const currentCat = document.querySelector('.categories a.active')?.dataset.cat || 'all';
    renderFeed(filterPosts(currentCat, q));
  });

  themeToggle.addEventListener('click', ()=>document.body.classList.toggle('light'));

  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const catList = document.querySelector('.categories');
      catList.style.display = catList.style.display === 'flex' ? '' : 'flex';
    })
  }

  // Routing: hash-based
  async function showPostFromHash(){
    const hash = location.hash || '#/';
    if(hash.startsWith('#/post/')){
      const encoded = hash.replace('#/post/','');
      const path = decodeURIComponent(encoded);
      await openPost(path);
    }else{
      // show feed
      document.querySelector('main').style.display = '';
      const articlePage = document.querySelector('.article-page');
      if(articlePage) articlePage.remove();
      window.scrollTo({top:0,behavior:'smooth'});
    }
  }

  async function openPost(path){
    try{
      const res = await fetch(path);
      if(!res.ok) throw new Error('Not found');
      const md = await res.text();
      renderMarkdownPage(md, path);
    }catch(e){
      console.error('Failed to load post',e);
      alert('אין אפשרות לטעון את הפוסט');
      location.hash = '#/';
    }
  }

  function renderMarkdownPage(md, path){
    // convert markdown to HTML
    const html = marked.parse(md);
    // create article page
    const articleDiv = document.createElement('div');
    articleDiv.className = 'article-page';
    articleDiv.innerHTML = `\
      <a href="#/" class="btn ghost back-btn">← חזור</a>\
      <div class="content">${html}</div>\
    `;
    // hide feed main
    document.querySelector('main').style.display = 'none';
    document.body.appendChild(articleDiv);
    // highlight code
    articleDiv.querySelectorAll('pre code').forEach((el)=>{hljs.highlightElement(el)});
    window.scrollTo({top:0,behavior:'instant'});
  }

  // initial render of feed
  renderFeed(posts);

  // handle initial hash
  showPostFromHash();
  window.addEventListener('hashchange', showPostFromHash);

});
