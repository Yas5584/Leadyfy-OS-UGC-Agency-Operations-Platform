import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Module Encountered an Issue</h2>
          <p className="text-sm text-gray-500 max-w-md mb-6">
            {this.state.error?.message || 'An unexpected runtime error occurred while rendering this view.'}
          </p>
          <Button onClick={this.handleReset} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Reload View
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
