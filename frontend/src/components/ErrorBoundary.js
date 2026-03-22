import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button.jsx';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle size={48} className="text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-[#f5f5f0] mb-2">Something went wrong</h1>
            <p className="text-[#b0b0b0] mb-4">
              We encountered an unexpected error. Please try again or go back to the home page.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-500/10 border border-red-500 rounded p-3 mb-4 text-left">
                <p className="text-red-500 text-xs font-mono break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
            <Button
              onClick={this.handleReset}
              className="w-full bg-[#d4af37] text-[#0a0e17] hover:bg-[#e0c158] font-semibold"
            >
              Go to Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
