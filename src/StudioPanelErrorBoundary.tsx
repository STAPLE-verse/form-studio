"use client"

import React, { Component, type ErrorInfo, type ReactNode } from "react"

interface StudioPanelErrorBoundaryProps {
  children: ReactNode
  panelName: string
  resetKey: string
}

interface StudioPanelErrorBoundaryState {
  error: Error | null
}

export function StudioPanelErrorFallback({
  error,
  panelName,
}: {
  error: Error
  panelName: string
}) {
  return (
    <div
      className="alert alert-warning"
      data-studio-panel-error="true"
      role="alert"
    >
      <div className="flex min-w-0 flex-col items-start gap-2">
        <h4 className="font-bold">{panelName} unavailable</h4>
        <p className="text-sm">
          This panel could not interpret the current schema. The rest of Form Studio is still
          available.
        </p>
        <p className="max-w-full overflow-x-auto whitespace-pre-wrap font-mono text-xs">
          {error.message}
        </p>
        <p className="text-sm">Use the JSON Editor to correct the schema or UI schema.</p>
      </div>
    </div>
  )
}

export default class StudioPanelErrorBoundary extends Component<
  StudioPanelErrorBoundaryProps,
  StudioPanelErrorBoundaryState
> {
  state: StudioPanelErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): StudioPanelErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Form Studio ${this.props.panelName} render error`, error, errorInfo)
  }

  componentDidUpdate(previousProps: StudioPanelErrorBoundaryProps) {
    if (this.state.error && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (this.state.error) {
      return <StudioPanelErrorFallback error={this.state.error} panelName={this.props.panelName} />
    }

    return this.props.children
  }
}
