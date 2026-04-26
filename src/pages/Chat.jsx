import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import {
    Send, Search, Phone, Video, CheckCheck, MessageSquare,
    User, MoreVertical, Briefcase, Check, Download,
    Moon, Sun, ArrowLeft, FileText, Paperclip, Shield,
    Smile, Trash2, X, Clock, Image as ImageIconLucide
} from 'lucide-react';
import toast from 'react-hot-toast';
import EmojiPicker from 'emoji-picker-react';

const Chat = () => {
    const { user } = useAuth();
    const { socket, isOnline } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();

    // States
    const [connections, setConnections] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [caseId, setCaseId] = useState(null);
    const [caseDetails, setCaseDetails] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [partnerTyping, setPartnerTyping] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showMobileList, setShowMobileList] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [attachments, setAttachments] = useState([]);

    // Refs
    const typingTimeoutRef = useRef(null);
    const scrollRef = useRef();
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);
    const emojiPickerRef = useRef(null);

    const isClient = user?.role === 'client';
    const dark = isDarkMode;

    // Initialize from location state
    useEffect(() => {
        if (location.state?.user) {
            const chatPartner = location.state.user;
            const chatType = location.state.caseId ? 'case' : 'network';

            setSelectedChat({
                user: chatPartner,
                role: location.state.role,
                isConnected: true,
                caseId: location.state.caseId,
                chatType: chatType
            });
            setShowMobileList(false);
        }
    }, [location.state]);

    // Socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            //  GUARD: Ensure we have a selected chat and the message is valid
            if (!selectedChat?.user?._id) return;

            const messageSenderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
            const messageReceiverId = typeof message.receiver === 'object' ? message.receiver._id : message.receiver;
            const messageCaseId = typeof message.caseId === 'object' ? message.caseId._id : message.caseId;

            // FIX 1: Check if message belongs to the current open conversation
            const isRelatedToSelected = (
                String(messageSenderId) === String(selectedChat.user._id) ||
                String(messageReceiverId) === String(selectedChat.user._id)
            );

            // FIX 2: Check if message belongs to the specific Case or is a Private Chat
            const isCorrectCase = selectedChat.chatType === 'case'
                ? String(messageCaseId) === String(selectedChat.caseId)
                : !messageCaseId;

            if (isRelatedToSelected && isCorrectCase) {
                setMessages((prev) => {
                    //  Prevent duplicate messages (by DB _id)
                    if (prev.some(m => m._id === message._id)) return prev;

                    // ⚡ Handle Optimistic UI replacement
                    if (message.optimisticId) {
                        const updated = prev.map(m => m._id === message.optimisticId ? { ...message, sending: false } : m);
                        // If no message was updated (meaning optimistic was already replaced or missing), just add it
                        if (JSON.stringify(updated) === JSON.stringify(prev)) {
                            return [...prev, message];
                        }
                        return updated;
                    }

                    return [...prev, message];
                });

                //  Auto-mark as seen if we are the receiver
                if (String(messageSenderId) === String(selectedChat.user._id)) {
                    socket.emit('mark_seen', {
                        messageId: message._id,
                        senderId: messageSenderId
                    });
                }
            }
            fetchConnections(); // Update sidebar on any new message
        };

        const handleMessageDelivered = ({ messageId }) => {
            setMessages(prev => prev.map(m =>
                m._id === messageId ? { ...m, delivered: true } : m
            ));
        };

        const handleMessageSeen = ({ messageId }) => {
            setMessages(prev => prev.map(m =>
                m._id === messageId ? { ...m, seen: true, delivered: true } : m
            ));
        };

        const handleTyping = ({ senderId, caseId: incomingCaseId }) => {
            if (selectedChat) {
                const isMatch = selectedChat.chatType === 'case'
                    ? String(incomingCaseId) === String(selectedChat.caseId)
                    : String(senderId) === String(selectedChat.user._id);

                if (isMatch) setPartnerTyping(true);
            }
        };

        const handleStopTyping = ({ senderId, caseId: incomingCaseId }) => {
            if (selectedChat) {
                const isMatch = selectedChat.chatType === 'case'
                    ? String(incomingCaseId) === String(selectedChat.caseId)
                    : String(senderId) === String(selectedChat.user._id);

                if (isMatch) setPartnerTyping(false);
            }
        };

        socket.on('receiveMessage', handleReceiveMessage);
        socket.on('message_delivered', handleMessageDelivered);
        socket.on('message_seen', handleMessageSeen);
        socket.on('typing', handleTyping);
        socket.on('stopTyping', handleStopTyping);

        return () => {
            socket.off('receiveMessage');
            socket.off('message_delivered');
            socket.off('message_seen');
            socket.off('typing');
            socket.off('stopTyping');
        };
    }, [socket, selectedChat]);

    // Fetch connections on mount
    useEffect(() => {
        fetchConnections();
    }, []);

    // Handle chat selection changes
    useEffect(() => {
        if (selectedChat) {
            const currentCaseId = selectedChat.chatType === 'case' ? selectedChat.caseId : null;
            fetchMessages(selectedChat.user._id, selectedChat.chatType, currentCaseId);

            if (selectedChat.chatType === 'case' && selectedChat.caseId) {
                setCaseId(selectedChat.caseId);
                fetchCaseDetails(selectedChat.caseId);
                socket?.emit('joinRoom', { roomId: `case:${selectedChat.caseId}` });
            } else {
                setCaseId(null);
                setCaseDetails(null);
            }
            setShowMobileList(false);
        }

        return () => {
            if (selectedChat?.chatType === 'case' && selectedChat.caseId) {
                socket?.emit('leaveRoom', { roomId: `case:${selectedChat.caseId}` });
            }
        };
    }, [selectedChat, socket]);

    // Scroll to bottom on new messages
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, partnerTyping]);

    // Close emoji picker on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchConnections = async () => {
        try {
            setLoading(true);
            
            //  Individual error handling for each call to prevent total failure
            const [casesResult, networkResult, chatListResult] = await Promise.allSettled([
                API.get('/cases'),
                API.get('/connections/my'),
                API.get('/chat/list')
            ]);

            if (casesResult.status === 'rejected') console.error('Cases Load Error:', casesResult.reason);
            if (networkResult.status === 'rejected') console.error('Network Load Error:', networkResult.reason);
            if (chatListResult.status === 'rejected') console.error('ChatList Load Error:', chatListResult.reason);

            const casesData = casesResult.status === 'fulfilled' ? casesResult.value.data : [];
            const networkData = networkResult.status === 'fulfilled' ? networkResult.value.data : [];
            const chatListData = chatListResult.status === 'fulfilled' ? chatListResult.value.data : [];

            const casePeople = casesData
                .filter(c => c && (c.status === 'accepted' || c.status === 'active'))
                .map(c => {
                    const person = isClient ? c.advocate : c.client;
                    if (!person || !person._id) return null;
                    return {
                        ...person,
                        caseId: c._id,
                        caseTitle: c.title,
                        chatType: 'case',
                        lastMessage: c.lastMessage,
                        unreadCount: c.unreadCount || 0
                    };
                })
                .filter(Boolean);

            const networkPeople = (networkData || [])
                .filter(p => p && p._id && p.name)
                .map(p => ({
                    ...p,
                    chatType: 'network'
                }));

            const directChatPeople = (chatListData || [])
                .filter(p => p && p._id && p.name)
                .map(p => ({
                    ...p,
                    chatType: 'network'
                }));

            // Merge everything uniquely by _id and caseId
            const combined = [...casePeople, ...networkPeople, ...directChatPeople];
            const uniqueMap = new Map();

            combined.forEach(p => {
                if (!p || !p._id) return;
                const key = p.caseId ? `case-${p.caseId}` : `direct-${p._id}`;
                
                if (!uniqueMap.has(key)) {
                    uniqueMap.set(key, p);
                } else {
                    const existing = uniqueMap.get(key);
                    // Prefer the one with actual message data or unread count
                    const hasMoreInfo = (p.unreadCount > 0 && !existing.unreadCount) || 
                                       (p.lastMessage && !existing.lastMessage);
                    if (hasMoreInfo) {
                        uniqueMap.set(key, p);
                    }
                }
            });

            setConnections(Array.from(uniqueMap.values()));
        } catch (error) {
            console.error('CRITICAL: Failed to load connections:', error);
            toast.error('Failed to load chat list');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (userId, chatType, currentCaseId) => {
        try {
            let endpoint = chatType === 'case'
                ? `/cases/${currentCaseId}/chat`
                : `/messages/${userId}`;

            const { data } = await API.get(endpoint);
            setMessages(data);

            // Mark unread messages as seen
            if (socket && data.length > 0) {
                const unreadMessages = data.filter(m => m.sender !== user._id && !m.seen);
                unreadMessages.forEach(m => {
                    socket.emit('mark_seen', { messageId: m._id, senderId: m.sender });
                });
            }
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const fetchCaseDetails = async (id) => {
        try {
            const { data } = await API.get(`/cases/${id}`);
            setCaseDetails(data);
        } catch (error) {
            console.error('Failed to load case details');
        }
    };

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        if (!newMessage.trim() && attachments.length === 0) return;

        const messageToSend = newMessage;
        const tempId = Date.now().toString();

        const tempMessage = {
            _id: tempId,
            sender: user._id,
            receiver: selectedChat.user._id,
            text: messageToSend,
            message: messageToSend,
            type: attachments.length > 0 ? 'file' : 'text',
            messageType: attachments.length > 0 ? 'file' : 'text',
            attachments: attachments.map(f => ({ name: f.name, type: f.type.startsWith('image/') ? 'image' : 'file', url: URL.createObjectURL(f) })),
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            caseId: selectedChat.caseId,
            sending: true
        };

        // Optimistic update
        setMessages(prev => [...prev, tempMessage]);
        setNewMessage('');
        setAttachments([]);
        setShowEmojiPicker(false);

        try {
            if (attachments.length > 0) {
                // Files still need REST for multipart/form-data
                let res;
                if (selectedChat.chatType === 'case') {
                    res = await API.post(`/cases/${selectedChat.caseId}/chat`, {
                        message: messageToSend,
                        type: 'file'
                    });
                    socket?.emit('sendMessage', {
                        ...res.data.chatMessage,
                        receiver: selectedChat.user._id,
                        caseId: selectedChat.caseId
                    });
                } else {
                    const formData = new FormData();
                    formData.append('receiverId', selectedChat.user._id);
                    formData.append('receiverModel', selectedChat.user.role === 'client' ? 'Client' : 'Advocate');
                    formData.append('text', messageToSend);
                    attachments.forEach(file => formData.append('attachments', file));
                    res = await API.post('/messages/send', formData);
                    socket?.emit('sendMessage', {
                        ...res.data,
                        receiver: selectedChat.user._id
                    });
                }
                setMessages(prev => prev.map(m => m._id === tempId ? { ...(res.data.chatMessage || res.data), sending: false } : m));
            } else {
                // TEXT-ONLY: Send directly via WebSocket for maximum speed
                socket?.emit('sendMessage', {
                    text: messageToSend,
                    receiver: selectedChat.user._id,
                    receiverModel: selectedChat.user.role === 'client' ? 'Client' : 'Advocate',
                    caseId: selectedChat.caseId,
                    chatType: selectedChat.chatType,
                    optimisticId: tempId // Pass this so backend can acknowledge
                });
                // Note: UI will be updated via 'receiveMessage' event from socket
            }
            fetchConnections();
        } catch (error) {
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m._id !== tempId));
            setNewMessage(messageToSend);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && selectedChat) {
            const typingData = selectedChat.chatType === 'case'
                ? { caseId: selectedChat.caseId }
                : { receiver: selectedChat.user._id };

            socket.emit('typing', typingData);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('stopTyping', typingData);
            }, 2000);
        }
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024);
        if (validFiles.length < files.length) toast.error('Some files exceed 10MB limit');
        setAttachments(prev => [...prev, ...validFiles]);
    };

    const removeAttachment = (index) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage(prev => prev + emojiData.emoji);
    };

    const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const getLastMessageText = (msg) => {
        if (!msg) return null;
        if (typeof msg === 'string') return msg;
        return msg.text || msg.message || msg.content || (msg.attachments?.length > 0 ? 'Sent an attachment' : '');
    };

    const groupMessagesByDate = (messages) => {
        const groups = {};
        messages.forEach(msg => {
            const date = new Date(msg.createdAt || msg.timestamp).toLocaleDateString();
            if (!groups[date]) groups[date] = [];
            groups[date].push(msg);
        });
        return groups;
    };

    const getRelativeDate = (dateStr) => {
        const today = new Date().toLocaleDateString();
        const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();
        if (dateStr === today) return 'Today';
        if (dateStr === yesterday) return 'Yesterday';
        return dateStr;
    };

    const messageGroups = groupMessagesByDate(messages);

    return (
        <div className={`h-screen w-full flex overflow-hidden pt-20 ${dark ? 'bg-[#0b141a] text-white' : 'bg-[#f0f2f5] text-slate-900'}`}>
            {/* Sidebar */}
            <div className={`${showMobileList ? 'flex' : 'hidden'} md:flex w-full md:w-80 lg:w-96 flex-col border-r ${dark ? 'border-slate-800' : 'border-slate-200'} bg-white`}>
                <div className="p-4 border-b border-slate-100 bg-[#f0f2f5]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden">
                            {user?.profilePic?.url ? <img src={user.profilePic.url} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400 m-auto mt-2" />}
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsDarkMode(!dark)} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-all">
                                {dark ? <Sun size={20} /> : <Moon size={20} />}
                            </button>
                            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-all">
                                <MessageSquare size={20} />
                            </button>
                            <button className="p-2 rounded-full text-slate-500 hover:bg-slate-200 transition-all">
                                <MoreVertical size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search or start new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-2 bg-white border-none rounded-xl text-sm focus:outline-none shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto bg-white">
                    {connections.filter(c => (c?.name || '').toLowerCase().includes(searchQuery.toLowerCase())).map(person => (
                        <button
                            key={person.caseId ? `${person._id}-${person.caseId}` : person._id}
                            onClick={() => setSelectedChat({ user: person, chatType: person.chatType, caseId: person.caseId })}
                            className={`w-full p-3 flex items-center gap-3 transition-all border-b border-slate-50 ${selectedChat?.user?._id === person._id && selectedChat?.caseId === person.caseId
                                ? 'bg-[#f0f2f5]'
                                : 'bg-white hover:bg-[#f5f6f6]'
                                }`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                    {person.profilePic?.url ? <img src={person.profilePic.url} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-300" />}
                                </div>
                                {isOnline(person._id) && <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#06d755] rounded-full border-2 border-white" />}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-900 dark:text-white truncate flex items-center gap-2">
                                        {person.name}
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded-md uppercase font-bold tracking-tighter ${person.role === 'client' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            {person.role || 'Advocate'}
                                        </span>
                                    </h3>
                                    <span className="text-[10px] text-slate-400">
                                        {person.lastMessage ? formatTime(person.lastMessage.createdAt || person.lastMessage.timestamp) : ''}
                                    </span>
                                </div>
                                <div className="flex flex-col mt-0.5">
                                    {person.caseTitle && (
                                        <div className="flex items-center gap-1 mb-0.5">
                                            <Briefcase size={10} className="text-blue-500" />
                                            <span className="text-[10px] text-blue-500 font-bold uppercase truncate">
                                                Case: {person.caseTitle}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <p className={`text-xs truncate ${person.unreadCount > 0 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {getLastMessageText(person.lastMessage) || (person.specialization || 'Tap to chat')}
                                        </p>
                                        {person.unreadCount > 0 && (
                                            <span className="bg-[#06d755] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ml-1">
                                                {person.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Window */}
            <div className={`${!showMobileList ? 'flex' : 'hidden'} md:flex flex-1 flex-col relative bg-[#efeae2] dark:bg-[#0b141a]`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="px-4 py-2 border-b border-slate-200 flex items-center justify-between bg-[#f0f2f5] dark:bg-[#202c33] z-10">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setShowMobileList(true)} className="md:hidden p-2 hover:bg-slate-200 rounded-full">
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                        {selectedChat.user?.profilePic?.url ? <img src={selectedChat.user.profilePic.url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-400" />}
                                    </div>
                                    {isOnline(selectedChat.user?._id) && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#06d755] rounded-full border-2 border-[#f0f2f5]" />}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {selectedChat.user?.name}
                                        {selectedChat.chatType === 'case' && caseDetails && (
                                            <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                Case: {caseDetails.title}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                        {isOnline(selectedChat.user?._id) ? 'online' : 'last seen recently'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {selectedChat.chatType === 'case' && caseDetails && (
                                    <Link to={`/case/${caseDetails._id}`} className="mr-2 p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-all" title="View Case Details">
                                        <Briefcase size={20} />
                                    </Link>
                                )}
                                <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-all"><Search size={20} /></button>
                                <button className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-all"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            className="flex-1 overflow-y-auto p-4 space-y-2 relative"
                            style={{
                                backgroundImage: `url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')`,
                                backgroundBlendMode: dark ? 'overlay' : 'soft-light',
                                backgroundColor: dark ? '#0b141a' : '#efeae2'
                            }}
                        >
                            {Object.entries(messageGroups).map(([date, group]) => (
                                <div key={date} className="space-y-2">
                                    <div className="flex justify-center my-4">
                                        <span className="px-3 py-1.5 bg-white dark:bg-[#111b21] dark:text-slate-400 text-slate-600 text-[10px] font-bold uppercase rounded-lg shadow-sm">
                                            {getRelativeDate(date)}
                                        </span>
                                    </div>
                                    {group.map((msg) => {
                                        const isMe = msg.sender === user._id;
                                        return (
                                            <motion.div
                                                key={msg._id || `${msg.timestamp}-${msg.sender}`}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`relative max-w-[85%] sm:max-w-[70%] p-2 rounded-lg shadow-sm ${isMe
                                                    ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-slate-900 dark:text-white rounded-tr-none'
                                                    : 'bg-white dark:bg-[#202c33] text-slate-900 dark:text-white rounded-tl-none'
                                                    }`}>
                                                    {/* Tail effect using absolute positioning */}
                                                    <div className={`absolute top-0 w-2 h-2 ${isMe ? '-right-2 bg-[#dcf8c6] dark:bg-[#005c4b]' : '-left-2 bg-white dark:bg-[#202c33]'}`}
                                                        style={{ clipPath: isMe ? 'polygon(0 0, 0 100%, 100% 0)' : 'polygon(0 0, 100% 100%, 100% 0)' }}>
                                                    </div>

                                                    {msg.attachments?.map((at, i) => (
                                                        <div key={i} className="mb-1">
                                                            {at.type === 'image' ? (
                                                                <img src={at.url} className="rounded-md max-w-full h-auto cursor-pointer" />
                                                            ) : (
                                                                <div className={`flex items-center gap-2 p-2 rounded-md ${isMe ? 'bg-[#c7e9a9] dark:bg-[#025144]' : 'bg-slate-100 dark:bg-[#182229]'}`}>
                                                                    <FileText size={16} className="text-slate-500" />
                                                                    <span className="text-[10px] font-medium truncate max-w-30">{at.name}</span>
                                                                    <a href={at.url} download className="p-1 hover:bg-black/5 rounded-full"><Download size={12} /></a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                    <div className="pr-12">
                                                        <p className="text-[13px] leading-relaxed break-all">
                                                            {msg.text || msg.message || msg.content || (msg.attachments?.length > 0 ? 'Sent an attachment' : '')}
                                                        </p>
                                                    </div>
                                                    <div className="absolute bottom-1 right-1 flex items-center gap-1">
                                                        <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase">{formatTime(msg.createdAt || msg.timestamp)}</span>
                                                        {isMe && (
                                                            <span className={msg.seen ? 'text-[#53bdeb]' : msg.delivered ? 'text-slate-400' : 'text-slate-300'}>
                                                                {msg.sending ? (
                                                                    <Clock size={10} className="animate-pulse" />
                                                                ) : msg.seen || msg.delivered ? (
                                                                    <CheckCheck size={14} />
                                                                ) : (
                                                                    <Check size={14} />
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                            {partnerTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-[#202c33] px-3 py-2 rounded-lg shadow-sm flex gap-1 items-center">
                                        <div className="flex gap-0.5">
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                                            <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1 h-1 bg-slate-400 rounded-full" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-2 bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-2 relative">
                            <div className="flex items-center gap-1">
                                <div className="relative" ref={emojiPickerRef}>
                                    <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-all">
                                        <Smile size={24} />
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-full left-0 mb-4 z-50 shadow-2xl">
                                            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                        </div>
                                    )}
                                </div>
                                <button type="button" onClick={() => fileInputRef.current.click()} className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-all">
                                    <Paperclip size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleTyping}
                                    placeholder="Type a message"
                                    className="flex-1 px-4 py-2.5 bg-white dark:bg-[#2a3942] dark:text-white border-none rounded-xl text-sm focus:outline-none shadow-sm"
                                />
                                {newMessage.trim() || attachments.length > 0 ? (
                                    <button type="submit" className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-all shadow-md">
                                        <Send size={20} />
                                    </button>
                                ) : (
                                    <button type="button" className="p-2.5 bg-[#00a884] text-white rounded-full hover:bg-[#008f6f] transition-all shadow-md">
                                        <Phone size={20} />
                                    </button>
                                )}
                            </form>

                            <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] p-12 text-center border-b-8 border-[#00a884]">
                        <div className="w-64 h-64 mb-8 opacity-20 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full">
                            <MessageSquare size={120} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-3xl font-light text-slate-600 dark:text-slate-300 mb-4">Justice Portal for Windows</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
                            Send and receive messages without keeping your phone online.<br />
                            Use Justice Portal on up to 4 linked devices and 1 phone at the same time.
                        </p>
                        <div className="mt-12 flex items-center gap-2 text-slate-400 text-sm">
                            <Shield size={16} />
                            <span>End-to-end encrypted</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;