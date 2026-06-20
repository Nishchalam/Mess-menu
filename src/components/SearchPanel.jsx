import React, { useState } from 'react';

export default function SearchPanel({ onSelectResult, favorites, onRemoveFavorite, searchMeals, onCloseDrawer }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2 && searchMeals) {
      const found = searchMeals(val);
      setResults(found);
    } else {
      setResults([]);
    }
  };

  const handleResultClick = (res) => {
    onSelectResult(res.week, res.day, res.cuisine, res.messType);
  };

  return (
    <div className="search-drawer glass-panel">
      <div className="search-header">
        <h3 className="search-title">Explore & Search</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {query && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{results.length} found</span>}
          {onCloseDrawer && (
            <button 
              className="search-close-btn" 
              onClick={onCloseDrawer}
              title="Close panel"
              aria-label="Close search panel"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      <div className="search-input-wrapper">
        <input 
          type="text" 
          placeholder="Search for Paneer, Chicken, Dosa..." 
          className="search-input"
          value={query}
          onChange={handleSearchChange}
          aria-label="Search meals"
        />
      </div>

      {query.trim().length >= 2 ? (
        <div className="search-results-list" aria-label="Search results">
          {results.length > 0 ? (
            results.map((res, idx) => {
              const otherItems = res.items.filter(it => it !== res.matchingItem);
              const parentContext = otherItems.length > 0 ? otherItems.slice(0, 3).join(', ') : '';
              
              return (
                <div 
                  key={idx} 
                  className="search-result-item" 
                  onClick={() => handleResultClick(res)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleResultClick(res)}
                >
                  <div className="result-main-info">
                    <span className="result-dish-name">{res.matchingItem}</span>
                    <span className="result-meta">
                      {parentContext ? `Served with: ${parentContext} • ` : ''}
                      Week {res.week} • {res.day} • {res.mealName}
                    </span>
                  </div>
                  <span className="result-tag-pill">
                    {res.cuisine.split(' ')[0]}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="empty-state">No matching meals found. Try another query.</div>
          )}
        </div>
      ) : (
        query.trim().length > 0 && <div className="empty-state" style={{ padding: '0.5rem' }}>Type at least 2 characters...</div>
      )}

      {/* Favorites Section */}
      <div className="favorites-section">
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
          ⭐️ Starred Dishes ({favorites.length})
        </h4>
        {favorites.length > 0 ? (
          <div className="fav-tags-list">
            {favorites.map((fav, idx) => (
              <div 
                key={idx} 
                className="fav-chip" 
                onClick={() => {
                  setQuery(fav);
                  if (searchMeals) setResults(searchMeals(fav));
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setQuery(fav)}
                title="Click to search this dish"
              >
                <span>{fav}</span>
                <button 
                  className="fav-chip-remove" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(fav);
                  }}
                  aria-label={`Remove ${fav} from favorites`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-sm)' }}>
            No favorites added yet. Click the heart icon on any meal card to star it!
          </div>
        )}
      </div>
    </div>
  );
}
