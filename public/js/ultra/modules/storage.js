// ========================================
// STORAGE ENGINE - LocalStorage & IndexedDB
// ========================================

export class StorageEngine {
    constructor() {
        this.prefix = 'ultra-weather-';
    }

    set(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(this.prefix + key, serialized);
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }

    get(key) {
        try {
            const item = localStorage.getItem(this.prefix + key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage get error:', error);
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // IndexedDB for offline weather history
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('UltraWeatherDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                if (!db.objectStoreNames.contains('weatherHistory')) {
                    const store = db.createObjectStore('weatherHistory', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('location', 'location', { unique: false });
                }
            };
        });
    }

    async saveWeatherHistory(data) {
        try {
            const db = await this.initDB();
            const transaction = db.transaction(['weatherHistory'], 'readwrite');
            const store = transaction.objectStore('weatherHistory');
            
            const record = {
                ...data,
                timestamp: new Date().toISOString()
            };
            
            await store.add(record);
            return true;
        } catch (error) {
            console.error('Failed to save weather history:', error);
            return false;
        }
    }

    async getWeatherHistory(limit = 10) {
        try {
            const db = await this.initDB();
            const transaction = db.transaction(['weatherHistory'], 'readonly');
            const store = transaction.objectStore('weatherHistory');
            const index = store.index('timestamp');
            
            return new Promise((resolve, reject) => {
                const request = index.openCursor(null, 'prev');
                const results = [];
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && results.length < limit) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Failed to get weather history:', error);
            return [];
        }
    }
}
