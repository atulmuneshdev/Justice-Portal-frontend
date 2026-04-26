import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import {
    Search, UserPlus, Check, X, MessageSquare,
    Users, Clock, Shield, ChevronRight, User, Mail, Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyNetwork = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('search'); // search, pending, connections
    const [searchQuery, setSearchQuery] = useState('');
    const [advocates, setAdvocates] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'search') fetchAdvocates();
        if (activeTab === 'pending') {
            fetchPendingRequests();
            fetchSentRequests();
        }
        if (activeTab === 'connections') fetchConnections();
    }, [activeTab]);

    const fetchAdvocates = async () => {
        setLoading(true);
        try {
            const endpoint = user?.role === 'client' ? '/users/advocates' : '/users/clients';
            const [usersRes, sentRes] = await Promise.all([
                API.get(`${endpoint}?search=${searchQuery}`),
                API.get('/connections/sent')
            ]);
            setAdvocates(usersRes.data);
            setSentRequests(sentRes.data);
        } catch (error) {
            toast.error(`Failed to load ${user?.role === 'client' ? 'advocates' : 'clients'}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingRequests = async () => {
        setLoading(true);
        try {
            const res = await API.get('/connections/pending');
            setPendingRequests(res.data);
        } catch (error) {
            toast.error('Failed to load pending requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchSentRequests = async () => {
        try {
            const res = await API.get('/connections/sent');
            setSentRequests(res.data);
        } catch (error) {
            console.error('Failed to load sent requests:', error.response?.data || error.message);
        }
    };

    const fetchConnections = async () => {
        setLoading(true);
        try {
            const res = await API.get('/connections/my');
            setConnections(res.data);
        } catch (error) {
            toast.error('Failed to load connections');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async (receiverId) => {
        try {
            await API.post('/connections/request', { receiverId });
            toast.success('Connection request sent');
            fetchAdvocates();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleCancelRequest = async (connectionId) => {
        try {
            await API.delete(`/connections/cancel/${connectionId}`);
            toast.success('Request cancelled');
            if (activeTab === 'search') fetchAdvocates();
            if (activeTab === 'pending') fetchSentRequests();
        } catch (error) {
            toast.error('Failed to cancel request');
        }
    };

    const handleAccept = async (connectionId) => {
        if (!connectionId) {
            console.error('Accept Error: No connection ID provided');
            toast.error('Could not accept request: Missing ID');
            return;
        }
        try {
            await API.put(`/connections/accept/${connectionId}`);
            toast.success('Request accepted');
            fetchPendingRequests();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleReject = async (connectionId) => {
        if (!connectionId) {
            console.error('Reject Error: No connection ID provided');
            toast.error('Could not reject request: Missing ID');
            return;
        }
        try {
            await API.put(`/connections/reject/${connectionId}`);
            toast.success('Request rejected');
            fetchPendingRequests();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    return (
        <div className="pt-24 min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900">
                        {user?.role === 'client' ? 'Find Advocates' : 'Client Network'}
                    </h1>
                    <p className="text-slate-500 font-medium">
                        {user?.role === 'client'
                            ? 'Connect and collaborate with experienced legal professionals'
                            : 'Manage and connect with your potential clients'}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-2xl">
                    <button
                        onClick={() => setActiveTab('search')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'search' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 relative ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Pending
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">
                                {pendingRequests.length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('connections')}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === 'connections' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        <Users className="w-4 h-4" />
                        Connections
                    </button>
                </div>

                {/* Search Bar (Only for Search Tab) */}
                {activeTab === 'search' && (
                    <div className="relative mb-8 max-w-2xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name or specialization..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && fetchAdvocates()}
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 focus:border-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                )}

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {loading ? (
                            [1, 2, 3, 4].map(i => (
                                <div key={i} className="h-72 bg-white rounded-3xl animate-pulse border border-slate-100" />
                            ))
                        ) : activeTab === 'search' ? (
                            advocates.map(adv => (
                                <motion.div
                                    key={adv._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all text-center"
                                >
                                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 mx-auto mb-4 flex items-center justify-center overflow-hidden">
                                        {adv.profilePic?.url ? <img src={adv.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-300" />}
                                    </div>
                                    <h3 className="font-black text-slate-900 mb-1">{adv.name}</h3>
                                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">{adv.specialization}</p>

                                    {sentRequests.some(r => r.receiver && r.receiver._id === adv._id) ? (
                                        <button
                                            onClick={() => {
                                                const req = sentRequests.find(r => r.receiver && r.receiver._id === adv._id);
                                                if (req) handleCancelRequest(req._id);
                                            }}
                                            className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Clock className="w-4 h-4 group-hover:hidden" />
                                            <X className="w-4 h-4 hidden group-hover:block" />
                                            <span className="group-hover:hidden">Pending</span>
                                            <span className="hidden group-hover:block">Cancel</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(adv._id)}
                                            className="w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <UserPlus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                            Connect
                                        </button>
                                    )}
                                </motion.div>
                            ))
                        ) : activeTab === 'pending' ? (
                            <div className="col-span-full space-y-8">
                                {pendingRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-blue-600" /> Received Requests
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {pendingRequests.map(req => (
                                                <motion.div
                                                    key={req._id}
                                                    layout
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                                                        {req.sender.profilePic?.url ? <img src={req.sender.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-300" />}
                                                    </div>
                                                    <h3 className="font-black text-slate-900 text-sm mb-1">{req.sender.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{req.sender.specialization}</p>

                                                    <div className="flex gap-2 w-full">
                                                        <button
                                                            onClick={() => handleAccept(req._id)}
                                                            className="flex-1 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-xs hover:bg-green-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <Check className="w-3 h-3" /> Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req._id)}
                                                            className="flex-1 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <X className="w-3 h-3" /> Reject
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sentRequests.length > 0 && (
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
                                            <Send className="w-5 h-5 text-blue-600" /> Sent Requests
                                        </h2>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {sentRequests.map(req => (
                                                <motion.div
                                                    key={req._id}
                                                    layout
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center opacity-80"
                                                >
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 mb-4 flex items-center justify-center overflow-hidden">
                                                        {req.receiver?.profilePic?.url ? <img src={req.receiver.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-6 h-6 text-slate-300" />}
                                                    </div>
                                                    <h3 className="font-black text-slate-900 text-sm mb-1">{req.receiver?.name}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{req.receiver?.specialization}</p>

                                                    <button
                                                        onClick={() => handleCancelRequest(req._id)}
                                                        className="w-full py-2 bg-slate-50 text-slate-500 rounded-lg font-bold text-xs hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center gap-1"
                                                    >
                                                        <X className="w-3 h-3" /> Cancel Request
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {pendingRequests.length === 0 && sentRequests.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-center col-span-full">
                                        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                            <Clock className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 mb-2">No Pending Requests</h3>
                                        <p className="text-slate-500 max-w-xs">You don't have any incoming or outgoing connection requests at the moment.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            connections.map(conn => (
                                <motion.div
                                    key={conn._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                            {conn.profilePic?.url ? <img src={conn.profilePic.url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-300" />}
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-black text-slate-900 text-sm truncate">{conn.name}</h3>
                                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">{conn.specialization}</p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/chat', { state: { user: conn, role: conn.role || 'advocate' } })}
                                        className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default MyNetwork;
