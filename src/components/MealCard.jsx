import React from 'react';

const MEAL_ICONS = {
  Breakfast: '☀️',
  Lunch: '🍲',
  Snacks: '☕',
  Dinner: '🌙'
};

const MEAL_TIMES = {
  Breakfast: '7:30 AM - 9:30 AM',
  Lunch: '12:00 PM - 2:00 PM',
  Snacks: '4:30 PM - 5:45 PM',
  Dinner: '7:30 PM - 9:30 PM'
};

export default function MealCard({ mealName, mealData, isFavorite, onToggleFavorite, onEditMeal }) {
  const icon = MEAL_ICONS[mealName] || '🍽️';
  const time = MEAL_TIMES[mealName] || '';

  if (!mealData || mealData.length === 0) {
    return (
      <div className={`meal-card ${mealName}`}>
        <div className="meal-header">
          <div className="meal-title-group">
            <span className="meal-time">{time}</span>
            <h3 className="meal-name">
              <span style={{ marginRight: '0.4rem' }}>{icon}</span>
              {mealName}
            </h3>
          </div>
          <button 
            className="edit-btn"
            onClick={() => onEditMeal(mealName)}
            title={`Edit ${mealName} menu`}
            aria-label={`Edit ${mealName} menu`}
          >
            ✏️
          </button>
        </div>
        <div className="meal-body">
          <div className="empty-state" style={{ padding: '1rem 0' }}>Mess Closed</div>
        </div>
      </div>
    );
  }

  const mealId = mealData[0];

  return (
    <div className={`meal-card ${mealName}`}>
      <div className="meal-header">
        <div className="meal-title-group">
          <span className="meal-time">{time}</span>
          <h3 className="meal-name">
            <span style={{ marginRight: '0.4rem' }}>{icon}</span>
            {mealName}
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button 
            className="edit-btn"
            onClick={() => onEditMeal(mealName)}
            title={`Edit ${mealName} menu`}
            aria-label={`Edit ${mealName} menu`}
          >
            ✏️
          </button>
          <button 
            className={`fav-btn ${isFavorite ? 'is-fav' : ''}`}
            onClick={() => onToggleFavorite(mealId)}
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      <div className="meal-body" style={{ marginTop: '0.5rem' }}>
        <ul className="sides-list" aria-label={`Menu for ${mealName}`}>
          {mealData.map((item, idx) => (
            <li key={idx} className="text-pretty">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
