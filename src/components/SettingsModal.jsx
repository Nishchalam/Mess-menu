import React, { useState } from 'react';
import { formatDateInput } from '../utils';

export default function SettingsModal({ 
  isOpen, 
  onClose, 
  currentAnchorDate, 
  currentAnchorWeek, 
  onSaveCalibration, 
  onRevertCalibration,
  overrides,
  onClearOverrides,
  onImportOverrides
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('calibrate'); // 'calibrate' | 'database'
  const [dateVal, setDateVal] = useState(currentAnchorDate);
  const [weekVal, setWeekVal] = useState(currentAnchorWeek);
  const [importError, setImportError] = useState('');

  const numOverrides = Object.keys(overrides || {}).length;

  const handleCalibrationSubmit = (e) => {
    e.preventDefault();
    onSaveCalibration(dateVal, weekVal);
    onClose();
  };

  // Export Custom Database Overrides as a JSON file download
  const handleExportDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(overrides, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "vibemess_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Custom Database Overrides from uploaded JSON file with format validation
  const handleImportDatabase = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        // Validate backup file format
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error("Backup file must be a JSON object.");
        }

        // Schema pattern validation: "Week-Day-Cuisine-MessType-MealName"
        const keyPattern = /^[A-D]-[A-Za-z]+-[A-Za-z ]+-[A-Za-z\-]+-[A-Za-z]+$/;
        
        for (const [key, value] of Object.entries(parsed)) {
          if (!keyPattern.test(key)) {
            throw new Error(`Invalid format key encountered: ${key}`);
          }
          if (!Array.isArray(value) || !value.every(v => typeof v === 'string')) {
            throw new Error(`Invalid value array for key ${key}. All items must be text strings.`);
          }
        }

        // Save imported overrides
        onImportOverrides(parsed);
        alert(`Successfully imported ${Object.keys(parsed).length} custom meal overrides!`);
      } catch (err) {
        setImportError(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content glass-panel" style={{ maxInlineSize: '550px' }}>
        <div className="modal-header">
          <h2 id="settings-title" className="modal-title">⚙️ App Settings</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">×</button>
        </div>

        {/* Tab Selection */}
        <div className="settings-tabs">
          <button 
            type="button"
            className={`settings-tab-btn ${activeTab === 'calibrate' ? 'active' : ''}`}
            onClick={() => setActiveTab('calibrate')}
          >
            Cycle Calibration
          </button>
          <button 
            type="button"
            className={`settings-tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => setActiveTab('database')}
          >
            Database Settings
          </button>
        </div>

        {/* Tab 1: Calibration */}
        {activeTab === 'calibrate' && (
          <form onSubmit={handleCalibrationSubmit} className="modal-body">
            <p className="text-pretty" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
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
            
            <div className="form-group">
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
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn" 
                onClick={() => {
                  onRevertCalibration();
                  onClose();
                }}
                style={{ marginRight: 'auto', borderColor: '#ef4444', color: '#ef4444' }}
              >
                Reset Calibration
              </button>
              <button type="button" className="btn" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Calibration</button>
            </div>
          </form>
        )}

        {/* Tab 2: Database Management */}
        {activeTab === 'database' && (
          <div className="modal-body">
            <p className="text-pretty" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Manage customized mess menu databases. Any changes you make to meal cards are saved here locally. You can export them to backup or share, and upload a backup to restore it.
            </p>

            <div className="db-stats-box">
              📊 <strong>Database Statistics</strong>
              <div style={{ marginTop: '0.4rem' }}>
                Total Custom Meals Modified: <strong>{numOverrides}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Backups Export/Import */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleExportDatabase}
                  disabled={numOverrides === 0}
                  title="Download your custom database overrides as a JSON file"
                >
                  📥 Export Database
                </button>
                
                <label className="btn" style={{ cursor: 'pointer', textAlign: 'center' }}>
                  📤 Import Database
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportDatabase} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {importError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  ❌ Error: {importError}
                </div>
              )}

              {/* Reset database overrides */}
              <button 
                type="button"
                className="btn"
                onClick={() => {
                  if (confirm("Are you sure you want to clear all custom edits? This will restore the default menus parsed from PDFs.")) {
                    onClearOverrides();
                    alert("Cleared all database overrides successfully!");
                  }
                }}
                disabled={numOverrides === 0}
                style={{ borderColor: '#ef4444', color: '#ef4444', width: '100%', marginTop: '0.5rem' }}
              >
                🗑️ Clear All Database Overrides
              </button>
            </div>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0', marginTop: '0.5rem' }}>
              <button type="button" className="btn" onClick={onClose} style={{ width: '100%' }}>Close Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
