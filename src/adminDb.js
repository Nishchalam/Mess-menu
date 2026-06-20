// ── JSONBin Cloud Database ────────────────────────────────────────────────
// Public bin: anyone can READ without authentication.
// Admin (master key holder): can WRITE to update the menu for everyone.
//
// SETUP: After creating your bin at jsonbin.io, paste the Bin ID below.
// The Master Key is entered by the admin inside the app — never stored in code.
// ─────────────────────────────────────────────────────────────────────────

const JSONBIN_API = 'https://api.jsonbin.io/v3';

// !! Paste your JSONBin Bin ID here after setup !!
// Example: "665f3a2e5d9e75d7c3a8e1b2"
export const BIN_ID_KEY = 'vibemess_bin_id'; // localStorage key
export const ADMIN_KEY = 'vibemess_admin_key'; // localStorage key for master key

/**
 * Get the stored bin ID from localStorage (set once by admin on first login).
 */
export function getStoredBinId() {
  return localStorage.getItem(BIN_ID_KEY) || null;
}

/**
 * Get the stored admin master key from localStorage.
 */
export function getStoredAdminKey() {
  return localStorage.getItem(ADMIN_KEY) || null;
}

/**
 * Fetch the current menu overrides from the public bin (no auth required).
 * Returns {} if no bin configured or fetch fails.
 */
export async function fetchCommittedOverrides() {
  const binId = getStoredBinId();
  if (!binId) return {};

  try {
    const res = await fetch(`${JSONBIN_API}/b/${binId}/latest`, {
      headers: { 'X-Bin-Meta': 'false' }
    });
    if (!res.ok) return {};
    const data = await res.json();
    return (data && typeof data === 'object' && !Array.isArray(data)) ? data : {};
  } catch {
    return {};
  }
}

/**
 * Save updated menu overrides to the bin (requires admin master key).
 * Throws if save fails.
 */
export async function saveCommittedOverrides(overrides, masterKey) {
  const binId = getStoredBinId();
  if (!binId) throw new Error('No database connected. Please set up the admin database first.');

  const res = await fetch(`${JSONBIN_API}/b/${binId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': masterKey,
      'X-Bin-Meta': 'false',
    },
    body: JSON.stringify(overrides),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Save failed (${res.status}): ${text}`);
  }
  return await res.json();
}

/**
 * Create a brand-new public bin for the menu database.
 * Called once by the admin on first setup.
 * Returns the new bin ID.
 */
export async function createNewBin(masterKey) {
  const res = await fetch(`${JSONBIN_API}/b`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': masterKey,
      'X-Bin-Name': 'vibemess-menu-db',
      'X-Bin-Private': 'false', // Public: anyone can read without auth
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`Failed to create database (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.metadata.id;
}
