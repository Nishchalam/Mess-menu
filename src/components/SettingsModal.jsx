import React, { useState } from 'react';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentAnchorDate, 
  currentAnchorWeek, 
  onSaveCalibration, 
  onRevertCalibration,
}) {
  if (!isOpen) return null;

  const [dateVal, setDateVal] = useState(currentAnchorDate);
  const [weekVal, setWeekVal] = useState(currentAnchorWeek);

  const handleCalibrationSubmit = (e) => {
    e.preventDefault();
    onSaveCalibration(dateVal, weekVal);
    onClose();
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content glass-panel" style={{ maxInlineSize: '480px' }}>
        <div className="modal-header">
          <h2 id="settings-title" className="modal-title">⚙️ App Settings</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">×</button>
        </div>

        <form onSubmit={handleCalibrationSubmit} className="modal-body">
          <p className="text-pretty" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', marginBottom: '1.25rem' }}>
            Adjust the rotation anchor so the calendar dates match your campus's current mess cycle week.
          </p>
          
          <div className="form-group">
            <label htmlFor="ref-anchor-date" className="form-label">Reference Anchor Date</label>
            <input 
              type="date" 
              id="ref-anchor-date"
              className="input-date" 
              value={dateVal} 
              onChange={(e) => setDateVal(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="ref-assigned-week" className="form-label">Assigned Cycle Week</label>
            <select 
              id="ref-assigned-week"
              className="select-input" 
              value={weekVal} 
              onChange={(e) => setWeekVal(e.target.value)}
              required
            >
              <option value="A">Week A</option>
              <option value="B">Week B</option>
              <option value="C">Week C</option>
              <option value="D">Week D</option>
            </select>
          </div>
          
          <div className="modal-footer" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn" 
              onClick={() => { onRevertCalibration(); onClose(); }}
              style={{ marginRight: 'auto', borderColor: '#ef4444', color: '#ef4444' }}
            >
              Reset Calibration
            </button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Calibration</button>
          </div>
        </form>
      </div>
    </div>
  );
}
