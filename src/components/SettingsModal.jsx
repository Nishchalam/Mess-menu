import React, { useState } from 'react';
import { createNewBin, BIN_ID_KEY, ADMIN_KEY } from '../adminDb';

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
  isAdmin,
  adminKey,
  onAdminLogin,
  onAdminLogout,
  onRefreshDb,
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin' : 'calibrate');
  const [dateVal, setDateVal] = useState(currentAnchorDate);
  const [weekVal, setWeekVal] = useState(currentAnchorWeek);

  // Admin login state
  const [secretInput, setSecretInput] = useState('');
  const [binIdInput, setBinIdInput] = useState(() => localStorage.getItem(BIN_ID_KEY) || '');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [setupMode, setSetupMode] = useState(false); // true = first-time create bin

  const numCommitted = Object.keys(committedOverrides || {}).length;
  const numPersonal = Object.keys(overrides || {}).length;

  const handleCalibrationSubmit = (e) => {
    e.preventDefault();
    onSaveCalibration(dateVal, weekVal);
    onClose();
  };

  // ── Admin Login ───────────────────────────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      let binId = binIdInput.trim();

      if (setupMode || !binId) {
        // First-time setup: create a new public bin
        binId = await createNewBin(secretInput.trim());
        localStorage.setItem(BIN_ID_KEY, binId);
        setBinIdInput(binId);
      }

      // Verify the key works by trying to read
      const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
        headers: {
          'X-Master-Key': secretInput.trim(),
          'X-Bin-Meta': 'false',
        }
      });

      if (!res.ok) {
        throw new Error('Invalid secret code or Bin ID. Please check and try again.');
      }

      localStorage.setItem(BIN_ID_KEY, binId);
      onAdminLogin(secretInput.trim());
      onRefreshDb();
      setSecretInput('');
      setLoginError('');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    onAdminLogout();
    setActiveTab('calibrate');
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="settings-title">
      <div className="modal-content glass-panel" style={{ maxInlineSize: '560px' }}>
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
            className={`settings-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            {isAdmin ? '🛡️ Admin' : '🔐 Admin Login'}
          </button>
        </div>

        {/* ── Tab 1: Calibration ─────────────────────────────────── */}
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

        {/* ── Tab 2: Admin ───────────────────────────────────────── */}
        {activeTab === 'admin' && (
          <div className="modal-body">

            {/* Already logged in */}
            {isAdmin ? (
              <>
                <div className="admin-logged-in-box">
                  <div className="admin-logged-in-icon">🛡️</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>Admin Mode Active</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                      Edit buttons are visible on all meal cards. Changes save instantly for everyone.
                    </div>
                  </div>
                </div>

                <div className="db-stats-box" style={{ marginTop: '0.5rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>📊 Database Status</div>
                  <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    <div>🌐 Shared edits (visible to everyone): <strong>{numCommitted}</strong></div>
                    <div>📱 Your personal edits (this device): <strong>{numPersonal}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => { onRefreshDb(); }}
                    style={{ flex: 1 }}
                  >
                    🔄 Refresh from Cloud
                  </button>
                  <button 
                    type="button"
                    className="btn"
                    onClick={handleLogout}
                    style={{ flex: 1, borderColor: '#ef4444', color: '#ef4444' }}
                  >
                    🚪 Exit Admin Mode
                  </button>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, marginTop: '0.5rem' }}>
                  <button type="button" className="btn" onClick={onClose} style={{ width: '100%' }}>Close Settings</button>
                </div>
              </>
            ) : (
              /* Not logged in */
              <>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Enter your admin secret code to unlock menu editing. Changes you make will update the menu for <strong>everyone</strong>.
                </p>

                <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                  {/* Bin ID field */}
                  <div className="form-group">
                    <label htmlFor="admin-bin-id" className="form-label">
                      Database ID
                      <span style={{ fontWeight: 400, marginLeft: '0.4rem', color: 'var(--text-tertiary)' }}>
                        (from jsonbin.io)
                      </span>
                    </label>
                    <input
                      id="admin-bin-id"
                      type="text"
                      className="search-input"
                      placeholder="e.g. 665f3a2e5d9e75d7c3a8e1b2"
                      value={binIdInput}
                      onChange={e => setBinIdInput(e.target.value)}
                      spellCheck={false}
                      autoComplete="off"
                    />
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                      Leave blank to auto-create a new database on first login.
                    </div>
                  </div>

                  {/* Secret code field */}
                  <div className="form-group">
                    <label htmlFor="admin-secret" className="form-label">
                      Secret Code
                      <span style={{ fontWeight: 400, marginLeft: '0.4rem', color: 'var(--text-tertiary)' }}>
                        (your JSONBin Master Key)
                      </span>
                    </label>
                    <input
                      id="admin-secret"
                      type="password"
                      className="search-input"
                      placeholder="$2a$10$…"
                      value={secretInput}
                      onChange={e => setSecretInput(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  {loginError && (
                    <div style={{ color: '#ef4444', fontSize: '0.82rem', background: 'rgba(239,68,68,0.08)', padding: '0.6rem 0.75rem', borderRadius: '6px' }}>
                      ❌ {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loginLoading || !secretInput}
                    style={{ width: '100%' }}
                  >
                    {loginLoading ? '🔄 Connecting…' : '🔐 Login as Admin'}
                  </button>
                </form>

                {/* Setup instructions callout */}
                <div className="git-cheatsheet" style={{ marginTop: '0.75rem' }}>
                  <div className="git-cheatsheet-header">
                    <span>🚀 First time? Get your secret code in 2 min</span>
                  </div>
                  <div style={{ padding: '0.75rem', fontSize: '0.8rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                    <ol style={{ paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <li>Go to <a href="https://jsonbin.io" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)' }}>jsonbin.io</a> → Sign up free</li>
                      <li>Go to <strong>API Keys</strong> → copy the <strong>Master Key</strong></li>
                      <li>Leave Database ID blank → app will auto-create it</li>
                      <li>Paste the Master Key above as your Secret Code</li>
                      <li>Done! Share the Database ID (not the key) with nobody 😄</li>
                    </ol>
                  </div>
                </div>

                <div className="modal-footer" style={{ borderTop: 'none', paddingTop: 0, marginTop: '0.5rem' }}>
                  <button type="button" className="btn" onClick={onClose} style={{ width: '100%' }}>Close Settings</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
