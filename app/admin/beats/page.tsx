'use client'

import { useState, useEffect } from 'react'
import { Beat } from '@prisma/client'
import { toast } from 'react-hot-toast'
import { Edit2, Trash2, X, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'
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

  const handleUpdate = async (id: string, data: Partial<Beat>) => {
    try {
      const updated = await updateBeat(id, data)
      setBeats(beats.map((b) => (b.id === id ? updated : b)))
      setEditingId(null)
      toast.success('Beat updated')
    } catch (error) {
      toast.error('Failed to update beat')
    }
  }

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    try {
      await reorderBeat(id, direction)
      loadBeats()
    } catch (error) {
      toast.error('Failed to reorder beat')
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
                <TableHead>BPM</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beats.map((beat) => (
                <TableRow key={beat.id}>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleReorder(beat.id, 'up')}
                        className="hover:text-accent-purple p-1"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        onClick={() => handleReorder(beat.id, 'down')}
                        className="hover:text-accent-purple p-1"
                      >
                        <ArrowDown size={16} />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === beat.id ? (
                      <Input
                        defaultValue={beat.title}
                        onBlur={(e) =>
                          handleUpdate(beat.id, { title: e.target.value })
                        }
                      />
                    ) : (
                      <span className="font-medium">{beat.title}</span>
                    )}
                  </TableCell>
                  <TableCell>{beat.bpm}</TableCell>
                  <TableCell>
                    <button
                      onClick={() =>
                        handleUpdate(beat.id, { isPremium: !beat.isPremium })
                      }
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        beat.isPremium
                          ? 'bg-accent-purple/20 text-accent-purple'
                          : 'bg-green-500/20 text-green-400'
                      }`}
                    >
                      {beat.isPremium ? 'PRO' : 'FREE'}
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingId(editingId === beat.id ? null : beat.id)
                        }
                      >
                        {editingId === beat.id ? (
                          <X size={16} />
                        ) : (
                          <Edit2 size={16} />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(beat.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
