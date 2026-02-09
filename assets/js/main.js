
// ============================================
// ARABIC TOOLTIPS
// ============================================

const tooltip = document.getElementById('tooltip-ar');

document.querySelectorAll('.term[data-ar]').forEach(term => {
    term.addEventListener('mouseenter', (e) => {
        tooltip.textContent = e.target.dataset.ar;
        tooltip.classList.add('visible');
        
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 10) + 'px';
    });
    
    term.addEventListener('mouseleave', () => {
        tooltip.classList.remove('visible');
    });
});

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

const searchBtn = document.getElementById('search-btn');
const searchModal = document.getElementById('search-modal');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// searchIndex is loaded from search_data.js
if (typeof searchIndex === 'undefined') {
    console.warn('Search index not loaded');
    var searchIndex = [];
}

searchBtn?.addEventListener('click', () => {
    searchModal.classList.remove('hidden');
    searchInput.focus();
});

searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) {
        searchModal.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        searchModal?.classList.add('hidden');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchModal?.classList.remove('hidden');
        searchInput?.focus();
    }
});

searchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    const results = searchIndex.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query)
    ).slice(0, 10);
    
    searchResults.innerHTML = results.map(r => `
        <a href="${SITE_ROOT}${r.url}" class="search-result">
            <h4>${r.title}</h4>
            <p>${r.module || ''}</p>
        </a>
    `).join('');
});

// ============================================
// GLOSSARY FILTERS
// ============================================

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        document.querySelectorAll('.term-card').forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
