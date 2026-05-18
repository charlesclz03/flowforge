import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/atoms/Modal'

describe('enterprise UI primitives', () => {
  it('uses the contrast-safe primary foreground token', () => {
    render(<Button>Start Practice</Button>)

    expect(screen.getByRole('button', { name: /start practice/i })).toHaveClass(
      'bg-primary',
      'text-primary-foreground'
    )
  })

  it('renders shared modals with accessible dialog semantics', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Upload Beat">
        <button type="button">Save</button>
      </Modal>
    )

    const dialog = screen.getByRole('dialog', { name: /upload beat/i })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(
      screen.getByRole('button', { name: /close upload beat/i })
    ).toBeInTheDocument()
  })

  it('closes shared modals with Escape and restores focus', () => {
    const onClose = vi.fn()

    render(
      <>
        <button type="button">Open settings</button>
        <Modal isOpen onClose={onClose} title="Settings">
          <button type="button">Done</button>
        </Modal>
      </>
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
