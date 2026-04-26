import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error("Uncaught error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-center">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-red-100 p-10 border border-red-50"
                    >
                        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h1>
                        <p className="text-gray-500 font-bold mb-8 leading-relaxed">
                            An unexpected error occurred in our system. Don't worry, your data is safe.
                        </p>
                        
                        <div className="space-y-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Try Refreshing
                            </button>
                            <button
                                onClick={this.handleReset}
                                className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-all"
                            >
                                <Home className="w-4 h-4" />
                                Back to Home
                            </button>
                        </div>

                        {import.meta.env.DEV && (
                            <div className="mt-8 pt-6 border-t border-gray-100 text-left">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Error Details (Dev Only)</p>
                                <pre className="text-[10px] bg-gray-50 p-4 rounded-xl overflow-x-auto text-red-400 font-mono">
                                    {this.state.error?.toString()}
                                </pre>
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
