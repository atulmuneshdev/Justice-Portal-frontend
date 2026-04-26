import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import FindAdvocate from './pages/FindAdvocate';
import CaseManagement from './pages/CaseManagement';
import Chat from './pages/Chat';
import AdvocateProfile from './pages/AdvocateProfile';
import AdvocateProfileView from './pages/advocate-profile';
import ClientProfile from './pages/clientProfile';
import MyNetwork from './pages/MyNetwork';
import ClientDashboard from './pages/ClientDashboard';
import AdvocateDashboard from './pages/AdvocateDashboard';
import CaseDetail from './pages/CaseDetail';
import Navbar from './components/Navbar';
import './App.css';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4 shadow-xl"></div>
            <p className="font-bold text-xl text-blue-600 animate-pulse">JusticePortal Loading...</p>
        </div>
    );
    if (!user) return <Navigate to="/login" />;
    return children;
};

const AppContent = () => {
    const { user } = useAuth();
    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            {user && <Navbar />}
            <Routes>
                <Route path="/login" element={!user ? <Login /> : <Navigate to="/feed" />} />
                <Route path="/register" element={!user ? <Register /> : <Navigate to="/feed" />} />

                <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
                <Route path="/dashboard" element={
                    <ProtectedRoute>
                        {user?.role === 'client' ? <ClientDashboard /> : <AdvocateDashboard />}
                    </ProtectedRoute>
                } />
                <Route path="/client-dashboard" element={<ProtectedRoute><ClientDashboard /></ProtectedRoute>} />
                <Route path="/advocate-dashboard" element={<ProtectedRoute><AdvocateDashboard /></ProtectedRoute>} />
                <Route path="/find-advocate" element={<ProtectedRoute><FindAdvocate /></ProtectedRoute>} />
                <Route path="/cases" element={<ProtectedRoute><CaseManagement /></ProtectedRoute>} />
                <Route path="/case/:caseId" element={<ProtectedRoute><CaseDetail /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
                <Route path="/profile" element={
                    <ProtectedRoute>
                        {user?.role === 'client' ? <ClientProfile /> : <AdvocateProfile />}
                    </ProtectedRoute>
                } />
                <Route path="/advocate-profile/:id" element={<ProtectedRoute><AdvocateProfileView /></ProtectedRoute>} />
                <Route path="/network" element={<ProtectedRoute><MyNetwork /></ProtectedRoute>} />

                <Route path="/" element={<Navigate to="/feed" />} />
            </Routes>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    className: 'rounded-xl font-bold shadow-2xl border border-gray-100 p-4',
                    duration: 3000,
                    style: {
                        background: '#fff',
                        color: '#1F2937',
                    },
                }}
            />
        </div>
    );
};

function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <NotificationProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </NotificationProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}

export default App;
