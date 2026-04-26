import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const socketRef = useRef(null);
    const userIdRef = useRef(null);

    const cleanupSocket = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.removeAllListeners();
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!user) {
            cleanupSocket();
            setSocket(null);
            userIdRef.current = null;
            return;
        }

        const currentUserId = user.id || user._id;

        if (socketRef.current && userIdRef.current === currentUserId) {
            return;
        }

        cleanupSocket();

        const token = localStorage.getItem('token');

        const newSocket = io('http://127.0.0.1:3420', {
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            transports: ['websocket', 'polling'],
            auth: {
                token
            }
        });

        socketRef.current = newSocket;
        userIdRef.current = currentUserId;
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        newSocket.on('onlineUsers', (users) => {
            console.log('Online users:', users);
            setOnlineUsers(new Set(users));
        });

        newSocket.on('userOnline', (userId) => {
            console.log('User came online:', userId);
            setOnlineUsers(prev => new Set([...prev, userId]));
        });

        newSocket.on('userOffline', (userId) => {
            console.log('User went offline:', userId);
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        });

        newSocket.on('receiveMessage', (message) => {
            console.log('Notification: New message received', message);
            if (message.sender !== currentUserId) {
                toast.success(`New message received!`, {
                    duration: 3000,
                    icon: '💬'
                });

                // If message received and we are on it, it will be marked seen in Chat component
                // but we can also emit delivered here if not already handled by server
            }
        });

        newSocket.on('message_delivered', (data) => {
            // This will be handled in Chat component to update UI ticks
            console.log('Message delivered:', data);
        });

        newSocket.on('message_seen', (data) => {
            // This will be handled in Chat component to update UI ticks to blue
            console.log('Message seen:', data);
        });

        newSocket.on('typing', (data) => {
            console.log('User is typing:', data);
        });

        newSocket.on('stopTyping', (data) => {
            console.log('User stopped typing:', data);
        });

        newSocket.on('notification', ({ type, data }) => {
            console.log('Notification received:', type, data);

            if (type === 'connection_request') {
                const requesterName = data.requester?.name || 'Someone';
                toast.success(`${requesterName} sent you a connection request!`, {
                    duration: 4000,
                    icon: '🤝',
                    action: {
                        label: 'View',
                        onClick: () => window.location.href = '/network'
                    }
                });
            } else if (type === 'connection_accepted') {
                const acceptorName = data.acceptor?.name || 'Someone';
                toast.success(`${acceptorName} accepted your connection request!`, {
                    duration: 4000,
                    icon: '✅',
                    action: {
                        label: 'Message',
                        onClick: () => window.location.href = '/chat'
                    }
                });
            } else if (type === 'case_request') {
                toast.success(`New case request: "${data.title}" from ${data.clientName}!`, {
                    duration: 5000,
                    icon: '📋',
                    action: {
                        label: 'View',
                        onClick: () => window.location.href = '/advocate-dashboard'
                    }
                });
            } else if (type === 'case_status') {
                const statusIcon = data.status === 'accepted' ? '✅' : '❌';
                toast(`${statusIcon} ${data.advocateName} ${data.status === 'accepted' ? 'accepted your case' : 'rejected your case'}!`, {
                    duration: 4000,
                    icon: statusIcon,
                    action: {
                        label: 'View',
                        onClick: () => window.location.href = '/client-dashboard'
                    }
                });
            } else if (type === 'file_uploaded') {
                toast(`📄 ${data.uploadedBy} uploaded: ${data.documentName}`, {
                    duration: 4000,
                    icon: '📄'
                });
            } else if (type === 'case_message') {
                toast(`💬 ${data.senderName}: ${data.message?.substring(0, 50)}${data.message?.length > 50 ? '...' : ''}`, {
                    duration: 3000,
                    icon: '💬'
                });
            } else if (type === 'message_received') {
                toast(`New message: ${data.content}`, {
                    duration: 3000,
                    icon: '💬'
                });
            }
        });

        return () => {
            cleanupSocket();
            setSocket(null);
            userIdRef.current = null;
        };
    }, [user, cleanupSocket]);

    const sendNotification = (receiverId, type, data) => {
        if (socket) {
            socket.emit('notification', { receiverId, type, data });
        }
    };

    const isOnline = (userId) => onlineUsers.has(userId);

    const value = {
        socket,
        onlineUsers,
        isOnline,
        sendNotification,
        emit: (event, data) => socket?.emit(event, data)
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export default NotificationProvider;
