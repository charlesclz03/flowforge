'use client'

import { useState, useEffect } from 'react'
import { Beat } from '@prisma/client'
import { toast } from 'react-hot-toast'
import {
  Edit2,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  Loader2,
  Check,
} from 'lucide-react'
import {
  deleteBeat,
  getAdminBeats,
  updateBeat,
  reorderBeat,
} from '@/app/actions/admin/beats'
import { Button } from '@/components/atoms/Button'
import { AppHeader } from '@/components/organisms/layout/AppHeader'

export default function AdminBeatsPage() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Local state for the row currently being edited
  const [editForm, setEditForm] = useState({
    title: '',
    artistName: '',
    label: '',
    genre: '',
    bpm: 0,
    isPremium: false,
  })

  // Local simple components to replace missing shadcn/ui
  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input
      {...props}
      className={`flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple disabled:cursor-not-allowed disabled:opacity-50 ${props.className}`}
    />
  )

  const Table = ({ children }: { children: React.ReactNode }) => (
    <div className="w-full overflow-auto">
      <table className="w-full caption-bottom text-sm text-left">
        {children}
      </table>
    </div>
  )
  const TableHeader = ({ children }: { children: React.ReactNode }) => (
    <thead className="[&_tr]:border-b [&_tr]:border-white/10">{children}</thead>
  )
  const TableBody = ({ children }: { children: React.ReactNode }) => (
    <tbody className="[&_tr:last-child]:border-0">{children}</tbody>
  )
  const TableRow = ({ children }: { children: React.ReactNode }) => (
    <tr className="border-b border-white/10 transition-colors hover:bg-white/5 data-[state=selected]:bg-white/10">
      {children}
    </tr>
  )
  const TableHead = ({ children }: { children: React.ReactNode }) => (
    <th className="h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0">
      {children}
    </th>
  )
  const TableCell = ({ children }: { children: React.ReactNode }) => (
    <td className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
      {children}
    </td>
  )

  useEffect(() => {
    loadBeats()
  }, [])

  const loadBeats = async () => {
    try {
      const data = await getAdminBeats()
      setBeats(data)
    } catch (error) {
      toast.error('Failed to load beats')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this beat?')) return

    try {
      await deleteBeat(id)
      setBeats(beats.filter((b) => b.id !== id))
      toast.success('Beat deleted')
    } catch (error) {
      toast.error('Failed to delete beat')
    }
  }

  const startEdit = (beat: Beat) => {
    setEditingId(beat.id)
    setEditForm({
      title: beat.title,
      artistName: beat.artistName || '',
      label: beat.label || '',
      genre: beat.genre || '',
      bpm: beat.bpm,
      isPremium: beat.isPremium,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({
      title: '',
      artistName: '',
      label: '',
      genre: '',
      bpm: 0,
      isPremium: false,
    })
  }

  const handleSave = async (id: string) => {
    try {
      const updated = await updateBeat(id, {
        title: editForm.title,
        artistName: editForm.artistName,
        label: editForm.label,
        genre: editForm.genre,
        bpm: Number(editForm.bpm),
        isPremium: editForm.isPremium,
      })
      setBeats(beats.map((b) => (b.id === id ? updated : b)))
      setEditingId(null)
      toast.success('Beat updated')
    } catch (error) {
      toast.error('Failed to update beat')
    }
  }

  // Local state for reloading UI feedback
  const [reorderingId, setReorderingId] = useState<string | null>(null)

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      setReorderingId(id)
      await reorderBeat(id, direction)
      await loadBeats()
    } catch (error) {
      toast.error('Failed to reorder beat')
    } finally {
      setReorderingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-accent-purple" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader
        showBackButton
        customTitle="BEAT MANAGEMENT"
        customSubtitle="Manage system beats, set premium status, and reorder tracks"
      />
      <div className="container py-8 space-y-8">
        <div className="rounded-md border border-white/10 bg-surface-elevated">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Producer</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>BPM</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beats.map((beat) => (
                <TableRow key={beat.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-center">
                      {reorderingId === beat.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-accent-purple" />
                      ) : (
                        <>
                          <button
                            onClick={() => handleReorder(beat.id, 'up')}
                            className="hover:text-accent-purple p-1 disabled:opacity-50"
                            disabled={!!reorderingId}
                          >
                            <ArrowUp size={16} />
                          </button>
                          <button
                            onClick={() => handleReorder(beat.id, 'down')}
                            className="hover:text-accent-purple p-1 disabled:opacity-50"
                            disabled={!!reorderingId}
                          >
                            <ArrowDown size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Edit Mode: Title */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                        placeholder="Title"
                      />
                    ) : (
                      <span className="font-medium text-white">
                        {beat.title}
                      </span>
                    )}
                  </TableCell>

                  {/* Edit Mode: Producer */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <Input
                        value={editForm.artistName}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            artistName: e.target.value,
                          })
                        }
                        placeholder="Producer"
                      />
                    ) : (
                      <span className="text-text-secondary">
                        {beat.artistName || 'Unknown'}
                      </span>
                    )}
                  </TableCell>

                  {/* Edit Mode: Label */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <Input
                        value={editForm.label}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            label: e.target.value,
                          })
                        }
                        placeholder="Label"
                      />
                    ) : (
                      <span className="text-text-secondary">
                        {beat.label || '-'}
                      </span>
                    )}
                  </TableCell>

                  {/* Edit Mode: Genre */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <select
                        value={editForm.genre}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            genre: e.target.value,
                          })
                        }
                        className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-purple"
                      >
                        <option value="Freestyle">Freestyle</option>
                        <option value="Hip-Hop">Hip-Hop</option>
                        <option value="Old School">Old School</option>
                        <option value="Trap">Trap</option>
                        <option value="Chill">Chill</option>
                        <option value="Drill">Drill</option>
                        <option value="Lo-Fi">Lo-Fi</option>
                        <option value="West Coast">West Coast</option>
                        <option value="Boom Bap">Boom Bap</option>
                        <option value="R&B">R&B</option>
                        <option value="Grime">Grime</option>
                        <option value="Afrobeat">Afrobeat</option>
                      </select>
                    ) : (
                      <span className="text-text-secondary">
                        {beat.genre || '-'}
                      </span>
                    )}
                  </TableCell>

                  {/* Edit Mode: BPM */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <Input
                        type="number"
                        value={editForm.bpm}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            bpm: parseInt(e.target.value) || 0,
                          })
                        }
                        className="w-20"
                      />
                    ) : (
                      beat.bpm
                    )}
                  </TableCell>

                  {/* Edit Mode: Type (Pro/Free) */}
                  <TableCell>
                    {editingId === beat.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setEditForm({ ...editForm, isPremium: false })
                          }
                          className={`px-2 py-1 rounded text-xs font-bold transition-all ${!editForm.isPremium ? 'bg-green-500 text-black' : 'bg-white/5 text-text-secondary'}`}
                        >
                          FREE
                        </button>
                        <button
                          onClick={() =>
                            setEditForm({ ...editForm, isPremium: true })
                          }
                          className={`px-2 py-1 rounded text-xs font-bold transition-all ${editForm.isPremium ? 'bg-accent-purple text-black' : 'bg-white/5 text-text-secondary'}`}
                        >
                          PRO
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          beat.isPremium
                            ? 'bg-accent-purple/20 text-accent-purple'
                            : 'bg-green-500/20 text-green-400'
                        }`}
                      >
                        {beat.isPremium ? 'PRO' : 'FREE'}
                      </span>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {editingId === beat.id ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                            onClick={() => handleSave(beat.id)}
                          >
                            <Check size={18} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            onClick={cancelEdit}
                          >
                            <X size={18} />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(beat)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 transition-opacity"
                            onClick={() => handleDelete(beat.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
