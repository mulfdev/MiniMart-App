import React from 'react';

type ErrorBoundaryProps = {
    children: React.ReactNode;
};

type ErrorBoundaryState = {
    hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error) {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mt-32 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
                        <p className="text-zinc-400">
                            We're sorry, but an unexpected error occurred. Please try again.
                        </p>
                        <button
                            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Try again
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
