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
  committedOverrides,
  onClearOverrides,
  onImportOverrides
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('calibrate'); // 'calibrate' | 'database'
  const [dateVal, setDateVal] = useState(currentAnchorDate);
  const [weekVal, setWeekVal] = useState(currentAnchorWeek);
  const [importError, setImportError] = useState('');
  const [copied, setCopied] = useState(false);

  const numPersonalOverrides = Object.keys(overrides || {}).length;
  const numCommittedOverrides = Object.keys(committedOverrides || {}).length;

  // Merge personal overrides ON TOP of committed for the admin database file
  const mergedForExport = { ...(committedOverrides || {}), ...(overrides || {}) };
  const numMergedOverrides = Object.keys(mergedForExport).length;

  const handleCalibrationSubmit = (e) => {
    e.preventDefault();
    onSaveCalibration(dateVal, weekVal);
    onClose();
  };

  // ── ADMIN: Export merged database as menuOverrides.json ──────────────────
  // Merges committed + personal edits into one file ready to commit to GitHub.
  const handleExportAdminDatabase = () => {
    const json = JSON.stringify(mergedForExport, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "menuOverrides.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── PERSONAL: Export only personal overrides as a backup ─────────────────
  const handleExportPersonalBackup = () => {
    const json = JSON.stringify(overrides, null, 2);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(json);
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "vibemess_personal_backup.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // ── IMPORT: Restore personal overrides from a backup file ────────────────
  const handleImportDatabase = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
          throw new Error("Backup file must be a JSON object.");
        }

        // Schema key pattern: "Week-Day-Cuisine-MessType-MealName"
        const keyPattern = /^[A-D]-[A-Za-z]+-[A-Za-z ]+-[A-Za-z\-]+-[A-Za-z]+$/;
        for (const [key, value] of Object.entries(parsed)) {
          if (!keyPattern.test(key)) {
            throw new Error(`Invalid format key: ${key}`);
          }
          if (!Array.isArray(value) || !value.every(v => typeof v === 'string')) {
            throw new Error(`Invalid value for key ${key}. Expected array of strings.`);
          }
        }

        onImportOverrides(parsed);
        alert(`✅ Imported ${Object.keys(parsed).length} meal overrides!`);
      } catch (err) {
        setImportError(err.message || "Failed to parse JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const copyGitCommands = () => {
    const cmd = `cp ~/Downloads/menuOverrides.json ./public/menuOverrides.json\ngit add public/menuOverrides.json\ngit commit -m "update: mess menu database"\ngit push origin main\nnpm run deploy`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content glass-panel" style={{ maxInlineSize: '580px' }}>
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
                onClick={() => { onRevertCalibration(); onClose(); }}
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

            {/* Stats */}
            <div className="db-stats-box">
              <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>📊 Database Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                <div>
                  🌐 <strong>Committed (shared with everyone):</strong>{' '}
                  <span style={{ color: numCommittedOverrides > 0 ? 'var(--accent)' : 'var(--text-tertiary)' }}>
                    {numCommittedOverrides} meal{numCommittedOverrides !== 1 ? 's' : ''} edited
                  </span>
                </div>
                <div>
                  📱 <strong>Personal (this device only):</strong>{' '}
                  <span style={{ color: numPersonalOverrides > 0 ? '#f59e0b' : 'var(--text-tertiary)' }}>
                    {numPersonalOverrides} meal{numPersonalOverrides !== 1 ? 's' : ''} edited
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Section */}
            <div className="admin-section">
              <div className="admin-section-title">🛡️ Admin — Publish to GitHub</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.4rem 0 0.75rem' }}>
                This merges your personal edits with the existing committed database into one file.
                Save it as <code style={{ background: 'rgba(99,102,241,0.1)', padding: '0 4px', borderRadius: '3px' }}>public/menuOverrides.json</code> in the project, then commit &amp; deploy.
              </p>
              <button 
                type="button" 
                className="btn btn-primary"
                onClick={handleExportAdminDatabase}
                disabled={numMergedOverrides === 0}
                style={{ width: '100%' }}
              >
                📥 Download menuOverrides.json ({numMergedOverrides} edits)
              </button>

              {/* Git commands cheat sheet */}
              <div className="git-cheatsheet">
                <div className="git-cheatsheet-header">
                  <span>📋 After downloading, run these commands:</span>
                  <button className="git-copy-btn" onClick={copyGitCommands}>
                    {copied ? '✅ Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="git-commands">{`cp ~/Downloads/menuOverrides.json ./public/menuOverrides.json
git add public/menuOverrides.json
git commit -m "update: mess menu database"
git push origin main
npm run deploy`}</pre>
              </div>
            </div>

            {/* Personal Backup Section */}
            <div className="admin-section" style={{ borderColor: 'rgba(245,158,11,0.2)', background: 'rgba(245,158,11,0.03)' }}>
              <div className="admin-section-title" style={{ color: '#f59e0b' }}>📱 Personal Backup</div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0.4rem 0 0.75rem' }}>
                Export just your personal local edits, or import a backup to restore them.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  className="btn"
                  onClick={handleExportPersonalBackup}
                  disabled={numPersonalOverrides === 0}
                >
                  💾 Backup Personal
                </button>
                
                <label className="btn" style={{ cursor: 'pointer', textAlign: 'center' }}>
                  📤 Restore Backup
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImportDatabase} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>

              {importError && (
                <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                  ❌ {importError}
                </div>
              )}
            </div>

            {/* Clear personal overrides */}
            <button 
              type="button"
              className="btn"
              onClick={() => {
                if (confirm("Clear all your personal edits? The committed (shared) database is not affected.")) {
                  onClearOverrides();
                  alert("Personal edits cleared. You now see the committed shared menu.");
                }
              }}
              disabled={numPersonalOverrides === 0}
              style={{ borderColor: '#ef4444', color: '#ef4444', width: '100%' }}
            >
              🗑️ Clear Personal Edits ({numPersonalOverrides})
            </button>

            <div className="modal-footer" style={{ borderTop: 'none', paddingTop: '0' }}>
              <button type="button" className="btn" onClick={onClose} style={{ width: '100%' }}>Close Settings</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
