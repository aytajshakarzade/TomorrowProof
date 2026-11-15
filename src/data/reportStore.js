const DB_NAME = 'tomorrowproof-research';
const DB_VERSION = 1;
const STORE_NAME = 'saved-analyses';
const LEGACY_KEY = 'tomorrowproof-reports';

function readLegacyReports() {
  try {
    const value = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB is not available in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open report storage.'));
    request.onblocked = () => reject(new Error('Report storage upgrade is blocked by another tab.'));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Report storage request failed.'));
  });
}

export async function loadSavedReports() {
  try {
    const database = await openDatabase();
    const transaction = database.transaction(STORE_NAME, 'readonly');
    const stored = await requestResult(transaction.objectStore(STORE_NAME).getAll());
    database.close();
    if (stored.length) return stored.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    // One-time migration for workspaces created by earlier TOMORROWPROOF versions.
    const legacy = readLegacyReports();
    if (legacy.length) await saveSavedReports(legacy);
    return legacy;
  } catch {
    return readLegacyReports();
  }
}

export async function saveSavedReports(reports) {
  const safeReports = Array.isArray(reports) ? reports : [];
  // Preserve the legacy key as a best-effort fallback. Large reports may exceed its quota.
  let localStorageSaved = false;
  try {
    localStorage.setItem(LEGACY_KEY, JSON.stringify(safeReports));
    localStorageSaved = true;
  } catch {
    // IndexedDB can hold larger snapshots than localStorage.
  }

  let database;
  try {
    database = await openDatabase();
    await new Promise((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      safeReports.forEach(report => store.put(report));
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error || new Error('Could not save reports.'));
      transaction.onabort = () => reject(transaction.error || new Error('Report save was cancelled.'));
    });
    database.close();
    return { persistent: true, storage: 'indexeddb' };
  } catch {
    try { database?.close(); } catch { /* Ignore close failures during fallback. */ }
    return { persistent: localStorageSaved, storage: localStorageSaved ? 'localstorage' : 'unavailable' };
  }
}
