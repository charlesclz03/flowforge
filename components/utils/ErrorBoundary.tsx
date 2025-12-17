'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  name?: string // To identify which boundary failed in logs
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    // Here you would log to Sentry
    // Sentry.captureException(error);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-6 rounded-lg border border-red-500/20 bg-red-500/10 flex flex-col items-center justify-center text-center space-y-4 min-h-[200px]">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">Something went wrong</h3>
            <p className="text-text-secondary text-sm max-w-xs mx-auto">
              {this.props.name
                ? `Error in ${this.props.name}`
                : 'The application encountered an unexpected error.'}
            </p>
          </div>
          <Button
            onClick={this.handleReset}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-500/10"
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
