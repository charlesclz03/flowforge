import { Beat } from '@/types/database'

const DB_NAME = 'FlowForgeDB'
const STORE_NAME = 'LocalBeats'
const DB_VERSION = 1

interface LocalBeat {
  id: string
  title: string
  bpm: number
  storageUrl: string
  isPremium: boolean
  genre: string | null
  duration: number | null
  artistName: string | null
  difficulty: string
  file: Blob | File
  createdAt: number
  tags: string[]
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

export async function addLocalBeat(file: File): Promise<Beat> {
  const db = await openDB()
  const id = `local-${crypto.randomUUID()}`

  const title = file.name.replace(/\.[^/.]+$/, '')

  const newBeat: LocalBeat = {
    id,
    title,
    bpm: 90, // Default
    storageUrl: '', // Placeholder in DB
    isPremium: false,
    genre: 'Local',
    duration: 0,
    artistName: 'Me',
    difficulty: 'Medium',
    file,
    createdAt: Date.now(),
    tags: [],
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.add(newBeat)

    request.onsuccess = () => {
      const url = URL.createObjectURL(file)
      // Return a Beat compatible object
      const beat: Beat = {
        ...newBeat,
        storageUrl: url,
        createdAt: new Date(newBeat.createdAt),
        updatedAt: new Date(newBeat.createdAt),
      } as unknown as Beat // casting because Prisma Beat has strict types
      resolve(beat)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getLocalBeats(): Promise<Beat[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const store = tx.objectStore(STORE_NAME)
    const request = store.getAll()

    request.onsuccess = () => {
      const results = request.result as LocalBeat[]
      const beats = results.map((b) => ({
        ...b,
        file: undefined, // Don't expose file blob directly
        storageUrl: URL.createObjectURL(b.file),
        createdAt: new Date(b.createdAt),
        updatedAt: new Date(b.createdAt),
      })) as unknown as Beat[]
      resolve(beats)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function deleteLocalBeat(id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}
