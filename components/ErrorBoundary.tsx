'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6 text-center">
              <div className="space-y-2">
                <h2 className="text-4xl font-light">Something went wrong</h2>
                <p className="text-text-secondary">
                  {this.state.error?.message || 'An unexpected error occurred'}
                </p>
              </div>

              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="btn-primary px-8 py-3"
              >
                Try again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}

