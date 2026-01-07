export interface GuestSession {
  blob: Blob
  metadata: {
    beatId: string
    beatTitle: string
    frequency: number
    difficulty: number
    duration: number
    createdAt: number
  }
}

const DB_NAME = 'FlowForgeGuestDB'
const STORE_NAME = 'guest_session'
const DB_VERSION = 1
const KEY = 'current_session'

export const GuestStorage = {
  async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME)
        }
      }
    })
  },

  async saveSession(
    blob: Blob,
    metadata: GuestSession['metadata']
  ): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ blob, metadata }, KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  },

  async getSession(): Promise<GuestSession | null> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        resolve(request.result || null)
      }
    })
  },

  async clearSession(): Promise<void> {
    const db = await this.openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(KEY)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  },
}
