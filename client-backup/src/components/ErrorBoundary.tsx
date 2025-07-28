import React, { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log error to an error reporting service if desired
    console.error('Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h2>Something went wrong in the Explainability Panel.</h2>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
