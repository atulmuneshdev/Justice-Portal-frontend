import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';
import {
    ArrowLeft, FileText, Users, MessageSquare, Upload,
    Download, Eye, Clock, CheckCircle, XCircle, Paperclip,
    Image, File, Send, User, Shield, Briefcase, Phone, Mail,
    Trash2, ChevronRight, Search, Plus, MoreVertical, CheckCheck, Check
} from 'lucide-react';

const CaseDetail = () => {
    const { caseId } = useParams();
    const { user } = useAuth();
    const { socket } = useNotification();
    const navigate = useNavigate();

    // States
    const [allCases, setAllCases] = useState([]);
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [listLoading, setListLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const chatEndRef = useRef(null);

    useEffect(() => {
        fetchAllCases();
    }, []);

    useEffect(() => {
        if (caseId) {
            fetchCaseDetails();
            socket?.emit('joinRoom', { roomId: `case:${caseId}` });
        }

        return () => {
            if (caseId) {
                socket?.emit('leaveRoom', { roomId: `case:${caseId}` });
            }
        };
    }, [caseId, socket]);

    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (String(message.caseId) === String(caseId)) {
                setCaseData(prev => {
                    // Check if already exists
                    if (prev?.chatHistory?.find(m => m._id === message._id)) return prev;

                    // Check for optimistic duplicate
                    const messageText = message.text || message.message || message.content;
                    const isOptimisticDuplicate = prev?.chatHistory?.find(m =>
                        m.sending &&
                        String(m.sender) === String(message.sender) &&
                        (m.text === messageText || m.message === messageText)
                    );

                    if (isOptimisticDuplicate) {
                        return {
                            ...prev,
                            chatHistory: prev.chatHistory.map(m => m._id === isOptimisticDuplicate._id ? message : m)
                        };
                    }

                    return {
                        ...prev,
                        chatHistory: [...(prev?.chatHistory || []), message]
                    };
                });

                // Mark seen if it's for us
                if (message.sender !== user?.id) {
                    socket.emit('mark_seen', { messageId: message._id, senderId: message.sender });
                }
            }
            fetchAllCases(); // Refresh sidebar for unread counts
        };

        const handleMessageDelivered = ({ messageId }) => {
            setCaseData(prev => ({
                ...prev,
                chatHistory: prev?.chatHistory?.map(m => m._id === messageId ? { ...m, delivered: true } : m)
            }));
        };

        const handleMessageSeen = ({ messageId }) => {
            setCaseData(prev => ({
                ...prev,
                chatHistory: prev?.chatHistory?.map(m => m._id === messageId ? { ...m, seen: true, delivered: true } : m)
            }));
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('message_delivered', handleMessageDelivered);
        socket.on('message_seen', handleMessageSeen);

        return () => {
            socket.off('receiveMessage');
            socket.off('message_delivered');
            socket.off('message_seen');
        };
    }, [socket, caseId, user?.id]);

    useEffect(() => {
        scrollToBottom();
    }, [caseData?.chatHistory]);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchAllCases = async () => {
        setListLoading(true);
        try {
            const res = await API.get('/cases');
            setAllCases(res.data);
        } catch (error) {
            console.error('Failed to load cases list');
        } finally {
            setListLoading(false);
        }
    };

    const fetchCaseDetails = async () => {
        setLoading(true);
        try {
            const res = await API.get(`/cases/${caseId}`);
            setCaseData(res.data);

            // Mark unread messages as seen
            if (socket && res.data.chatHistory?.length > 0) {
                const unreadMessages = res.data.chatHistory.filter(m =>
                    String(m.sender) !== String(user?.id) && !m.seen
                );
                unreadMessages.forEach(m => {
                    socket.emit('mark_seen', { messageId: m._id, senderId: m.sender });
                });
            }
        } catch (error) {
            toast.error('Failed to load case details');
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const tempId = Date.now().toString();
        const tempMessage = {
            _id: tempId,
            sender: user?.id,
            message: message,
            text: message,
            type: 'text',
            timestamp: new Date().toISOString(),
            caseId: caseId,
            sending: true
        };

        // Optimistic update
        setCaseData(prev => ({
            ...prev,
            chatHistory: [...(prev?.chatHistory || []), tempMessage]
        }));

        const messageToSend = message;
        setMessage('');

        try {
            socket?.emit('sendMessage', {
                text: messageToSend,
                receiver: otherParty._id,
                caseId: caseId,
                chatType: 'case',
                optimisticId: tempId
            });
            // Case history is updated via 'receiveMessage' event
        } catch (error) {
            toast.error('Failed to send message');
            setCaseData(prev => ({
                ...prev,
                chatHistory: prev.chatHistory.filter(m => m._id !== tempId)
            }));
            setMessage(messageToSend);
        }
    };

    const handleDeleteCase = async () => {
        if (!window.confirm('Are you sure you want to delete this case?')) return;
        try {
            await API.delete(`/cases/${caseId}`);
            toast.success('Case deleted successfully');
            navigate('/dashboard');
        } catch (error) {
            toast.error('Failed to delete case');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'active': return 'bg-green-100 text-green-700 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredCases = allCases.filter(c =>
        (c?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading && !caseData) {
        return (
            <div className="pt-24 h-screen flex items-center justify-center bg-slate-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isClient = user?.role === 'client';
    const otherParty = isClient ? caseData?.advocate : caseData?.client;

    return (
        <div className="pt-20 h-screen bg-white flex overflow-hidden">
            {/* Left Sidebar - All Cases */}
            <div className="hidden lg:flex w-80 flex-col border-r border-slate-100 bg-slate-50/50">
                <div className="p-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-black text-xl text-slate-900">Case List</h2>
                        <Link to="/cases" className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all">
                            <Plus className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {listLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-slate-100" />
                        ))
                    ) : filteredCases.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-400 text-sm font-bold">No cases found</p>
                        </div>
                    ) : (
                        filteredCases.map(c => (
                            <Link
                                key={c._id}
                                to={`/case/${c._id}`}
                                className={`block p-4 rounded-2xl transition-all border ${c._id === caseId
                                    ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-100'
                                    : 'bg-white border-slate-100 hover:border-blue-200'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${c._id === caseId ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {c.status}
                                    </span>
                                    <span className={`text-[9px] font-bold ${c._id === caseId ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {new Date(c.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className={`font-bold text-sm truncate ${c._id === caseId ? 'text-white' : 'text-slate-900'}`}>
                                        {c.title}
                                    </h3>
                                    {c.unreadCount > 0 && (
                                        <span className="bg-green-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                                            {c.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <p className={`text-[10px] font-medium mt-1 ${c._id === caseId ? 'text-blue-100' : 'text-slate-500'}`}>
                                    {isClient ? c.advocate?.name : c.client?.name || 'Own Case'}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Main Content - Case Details */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                {/* Header */}
                <div className="px-8 py-4 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-xl font-black text-slate-900 leading-tight">{caseData?.title}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusColor(caseData?.status)}`}>
                                    {caseData?.status}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{caseData?.caseType}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDeleteCase}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Case"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="h-8 w-px bg-slate-100 mx-2" />
                        <div className="flex items-center gap-3 bg-slate-50 p-1.5 pr-4 rounded-2xl border border-slate-100">
                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden">
                                {otherParty?.profilePic?.url ? (
                                    <img src={otherParty.profilePic.url} className="w-full h-full object-cover" />
                                ) : <User className="w-4 h-4 text-slate-400" />}
                            </div>
                            <div className="hidden sm:block text-left">
                                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-0.5">{isClient ? 'Advocate' : 'Client'}</p>
                                <p className="text-xs font-bold text-slate-700 leading-none">{otherParty?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                    {/* Left: Chat & Info */}
                    <div className="flex-1 flex flex-col min-w-0 border-r border-slate-100">
                        {/* Case Info Cards */}
                        <div className="p-8 pb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Description</h4>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed italic line-clamp-3">
                                    "{caseData?.description}"
                                </p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Documents ({caseData?.casePhotos?.length || 0})</h4>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {caseData?.casePhotos?.length > 0 ? (
                                        caseData.casePhotos.map((img, idx) => (
                                            <div key={idx} className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 shrink-0">
                                                <img src={img.url} className="w-full h-full object-cover rounded-lg" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-slate-400 font-bold italic">No documents uploaded</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Chat Section */}
                        <div className="flex-1 flex flex-col p-8 pt-4 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <MessageSquare className="w-4 h-4 text-blue-600" />
                                <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Case Discussion</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-4 space-y-4 mb-6">
                                {caseData?.chatHistory?.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                        <MessageSquare className="w-12 h-12 mb-2 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest opacity-50">Start the conversation</p>
                                    </div>
                                ) : (
                                    caseData?.chatHistory?.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.sender === user?.id ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-3xl ${msg.sender === user?.id
                                                ? 'bg-blue-600 text-white rounded-tr-none'
                                                : 'bg-slate-100 text-slate-700 rounded-tl-none'
                                                }`}>
                                                <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                                                <div className="flex items-center justify-between gap-4 mt-2">
                                                    <span className={`text-[9px] font-bold ${msg.sender === user?.id ? 'text-blue-200' : 'text-slate-400'
                                                        }`}>
                                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {msg.sender === user?.id && (
                                                        <span className={msg.seen ? 'text-blue-300' : msg.delivered ? 'text-blue-200' : 'text-blue-100'}>
                                                            {msg.sending ? (
                                                                <Clock size={10} className="animate-pulse" />
                                                            ) : msg.seen || msg.delivered ? (
                                                                <CheckCheck size={12} />
                                                            ) : (
                                                                <Check size={12} />
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="relative">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="w-full pl-6 pr-16 py-4 bg-slate-50 border-2 border-slate-100 rounded-3xl text-sm font-bold focus:border-blue-500 outline-none transition-all"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right: Detailed Side Info */}
                    <div className="hidden xl:flex w-80 flex-col p-8 bg-slate-50/30 overflow-y-auto">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Case Timeline</h4>
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                                            <div className="w-px flex-1 bg-slate-200 my-1" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900">Case Created</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                {new Date(caseData?.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className={`w-2 h-2 rounded-full ${caseData?.status !== 'pending' ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-200'}`} />
                                            <div className="w-px flex-1 bg-slate-200 my-1" />
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black ${caseData?.status !== 'pending' ? 'text-slate-900' : 'text-slate-300'}`}>Activated</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">Status: {caseData?.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{isClient ? 'Assigned Advocate' : 'Client Info'}</h4>
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 mx-auto mb-3 flex items-center justify-center overflow-hidden">
                                        {otherParty?.profilePic?.url ? (
                                            <img src={otherParty.profilePic.url} className="w-full h-full object-cover" />
                                        ) : <User className="w-6 h-6 text-slate-300" />}
                                    </div>
                                    <h5 className="font-black text-slate-900 text-sm">{otherParty?.name}</h5>
                                    <p className="text-[10px] font-bold text-blue-600 mt-0.5">{otherParty?.specialization || 'N/A'}</p>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold truncate">{otherParty?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span className="text-[10px] font-bold">{otherParty?.phone || 'No phone'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
