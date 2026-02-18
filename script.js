// Basic interactions: category filter, search, theme toggle, nav toggle
document.addEventListener('DOMContentLoaded',()=>{
  const cats = document.querySelectorAll('.categories a');
  const cards = Array.from(document.querySelectorAll('.card'));
  const searchInput = document.getElementById('searchInput');
  const themeToggle = document.getElementById('themeToggle');
  const navToggle = document.querySelector('.nav-toggle');

  function filterBy(cat, query){
    cards.forEach(card=>{
      const c = card.dataset.category || '';
      const title = (card.querySelector('.card-title')||{textContent:''}).textContent.toLowerCase();
      const excerpt = (card.querySelector('.excerpt')||{textContent:''}).textContent.toLowerCase();
      const matchesCat = (cat==='all') || (c===cat);
      const matchesQuery = !query || title.includes(query) || excerpt.includes(query);
      if(matchesCat && matchesQuery) card.style.display = '';
      else card.style.display = 'none';
    })
  }

  cats.forEach(a=>{
    a.addEventListener('click',e=>{
      e.preventDefault();
      cats.forEach(x=>x.classList.remove('active'));
      a.classList.add('active');
      const cat = a.dataset.cat||'all';
      filterBy(cat, (searchInput.value||'').toLowerCase());
    })
  })

  document.getElementById('searchBtn').addEventListener('click',()=>{
    const q = (searchInput.value||'').toLowerCase();
    const active = document.querySelector('.categories a.active')?.dataset.cat || 'all';
    filterBy(active, q);
  })

  searchInput.addEventListener('keyup',(e)=>{
    if(e.key === 'Enter') document.getElementById('searchBtn').click();
    else filterBy(document.querySelector('.categories a.active')?.dataset.cat || 'all', (searchInput.value||'').toLowerCase());
  })

  themeToggle.addEventListener('click',()=>{
    document.body.classList.toggle('light');
  })

  if(navToggle){
    navToggle.addEventListener('click',()=>{
      const catList = document.querySelector('.categories');
      if(catList.style.display === 'flex') catList.style.display = '';
      else catList.style.display = 'flex';
    })
  }

  // Initial layout adjustments
  filterBy('all','');
})
