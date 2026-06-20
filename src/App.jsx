import React, { useState, useEffect } from 'react';
import { getMenu } from './menuData';
import { 
  calculateWeekCycle, 
  formatDateInput, 
  formatDateDisplay, 
  getDaysOfWeekDates, 
  DAYS_OF_WEEK, 
  WEEKS 
} from './utils';
import MealCard from './components/MealCard';
import SettingsModal from './components/SettingsModal';
import MealEditModal from './components/MealEditModal';
import SearchPanel from './components/SearchPanel';

const DEFAULT_ANCHOR_DATE = '2026-06-01'; // A Monday
const DEFAULT_ANCHOR_WEEK = 'A';

export default function App() {
  // --- Persistent State from localStorage ---
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('messMenuTheme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [anchorDate, setAnchorDate] = useState(() => {
    const saved = localStorage.getItem('messMenuAnchorDate');
    if (saved && /^\d{4}-\d{2}-\d{2}$/.test(saved)) {
      return saved;
    }
    return DEFAULT_ANCHOR_DATE;
  });

  const [anchorWeek, setAnchorWeek] = useState(() => {
    return localStorage.getItem('messMenuAnchorWeek') || DEFAULT_ANCHOR_WEEK;
  });

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('messMenuFavorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [menuOverrides, setMenuOverrides] = useState(() => {
    const saved = localStorage.getItem('messMenuOverrides');
    return saved ? JSON.parse(saved) : {};
  });

  // --- UI State ---
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [activeCuisine, setActiveCuisine] = useState('North Indian');
  const [activeMessType, setActiveMessType] = useState('Veg');
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [activeEditMeal, setActiveEditMeal] = useState(null); // { mealName, week, day, cuisine, messType, currentItems }
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // --- Manual Override State ---
  // If the user manually changes the day or week, we track the override.
  const [manualWeek, setManualWeek] = useState(null);
  const [manualDay, setManualDay] = useState(null);

  // --- Synchronize Menu Overrides ---
  useEffect(() => {
    localStorage.setItem('messMenuOverrides', JSON.stringify(menuOverrides));
  }, [menuOverrides]);

  // --- Apply Theme Class ---
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('messMenuTheme', theme);
  }, [theme]);

  // --- Synchronize Favorites ---
  useEffect(() => {
    localStorage.setItem('messMenuFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // --- Date Math Calculation ---
  const { week: computedWeek, dayName: computedDayName } = calculateWeekCycle(selectedDate, anchorDate, anchorWeek);

  // Current active week and day values (either overridden or computed from date)
  const currentWeek = manualWeek || computedWeek;
  const currentDay = manualDay || computedDayName;

  // Has the user overridden the default calendar calculations?
  const isOverridden = manualWeek !== null || manualDay !== null;

  // --- Handlers ---
  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
      // Clear manual overrides when date is explicitly changed
      setManualWeek(null);
      setManualDay(null);
    }
  };

  const handleToggleFavorite = (dishName) => {
    setFavorites(prev => {
      if (prev.includes(dishName)) {
        return prev.filter(f => f !== dishName);
      } else {
        return [...prev, dishName];
      }
    });
  };

  const handleSelectSearchResult = (week, day, cuisine, messType) => {
    setManualWeek(week);
    setManualDay(day);
    setActiveCuisine(cuisine);
    setActiveMessType(messType);
    setIsSearchOpen(false); // Close mobile drawer overlay
  };

  const handleSaveCalibration = (newDate, newWeek) => {
    setAnchorDate(newDate);
    setAnchorWeek(newWeek);
    localStorage.setItem('messMenuAnchorDate', newDate);
    localStorage.setItem('messMenuAnchorWeek', newWeek);
    // Clear temporary overrides so we instantly see computed week based on new calibration
    setManualWeek(null);
    setManualDay(null);
  };

  const handleRevertCalibration = () => {
    setAnchorDate(DEFAULT_ANCHOR_DATE);
    setAnchorWeek(DEFAULT_ANCHOR_WEEK);
    localStorage.removeItem('messMenuAnchorDate');
    localStorage.removeItem('messMenuAnchorWeek');
    setManualWeek(null);
    setManualDay(null);
  };

  const handleResetOverrides = () => {
    setManualWeek(null);
    setManualDay(null);
  };

  const getMenuWithOverrides = (week, day, cuisine, messType) => {
    const baseMenu = getMenu(week, day, cuisine, messType);
    if (!baseMenu) return null;
    
    const finalMenu = {};
    for (const [mealName, items] of Object.entries(baseMenu)) {
      const key = `${week}-${day}-${cuisine}-${messType}-${mealName}`;
      if (menuOverrides[key]) {
        finalMenu[mealName] = menuOverrides[key];
      } else {
        finalMenu[mealName] = items;
      }
    }
    return finalMenu;
  };

  const searchMealsWithOverrides = (query) => {
    if (!query || query.trim() === '') return [];
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];

    for (const week of WEEKS) {
      for (const day of DAYS_OF_WEEK) {
        for (const cuisine of ['North Indian', 'South Indian', 'Unified']) {
          for (const messType of ['Veg', 'Non-Veg']) {
            const menu = getMenuWithOverrides(week, day, cuisine, messType);
            if (!menu) continue;

            for (const [mealName, items] of Object.entries(menu)) {
              if (!items || !Array.isArray(items)) continue;
              
              const matchingItem = items.find(item => item.toLowerCase().includes(normalizedQuery));
              if (matchingItem) {
                results.push({
                  week,
                  day,
                  cuisine,
                  messType,
                  mealName,
                  matchingItem,
                  items
                });
              }
            }
          }
        }
      }
    }

    const seen = new Set();
    const deduped = [];
    for (const item of results) {
      const key = `${item.week}-${item.day}-${item.cuisine}-${item.mealName}-${item.matchingItem}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(item);
      }
    }
    return deduped;
  };

  // Get active menu list
  const menu = getMenuWithOverrides(currentWeek, currentDay, activeCuisine, activeMessType);

  // Get dates of the currently selected week (to display days tab)
  const weekDates = getDaysOfWeekDates(selectedDate);

  return (
    <div className="app-container">
      {/* Background ambient blobs */}
      <div className="glow-container">
        <div className="glow-blob glow-blob-1"></div>
        <div className="glow-blob glow-blob-2"></div>
        <div className="glow-blob glow-blob-3"></div>
      </div>

      {/* Main Header */}
      <header className="app-header glass-panel">
        <div className="logo-area">
          <span className="logo-icon">🍽️</span>
          <h1 className="logo-title">VibeMess</h1>
        </div>

        <div className="header-actions">
          {/* Calendar Picker */}
          <div className="input-date-wrapper">
            <input 
              type="date" 
              className="input-date"
              value={formatDateInput(selectedDate)}
              onChange={handleDateChange}
              aria-label="Select Date"
            />
          </div>

          {/* Settings Button */}
          <button 
            className="btn" 
            onClick={() => setIsConfigModalOpen(true)}
            title="App Settings & Calibration"
          >
            ⚙️ Settings
          </button>

          {/* Theme Toggle */}
          <button 
            className="btn btn-icon" 
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Display Grid */}
      <main className="main-layout">
        {/* Mobile Search Overlay Backdrop */}
        <div className={`drawer-backdrop ${isSearchOpen ? 'open' : ''}`} onClick={() => setIsSearchOpen(false)} />

        {/* Left Side: Filter and Menu Display */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="filters-panel glass-panel">
            <div className="filters-row">
              {/* Cuisine Filter */}
              <div className="filter-group">
                <span className="filter-label">Cuisine</span>
                <div className="segmented-tabs">
                  <button 
                    className={`tab-item ${activeCuisine === 'North Indian' ? 'active' : ''}`}
                    onClick={() => setActiveCuisine('North Indian')}
                  >
                    North Indian
                  </button>
                  <button 
                    className={`tab-item ${activeCuisine === 'South Indian' ? 'active' : ''}`}
                    onClick={() => setActiveCuisine('South Indian')}
                  >
                    South Indian
                  </button>
                  <button 
                    className={`tab-item ${activeCuisine === 'Unified' ? 'active' : ''}`}
                    onClick={() => setActiveCuisine('Unified')}
                  >
                    Unified
                  </button>
                </div>
              </div>

              {/* Mess Type Filter */}
              <div className="filter-group">
                <span className="filter-label">Mess Type</span>
                <div className="segmented-tabs">
                  <button 
                    className={`tab-item ${activeMessType === 'Veg' ? 'active' : ''}`}
                    onClick={() => setActiveMessType('Veg')}
                  >
                    Veg Only
                  </button>
                  <button 
                    className={`tab-item ${activeMessType === 'Non-Veg' ? 'active' : ''}`}
                    onClick={() => setActiveMessType('Non-Veg')}
                  >
                    Non-Veg
                  </button>
                </div>
              </div>
            </div>

            {/* Week Selector Override Tabs */}
            <div className="filter-group" style={{ marginTop: '0.75rem' }}>
              <span className="filter-label">Rotation Cycle</span>
              <div className="segmented-tabs">
                {WEEKS.map(wk => (
                  <button 
                    key={wk}
                    className={`tab-item ${currentWeek === wk ? 'active' : ''}`}
                    onClick={() => setManualWeek(wk)}
                  >
                    Week {wk}
                  </button>
                ))}
              </div>
            </div>

            {/* Day Selector Tabs */}
            <div className="week-days-bar">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const dateObj = weekDates[idx];
                const isSelected = currentDay === dayName;
                const isToday = new Date().toDateString() === dateObj.toDateString();
                
                return (
                  <button
                    key={dayName}
                    className={`day-tab-btn ${isSelected ? 'active' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => setManualDay(dayName)}
                  >
                    <span className="day-short">{dayName.substring(0, 3)}</span>
                    <span className="day-num">{dateObj.getDate()}</span>
                    {isSelected && <div className="active-indicator-bar" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Override Indicator Notice */}
          {isOverridden && (
            <div className="info-bar glass-panel">
              <span>
                ⚠️ Currently viewing customized week/day cycle. Selected date is <strong>{formatDateDisplay(selectedDate)}</strong> (Week {computedWeek}, {computedDayName}).
              </span>
              <button className="revert-badge" onClick={handleResetOverrides}>
                Revert to Date
              </button>
            </div>
          )}

          {/* Active Menu Cards Grid */}
          <div className="meals-grid">
            {menu ? (
              Object.entries(menu).map(([mealName, mealData]) => (
                <MealCard 
                  key={mealName}
                  mealName={mealName}
                  mealData={mealData}
                  isFavorite={mealData && mealData.length > 0 && favorites.includes(mealData[0])}
                  onToggleFavorite={handleToggleFavorite}
                  onEditMeal={(name) => {
                    setActiveEditMeal({
                      mealName: name,
                      week: currentWeek,
                      day: currentDay,
                      cuisine: activeCuisine,
                      messType: activeMessType,
                      currentItems: mealData
                    });
                  }}
                />
              ))
            ) : (
              <div className="empty-state glass-panel">No menu details found for this combination.</div>
            )}
          </div>
        </section>

        {/* Right Side: Search and Favorites Panel */}
        <aside className={`search-aside ${isSearchOpen ? 'open' : ''}`}>
          <SearchPanel 
            onSelectResult={handleSelectSearchResult}
            favorites={favorites}
            onRemoveFavorite={(name) => setFavorites(prev => prev.filter(f => f !== name))}
            searchMeals={searchMealsWithOverrides}
            onCloseDrawer={() => setIsSearchOpen(false)}
          />
        </aside>

        {/* Floating Action Button for mobile search */}
        <button 
          className="fab-search"
          onClick={() => setIsSearchOpen(true)}
          title="Search & Starred Dishes"
          aria-label="Open search and favorites"
        >
          🔍
        </button>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        currentAnchorDate={anchorDate}
        currentAnchorWeek={anchorWeek}
        onSaveCalibration={handleSaveCalibration}
        onRevertCalibration={handleRevertCalibration}
        overrides={menuOverrides}
        onClearOverrides={() => setMenuOverrides({})}
        onImportOverrides={(imported) => setMenuOverrides(imported)}
      />

      {/* Meal Edit Modal */}
      {activeEditMeal && (
        <MealEditModal 
          isOpen={!!activeEditMeal}
          onClose={() => setActiveEditMeal(null)}
          week={activeEditMeal.week}
          day={activeEditMeal.day}
          cuisine={activeEditMeal.cuisine}
          messType={activeEditMeal.messType}
          mealName={activeEditMeal.mealName}
          currentItems={activeEditMeal.currentItems}
          onSave={(updatedItems) => {
            const key = `${activeEditMeal.week}-${activeEditMeal.day}-${activeEditMeal.cuisine}-${activeEditMeal.messType}-${activeEditMeal.mealName}`;
            setMenuOverrides(prev => ({
              ...prev,
              [key]: updatedItems
            }));
          }}
          onReset={() => {
            const key = `${activeEditMeal.week}-${activeEditMeal.day}-${activeEditMeal.cuisine}-${activeEditMeal.messType}-${activeEditMeal.mealName}`;
            setMenuOverrides(prev => {
              const copy = { ...prev };
              delete copy[key];
              return copy;
            });
          }}
        />
      )}
    </div>
  );
}
