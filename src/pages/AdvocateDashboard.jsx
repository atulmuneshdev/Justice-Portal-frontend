import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    Briefcase, Users, MessageSquare, FileText, Check,
    Clock, CheckCircle, XCircle, User, Paperclip,
    Download, Eye, ChevronRight, Shield, Star,
    AlertCircle, Phone, Mail, MapPin, DollarSign, Trash2
} from 'lucide-react';

const AdvocateDashboard = () => {
    const { user } = useAuth();
    const { onlineUsers, isOnline } = useNotification();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('requests');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await API.get('/cases');
            setCases(res.data);
        } catch (error) {
            toast.error('Failed to load cases');
        } finally {
            setLoading(false);
        }
    };

    const handleCaseAction = async (caseId, status) => {
        try {
            await API.put(`/cases/${caseId}`, { status });
            toast.success(`Case ${status} successfully!`);
            fetchData();
        } catch (error) {
            toast.error(`Failed to ${status} case`);
        }
    };

    const handleDeleteCase = async (caseId) => {
        if (!window.confirm('Are you sure you want to delete this case?')) return;
        try {
            await API.delete(`/cases/${caseId}`);
            toast.success('Case deleted successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete case');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'active': return <CheckCircle className="w-4 h-4" />;
            case 'rejected': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    const pendingCases = cases.filter(c => c.status === 'pending');
    const activeCases = cases.filter(c => c.status === 'active');

    return (
        <div className="pt-24 min-h-screen bg-linear-to-br from-slate-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Advocate Dashboard</h1>
                            <p className="text-indigo-600 font-semibold">Welcome, {user?.name || 'Advocate'}!</p>
                        </div>
                    </div>
                    <p className="text-gray-500 mt-2">Manage your cases and connect with clients</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Total Cases</p>
                                <p className="text-3xl font-black text-indigo-600">{cases.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                <Briefcase className="w-7 h-7 text-indigo-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-yellow-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Pending Requests</p>
                                <p className="text-3xl font-black text-yellow-600">{pendingCases.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                                <Clock className="w-7 h-7 text-yellow-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-green-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Active Cases</p>
                                <p className="text-3xl font-black text-green-600">{activeCases.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Total Clients</p>
                                <p className="text-3xl font-black text-blue-600">{activeCases.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-blue-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-2xl">
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'requests' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <AlertCircle className="w-4 h-4" />
                        Case Requests
                        {pendingCases.length > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingCases.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'active' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Active Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('clients')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Users className="w-4 h-4" />
                        Clients
                    </button>
                </div>

                <AnimatePresence mode='wait'>
                    {activeTab === 'requests' && (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-6">Incoming Case Requests</h2>
                            {loading ? (
                                <div className="grid gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-gray-100" />
                                    ))}
                                </div>
                            ) : pendingCases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                                    <CheckCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">All caught up!</h3>
                                    <p className="text-gray-500 mt-2">No pending case requests at the moment.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {pendingCases.map(caseItem => (
                                        <motion.div
                                            key={caseItem._id}
                                            whileHover={{ x: 4 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-yellow-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                        <FileText className="w-7 h-7 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg">{caseItem.title}</h3>
                                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200 flex items-center gap-1 w-fit mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            PENDING REVIEW
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(caseItem.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <p className="text-gray-600 text-sm mb-4">{caseItem.description}</p>

                                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-4">
                                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                                                    <User className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{caseItem.client?.name || 'Client'}</p>
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        {caseItem.client?.email && (
                                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{caseItem.client.email}</span>
                                                        )}
                                                        {caseItem.client?.phone && (
                                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{caseItem.client.phone}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                                    <DollarSign className="w-3 h-3" />
                                                    Case Type: <strong>{caseItem.caseType}</strong>
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleCaseAction(caseItem._id, 'rejected')}
                                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-all border border-red-100"
                                                    >
                                                        <XCircle className="w-4 h-4 inline mr-1" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleCaseAction(caseItem._id, 'active')}
                                                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 flex items-center gap-2"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Accept Case
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'active' && (
                        <motion.div
                            key="active"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-6">Active Cases</h2>
                            {loading ? (
                                <div className="grid gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
                                    ))}
                                </div>
                            ) : activeCases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                                    <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">No active cases</h3>
                                    <p className="text-gray-500 mt-2">Accept incoming case requests to get started.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activeCases.map(caseItem => (
                                        <motion.div
                                            key={caseItem._id}
                                            whileHover={{ x: 4 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-green-200 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                                                        <Briefcase className="w-7 h-7 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg">{caseItem.title}</h3>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" />
                                                                ACTIVE
                                                            </span>
                                                            <span className="text-xs text-gray-500">{caseItem.caseType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate('/chat', { state: { user: caseItem.client, role: 'client', caseId: caseItem._id } })}
                                                        className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                                        title="Chat with Client"
                                                    >
                                                        <MessageSquare className="w-5 h-5" />
                                                    </button>
                                                    <Link
                                                        to={`/case/${caseItem._id}`}
                                                        className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                                                        title="View Case Details"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteCase(caseItem._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                                        title="Delete Case"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                                        <User className="w-5 h-5 text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{caseItem.client?.name}</p>
                                                        <p className="text-xs text-gray-500">{caseItem.client?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Documents</p>
                                                        <p className="font-bold text-gray-900">{caseItem.documents?.length || 0}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Messages</p>
                                                        <p className="font-bold text-gray-900">{caseItem.chatHistory?.length || 0}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'clients' && (
                        <motion.div
                            key="clients"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-6">Your Clients</h2>
                            {activeCases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                                    <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">No clients yet</h3>
                                    <p className="text-gray-500 mt-2">Clients will appear here once you accept their case requests.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {activeCases.map(caseItem => (
                                        <motion.div
                                            key={caseItem._id}
                                            whileHover={{ y: -5 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                        >
                                            <div className="text-center mb-4">
                                                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 relative">
                                                    {caseItem.client?.profilePic?.url ? (
                                                        <img src={caseItem.client.profilePic.url} className="w-full h-full object-cover rounded-full" />
                                                    ) : (
                                                        <User className="w-10 h-10 text-indigo-400" />
                                                    )}
                                                    {caseItem.client && isOnline(caseItem.client._id) && (
                                                        <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <h3 className="font-black text-gray-900">{caseItem.client?.name || 'Client'}</h3>
                                                <p className="text-sm text-gray-500">{caseItem.client?.email}</p>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                {caseItem.client?.phone && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone className="w-4 h-4" />
                                                        {caseItem.client.phone}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Briefcase className="w-4 h-4" />
                                                    {caseItem.title.length > 25 ? `${caseItem.title.substring(0, 25)}...` : caseItem.title}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate('/chat', { state: { user: caseItem.client, role: 'client', caseId: caseItem._id } })}
                                                    className="flex-1 bg-indigo-600 text-white py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Chat
                                                </button>
                                                <Link
                                                    to={`/case/${caseItem._id}`}
                                                    className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdvocateDashboard;
