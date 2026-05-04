import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full border-2 border-red-200">
            <h1 className="text-3xl font-black text-red-600 mb-4 flex items-center gap-2">
              ⚠️ Application Error
            </h1>
            <p className="text-gray-700 font-bold mb-4">
              Something went wrong while rendering this page.
            </p>
            <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-auto max-h-60 mb-6">
              {this.state.error?.toString()}
            </div>
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="bg-red-600 text-white px-8 py-3 rounded-xl font-black hover:bg-red-700 transition-all"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
