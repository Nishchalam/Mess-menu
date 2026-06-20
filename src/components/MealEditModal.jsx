import React, { useState, useEffect } from 'react';

export default function MealEditModal({ isOpen, onClose, week, day, cuisine, messType, mealName, currentItems, onSave, onReset }) {
  if (!isOpen) return null;

  // Join items with a newline so each item is on a new line
  const [textVal, setTextVal] = useState('');

  useEffect(() => {
    if (currentItems) {
      setTextVal(currentItems.join('\n'));
    } else {
      setTextVal('');
    }
  }, [currentItems, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Split by newline and filter out empty entries
    const items = textVal
      .split('\n')
      .map(item => item.trim())
      .filter(item => item !== '');
    onSave(items);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="edit-modal-title">
      <div className="modal-content glass-panel" style={{ maxInlineSize: '550px' }}>
        <div className="modal-header">
          <h2 id="edit-modal-title" className="modal-title">Edit Menu - {mealName}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span><strong>Cuisine:</strong> {cuisine} ({messType})</span>
            <span><strong>Cycle:</strong> Week {week}, {day}</span>
          </div>

          <div className="form-group">
            <label htmlFor="meal-items-input" className="form-label">Menu Items (One per line)</label>
            <textarea 
              id="meal-items-input"
              className="textarea-input"
              value={textVal}
              onChange={(e) => setTextVal(e.target.value)}
              placeholder="Enter dishes here (e.g. Dosa, Sambhar, Chutney)..."
              required
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
              💡 Enter each dish on a separate line. Empty lines will be cleaned up automatically.
            </span>
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn" 
              onClick={() => {
                onReset();
                onClose();
              }}
              style={{ marginRight: 'auto', borderColor: '#ef4444', color: '#ef4444' }}
              title="Revert this specific meal card back to default parsed PDF menu"
            >
              Reset to Default
            </button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
