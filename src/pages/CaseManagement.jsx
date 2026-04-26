import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    Briefcase, Users, MessageSquare, FileText, Plus,
    Clock, CheckCircle, XCircle, Send, Paperclip,
    Eye, ChevronRight, Shield, User,
    Search, Filter, AlertCircle, X, Camera, Trash2, Edit
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CaseManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [cases, setCases] = useState([]);
    const [advocates, setAdvocates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(user?.role === 'client' ? 'my_cases' : 'assigned');
    const [showModal, setShowModal] = useState(false);
    const [editingCase, setEditingCase] = useState(null);
    const [caseForm, setCaseForm] = useState({
        advocateId: '',
        title: '',
        description: '',
        caseType: '',
        ownCase: false,
        casePhotos: []
    });
    const [uploading, setUploading] = useState(false);
    const photoInputRef = useRef(null);

    const caseTypes = ['Criminal', 'Civil', 'Family', 'Corporate', 'Intellectual Property', 'Tax', 'Real Estate', 'Other'];

    useEffect(() => {
        fetchCases();
        if (user?.role === 'client') {
            fetchAdvocates();
        }
    }, [activeTab]);

    const fetchCases = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/cases?tab=${activeTab}`);
            setCases(res.data);
        } catch (error) {
            toast.error('Failed to load cases');
        } finally {
            setLoading(false);
        }
    };

    const fetchAdvocates = async () => {
        try {
            const res = await API.get('/users/advocates');
            setAdvocates(res.data);
        } catch (error) {
            console.error('Failed to load advocates');
        }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        // Validation
        if (!caseForm.title || !caseForm.description || !caseForm.caseType) {
            return toast.error('Please fill all required fields');
        }

        if (!caseForm.ownCase && !caseForm.advocateId) {
            return toast.error('Please select an advocate for this case');
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('title', caseForm.title);
            formData.append('description', caseForm.description);
            formData.append('caseType', caseForm.caseType);

            if (editingCase) {
                formData.append('status', caseForm.status);
                await API.put(`/cases/${editingCase._id}`, caseForm); // Simple JSON for update if no new photos
                toast.success('Case updated successfully');
            } else {
                formData.append('advocateId', caseForm.advocateId);
                formData.append('ownCase', caseForm.ownCase);
                caseForm.casePhotos.forEach((photo) => {
                    formData.append('casePhotos', photo);
                });
                await API.post('/cases', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Case created successfully');
            }

            setShowModal(false);
            resetForm();
            fetchCases();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (caseId) => {
        if (!window.confirm('Are you sure you want to delete this case?')) return;
        try {
            await API.delete(`/cases/${caseId}`);
            setCases(prev => prev.filter(c => c._id !== caseId));
            toast.success('Case deleted successfully');
        } catch (error) {
            toast.error('Failed to delete case');
        }
    };

    const resetForm = () => {
        setCaseForm({
            advocateId: '',
            title: '',
            description: '',
            caseType: '',
            ownCase: false,
            casePhotos: []
        });
        setEditingCase(null);
    };

    const openEditModal = (c) => {
        setEditingCase(c);
        setCaseForm({
            title: c.title,
            description: c.description,
            caseType: c.caseType,
            status: c.status,
            advocateId: c.advocate?._id || '',
            ownCase: c.ownCase
        });
        setShowModal(true);
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
            case 'closed': return <XCircle className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Case Dashboard</h1>
                        <p className="text-gray-500">Manage and track your legal proceedings</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        <Plus className="w-5 h-5" />
                        Create New Case
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-200 mb-8 max-w-2xl">
                    {user?.role === 'client' ? (
                        <button
                            onClick={() => setActiveTab('my_cases')}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'my_cases' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Briefcase className="w-4 h-4" />
                            My Cases
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setActiveTab('assigned')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'assigned' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Users className="w-4 h-4" />
                                Assigned Cases
                            </button>
                            <button
                                onClick={() => setActiveTab('own')}
                                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'own' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Shield className="w-4 h-4" />
                                Own Cases
                            </button>
                        </>
                    )}
                </div>

                {/* Case Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : cases.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-12 text-center">
                        <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">No cases found</h3>
                        <p className="text-gray-500 mt-2">Get started by creating your first legal case.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {cases.map(c => (
                            <motion.div
                                key={c._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all flex flex-col"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col gap-1.5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 uppercase tracking-wider ${getStatusColor(c.status)} w-fit`}>
                                            {getStatusIcon(c.status)}
                                            {c.status}
                                        </span>
                                        <span className="flex items-center gap-1 text-[10px] font-black text-blue-600/70 uppercase tracking-wider">
                                            <FileText className="w-3.5 h-3.5" />
                                            {c.caseType}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400">
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </p>
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-2 line-clamp-1">{c.title}</h3>
                                <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">{c.description}</p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-gray-100">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                                            {user?.role === 'client' ? (
                                                c.advocate?.profilePic?.url ? <img src={c.advocate.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                c.client?.profilePic?.url ? <img src={c.client.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase">{user?.role === 'client' ? 'Advocate' : 'Client'}</p>
                                            <p className="text-sm font-bold text-gray-800">
                                                {user?.role === 'client' ? (c.advocate?.name || 'Assigned') : (c.client?.name || 'Own Case')}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/case/${c._id}`}
                                            className="flex-1 bg-slate-100 text-gray-700 py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                        {(user?.id === c.createdBy || user?.role === 'advocate') && (
                                            <button
                                                onClick={() => openEditModal(c)}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                        )}
                                        {user?.id === c.createdBy && (
                                            <button
                                                onClick={() => handleDelete(c._id)}
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed mt-20 inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white lg:h-[89vh]  w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-2xl font-black text-gray-900">
                                    {editingCase ? 'Edit Case' : 'New Case Request'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateOrUpdate} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase mb-2">Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={caseForm.title}
                                        onChange={e => setCaseForm({ ...caseForm, title: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                                        placeholder="e.g., Property Dispute"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase mb-2">Case Type</label>
                                        <select
                                            required
                                            value={caseForm.caseType}
                                            onChange={e => setCaseForm({ ...caseForm, caseType: e.target.value })}
                                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                                        >
                                            <option value="">Select Type</option>
                                            {caseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    {editingCase ? (
                                        <div>
                                            <label className="block text-sm font-black text-gray-400 uppercase mb-2">Status</label>
                                            <select
                                                required
                                                value={caseForm.status}
                                                onChange={e => setCaseForm({ ...caseForm, status: e.target.value })}
                                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="active">Active</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </div>
                                    ) : (
                                        user?.role === 'client' ? (
                                            <div>
                                                <label className="block text-sm font-black text-gray-400 uppercase mb-2">Select Advocate</label>
                                                <select
                                                    required
                                                    value={caseForm.advocateId}
                                                    onChange={e => setCaseForm({ ...caseForm, advocateId: e.target.value })}
                                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                                                >
                                                    <option value="">Choose Advocate</option>
                                                    {advocates.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex items-end pb-4">
                                                <label className="flex items-center gap-3 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={caseForm.ownCase}
                                                        onChange={e => setCaseForm({ ...caseForm, ownCase: e.target.checked })}
                                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                    <span className="text-sm font-bold text-gray-700">This is my own case</span>
                                                </label>
                                            </div>
                                        )
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-black text-gray-400 uppercase mb-2">Description</label>
                                    <textarea
                                        required
                                        value={caseForm.description}
                                        onChange={e => setCaseForm({ ...caseForm, description: e.target.value })}
                                        className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold resize-none"
                                        rows="4"
                                        placeholder="Describe the case details..."
                                    />
                                </div>

                                {!editingCase && (
                                    <div>
                                        <label className="block text-sm font-black text-gray-400 uppercase mb-2">Upload Documents</label>
                                        <button
                                            type="button"
                                            onClick={() => photoInputRef.current?.click()}
                                            className="w-full p-8 border-2 border-dashed border-slate-200 rounded-2xl hover:border-blue-400 transition-all flex flex-col items-center gap-2"
                                        >
                                            <Camera className="w-8 h-8 text-slate-300" />
                                            <span className="text-slate-400 font-bold">Click to upload files</span>
                                            <input
                                                type="file"
                                                multiple
                                                ref={photoInputRef}
                                                className="hidden"
                                                onChange={e => setCaseForm({ ...caseForm, casePhotos: Array.from(e.target.files) })}
                                            />
                                        </button>
                                        {caseForm.casePhotos.length > 0 && (
                                            <p className="mt-2 text-sm font-bold text-blue-600">
                                                {caseForm.casePhotos.length} files selected
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 p-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="flex-1 p-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                                    >
                                        {uploading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                                        {editingCase ? 'Update Case' : 'Submit Case'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CaseManagement;
