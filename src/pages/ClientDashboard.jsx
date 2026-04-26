import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    Briefcase, Users, MessageSquare, FileText, Plus,
    Clock, CheckCircle, XCircle, Send, Paperclip,
    Download, Eye, ChevronRight, Shield, User,
    Search, Filter, AlertCircle, Phone, Mail, MapPin,
    Star, Upload, Image, File, X, Camera, DollarSign, Trash2
} from 'lucide-react';

const ClientDashboard = () => {
    const { user } = useAuth();
    const { isOnline } = useNotification();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [advocates, setAdvocates] = useState([]);
    const [connectedAdvocates, setConnectedAdvocates] = useState([]);
    const [activeTab, setActiveTab] = useState('cases');
    const [loading, setLoading] = useState(true);
    const [showNewCaseModal, setShowNewCaseModal] = useState(false);
    const [caseForm, setCaseForm] = useState({
        advocateId: '',
        title: '',
        description: '',
        caseType: '',
        casePhotos: []
    });
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const photoInputRef = useRef(null);

    const caseTypes = ['Criminal', 'Civil', 'Family', 'Corporate', 'Intellectual Property', 'Tax', 'Real Estate', 'Other'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [casesRes, advocatesRes] = await Promise.all([
                API.get('/cases'),
                API.get('/users/advocates')
            ]);
            setCases(casesRes.data);
            setAdvocates(advocatesRes.data);

            const connected = casesRes.data
                .filter(c => (c.status === 'accepted' || c.status === 'active') && c.advocate)
                .map(c => c.advocate);
            setConnectedAdvocates(connected);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCase = async (e) => {
        e.preventDefault();

        // Validation
        if (!caseForm.advocateId) {
            return toast.error('Please select an advocate');
        }
        if (!caseForm.title || !caseForm.description || !caseForm.caseType) {
            return toast.error('Please fill all required fields');
        }

        try {
            const formData = new FormData();
            formData.append('advocateId', caseForm.advocateId);
            formData.append('title', caseForm.title);
            formData.append('description', caseForm.description);
            formData.append('caseType', caseForm.caseType);

            caseForm.casePhotos.forEach((photo) => {
                formData.append('casePhotos', photo);
            });

            await API.post('/cases', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Case request sent successfully!');
            setShowNewCaseModal(false);
            setCaseForm({ advocateId: '', title: '', description: '', caseType: '', casePhotos: [] });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create case');
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

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length + caseForm.casePhotos.length > 5) {
            toast.error('Maximum 5 photos allowed');
            return;
        }
        setCaseForm(prev => ({
            ...prev,
            casePhotos: [...prev.casePhotos, ...files]
        }));
    };

    const removePhoto = (index) => {
        setCaseForm(prev => ({
            ...prev,
            casePhotos: prev.casePhotos.filter((_, i) => i !== index)
        }));
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

    const activeCases = cases.filter(c => c.status === 'active');
    const pendingCases = cases.filter(c => c.status === 'pending');

    return (
        <div className="pt-24 min-h-screen bg-linear-to-br from-slate-50 to-blue-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">Client Dashboard</h1>
                            <p className="text-blue-600 font-semibold">Welcome, {user?.name || 'Client'}!</p>
                        </div>
                    </div>
                    <p className="text-gray-500 mt-2">Manage your legal cases and connect with advocates</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Active Cases</p>
                                <p className="text-3xl font-black text-blue-600">{activeCases.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                <Briefcase className="w-7 h-7 text-blue-600" />
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
                                <p className="text-gray-500 font-semibold text-sm">Connected Advocates</p>
                                <p className="text-3xl font-black text-green-600">{connectedAdvocates.length}</p>
                            </div>
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                                <Users className="w-7 h-7 text-green-600" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ y: -4 }}
                        className="bg-white p-6 rounded-2xl shadow-lg border border-purple-100"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 font-semibold text-sm">Total Messages</p>
                                <p className="text-3xl font-black text-purple-600">
                                    {cases.reduce((sum, c) => sum + (c.chatHistory?.length || 0), 0)}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                                <MessageSquare className="w-7 h-7 text-purple-600" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-2xl">
                    <button
                        onClick={() => setActiveTab('cases')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'cases' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Briefcase className="w-4 h-4" />
                        My Cases
                    </button>
                    <button
                        onClick={() => setActiveTab('advocates')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'advocates' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Users className="w-4 h-4" />
                        Advocates
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <MessageSquare className="w-4 h-4" />
                        Chat
                    </button>
                </div>

                <AnimatePresence mode='wait'>
                    {activeTab === 'cases' && (
                        <motion.div
                            key="cases"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-black text-gray-900">My Cases</h2>
                                <button
                                    onClick={() => setShowNewCaseModal(true)}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    <Plus className="w-4 h-4" />
                                    New Case Request
                                </button>
                            </div>

                            {loading ? (
                                <div className="grid gap-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-100" />
                                    ))}
                                </div>
                            ) : cases.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                                    <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">No cases yet</h3>
                                    <p className="text-gray-500 mt-2">Start by finding an advocate and submitting a case request.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {cases.map(caseItem => (
                                        <motion.div
                                            key={caseItem._id}
                                            whileHover={{ x: 4 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex gap-4">
                                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                                                        <FileText className="w-7 h-7 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-gray-900 text-lg">{caseItem.title}</h3>
                                                        <p className="text-gray-500 text-sm mt-1">{caseItem.description.substring(0, 80)}...</p>
                                                        <div className="flex items-center gap-4 mt-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(caseItem.status)}`}>
                                                                {getStatusIcon(caseItem.status)}
                                                                {caseItem.status.toUpperCase()}
                                                            </span>
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(caseItem.createdAt).toLocaleDateString()}
                                                            </span>
                                                            {caseItem.documents?.length > 0 && (
                                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                    <Paperclip className="w-3 h-3" />
                                                                    {caseItem.documents.length} docs
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    {caseItem.status === 'accepted' && (
                                                        <>
                                                            <button
                                                                onClick={() => navigate('/chat', { state: { user: caseItem.advocate, role: 'advocate', caseId: caseItem._id } })}
                                                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                                            >
                                                                <MessageSquare className="w-5 h-5" />
                                                            </button>
                                                            <Link
                                                                to={`/case/${caseItem._id}`}
                                                                className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all"
                                                            >
                                                                <Eye className="w-5 h-5" />
                                                            </Link>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDeleteCase(caseItem._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                                        title="Delete Case"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                            {caseItem.advocate && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center overflow-hidden">
                                                        {caseItem.advocate.profilePic?.url ? (
                                                            <img src={caseItem.advocate.profilePic.url} className="w-full h-full object-cover rounded-xl" />
                                                        ) : (
                                                            <User className="w-5 h-5 text-indigo-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{caseItem.advocate.name}</p>
                                                        <p className="text-xs text-gray-500">{caseItem.advocate.specialization}</p>
                                                    </div>
                                                    {isOnline(caseItem.advocate._id) && (
                                                        <span className="ml-auto text-xs text-green-600 font-bold flex items-center gap-1">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            Online
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'advocates' && (
                        <motion.div
                            key="advocates"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-6">Find Advocates</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {advocates.filter(a => a._id !== user.id).map(adv => {
                                    const hasActiveCase = activeCases.some(c => c.advocate?._id === adv._id);
                                    const hasPendingCase = pendingCases.some(c => c.advocate?._id === adv._id);

                                    return (
                                        <motion.div
                                            key={adv._id}
                                            whileHover={{ y: -5 }}
                                            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all"
                                        >
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center overflow-hidden border border-blue-100 relative">
                                                    {adv.profilePic?.url ? (
                                                        <img src={adv.profilePic.url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User className="w-8 h-8 text-blue-500" />
                                                    )}
                                                    {isOnline(adv._id) && (
                                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900">{adv.name}</h3>
                                                    <p className="text-blue-600 text-sm font-semibold">{adv.specialization || 'General Advocate'}</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Shield className="w-4 h-4" />
                                                    <span>{adv.experience || 0} years experience</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                    <Star className="w-4 h-4 text-yellow-400" />
                                                    <span>{adv.rating || 'New'}</span>
                                                </div>
                                                {adv.location && (
                                                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                        <MapPin className="w-4 h-4" />
                                                        <span>{adv.location}</span>
                                                    </div>
                                                )}
                                            </div>
                                            {hasActiveCase && (
                                                <div className="mb-3 p-2 bg-green-50 rounded-lg text-center">
                                                    <span className="text-green-700 text-xs font-bold">Connected - Case Active</span>
                                                </div>
                                            )}
                                            {hasPendingCase && (
                                                <div className="mb-3 p-2 bg-yellow-50 rounded-lg text-center">
                                                    <span className="text-yellow-700 text-xs font-bold">Request Pending</span>
                                                </div>
                                            )}
                                            {!hasActiveCase && !hasPendingCase && (
                                                <button
                                                    onClick={() => {
                                                        setCaseForm({ ...caseForm, advocateId: adv._id });
                                                        setShowNewCaseModal(true);
                                                    }}
                                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Send className="w-4 h-4" />
                                                    Send Case Request
                                                </button>
                                            )}
                                            {hasActiveCase && (
                                                <button
                                                    onClick={() => {
                                                        const caseItem = activeCases.find(c => c.advocate?._id === adv._id);
                                                        navigate('/chat', { state: { user: adv, role: 'advocate', caseId: caseItem._id } });
                                                    }}
                                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message Advocate
                                                </button>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h2 className="text-xl font-black text-gray-900 mb-6">Chats with Advocates</h2>
                            {connectedAdvocates.length === 0 ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                                    <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-gray-800">No active chats</h3>
                                    <p className="text-gray-500 mt-2">Accept a case to start chatting with an advocate.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {activeCases.filter(c => c.advocate).map(caseItem => (
                                        <motion.div
                                            key={caseItem._id}
                                            whileHover={{ x: 4 }}
                                            onClick={() => navigate('/chat', { state: { user: caseItem.advocate, role: 'advocate', caseId: caseItem._id } })}
                                            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                                        >
                                            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center relative">
                                                {caseItem.advocate?.profilePic?.url ? (
                                                    <img src={caseItem.advocate.profilePic.url} alt={caseItem.advocate.name || 'Advocate'} className="w-full h-full object-cover rounded-2xl" />
                                                ) : (
                                                    <User className="w-7 h-7 text-blue-500" />
                                                )}
                                                {caseItem.advocate && isOnline(caseItem.advocate._id) && (
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-gray-900">{caseItem.advocate?.name}</h4>
                                                <p className="text-sm text-gray-500 truncate">{caseItem.title}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400">{caseItem.chatHistory?.length || 0} msgs</span>
                                                <ChevronRight className="w-5 h-5 text-gray-400 mt-1" />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {showNewCaseModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowNewCaseModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900">New Case Request</h2>
                                <button
                                    onClick={() => setShowNewCaseModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-xl"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <form onSubmit={handleCreateCase} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Advocate</label>
                                    <select
                                        required
                                        value={caseForm.advocateId}
                                        onChange={e => setCaseForm({ ...caseForm, advocateId: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Choose an advocate...</option>
                                        {advocates.filter(a => a._id !== user.id).map(adv => (
                                            <option key={adv._id} value={adv._id}>{adv.name} - {adv.specialization}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Case Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={caseForm.title}
                                        onChange={e => setCaseForm({ ...caseForm, title: e.target.value })}
                                        placeholder="Brief case description"
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Case Type</label>
                                    <select
                                        required
                                        value={caseForm.caseType}
                                        onChange={e => setCaseForm({ ...caseForm, caseType: e.target.value })}
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                                    >
                                        <option value="">Select case type...</option>
                                        {caseTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        required
                                        value={caseForm.description}
                                        onChange={e => setCaseForm({ ...caseForm, description: e.target.value })}
                                        placeholder="Detailed description of your legal matter..."
                                        rows="4"
                                        className="w-full p-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Case Photos (Optional, max 5)</label>
                                    <div className="flex gap-2 mb-2">
                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current?.click()}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-bold hover:bg-blue-100 transition-colors"
                                        >
                                            <Camera className="w-4 h-4" />
                                            Add Photos
                                        </button>
                                        <input
                                            ref={photoInputRef}
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoUpload}
                                            className="hidden"
                                        />
                                    </div>
                                    {caseForm.casePhotos.length > 0 && (
                                        <div className="flex gap-2 flex-wrap">
                                            {caseForm.casePhotos.map((photo, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={URL.createObjectURL(photo)}
                                                        alt={`Case photo ${index + 1}`}
                                                        className="w-20 h-20 object-cover rounded-xl"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removePhoto(index)}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewCaseModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {uploading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Request
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ClientDashboard;