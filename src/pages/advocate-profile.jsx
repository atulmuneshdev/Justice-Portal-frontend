import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import AllPost from '../components/AllPost';
import {
    User, Mail, Phone, Award, Briefcase, BookOpen,
    MapPin, Star, Shield, CheckCircle,
    Globe, ExternalLink, DollarSign, MessageSquare, UserPlus, Clock, Check, X, ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdvocateProfileView = () => {
    const { id: profileId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState({ status: 'none' });
    const [isActionLoading, setIsActionLoading] = useState(false);

    const getOptimizedUrl = (pic, width = 400) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url;
    };

    useEffect(() => {
        fetchProfile();
        fetchConnectionStatus();
    }, [profileId]);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get(`/users/profile/advocate/${profileId}`);
            setProfile(data.user);
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Profile Load Error:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const fetchConnectionStatus = async () => {
        try {
            const { data } = await API.get(`/connections/status/${profileId}`);
            setConnectionStatus(data);
        } catch (error) {
            setConnectionStatus({ status: 'none' });
        }
    };

    const handleConnect = async () => {
        setIsActionLoading(true);
        try {
            await API.post('/connections/request', { receiverId: profileId });
            toast.success('Connection request sent!');
            fetchConnectionStatus();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCancelRequest = async () => {
        setIsActionLoading(true);
        try {
            await API.delete(`/connections/cancel/${connectionStatus.connectionId}`);
            toast.success('Request cancelled');
            fetchConnectionStatus();
        } catch (error) {
            toast.error('Failed to cancel request');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleAcceptRequest = async () => {
        setIsActionLoading(true);
        try {
            await API.put(`/connections/accept/${connectionStatus.connectionId}`);
            toast.success('Request accepted!');
            fetchConnectionStatus();
        } catch (error) {
            toast.error('Failed to accept request');
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleMessage = () => {
        navigate('/chat', { state: { user: profile, role: 'advocate' } });
    };

    if (loading) return (
        <div className="pt-24 flex flex-col justify-center items-center min-h-screen bg-gray-50">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-indigo-600">Loading Advocate Profile...</p>
        </div>
    );

    if (!profile) return (
        <div className="pt-24 text-center">
            <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-4 text-indigo-600 font-bold hover:underline">Go Back</button>
        </div>
    );

    const isOwner = currentUser?._id === profileId || currentUser?.id === profileId;

    return (
        <div className="pt-20 sm:pt-24 min-h-screen bg-gray-50 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="mb-6 flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to search
                </button>

                {/* Header Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-indigo-100/50 border border-indigo-50 overflow-hidden"
                >
                    {/* Cover Banner */}
                    <div className="h-30 sm:h-56 relative group overflow-hidden">
                        {profile?.backgroundPic?.url ? (
                            <img
                                src={getOptimizedUrl(profile.backgroundPic, 1200)}
                                alt="Background"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-linear-to-br from-indigo-600 via-indigo-700 to-blue-600">
                                <div className="absolute inset-0 opacity-10 pattern-grid-lg scale-150 rotate-12"></div>
                            </div>
                        )}
                    </div>

                    <div className="px-4 sm:px-8 pb-8 sm:pb-10 relative">
                        {/* Profile Image & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-20 mb-6 sm:mb-8 gap-4 sm:gap-6">
                            <div className="relative self-center sm:self-auto">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] sm:rounded-[2.5rem] bg-white p-1.5 sm:p-2 shadow-2xl shadow-indigo-200/50">
                                    <div className="w-full h-full rounded-[1.7rem] sm:rounded-[2rem] bg-gray-100 overflow-hidden border border-gray-100 relative group">
                                        {profile?.profilePic ? (
                                            <img
                                                src={getOptimizedUrl(profile.profilePic, 300)}
                                                alt={profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <User className="w-12 h-10 sm:w-16 sm:h-12 text-indigo-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
                                {!isOwner && (
                                    <>
                                        {connectionStatus.status === 'none' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleConnect}
                                                disabled={isActionLoading}
                                                className="flex-1 sm:flex-none bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                                            >
                                                <UserPlus className="w-4 h-4" />
                                                Connect
                                            </motion.button>
                                        )}
                                        {connectionStatus.status === 'pending' && connectionStatus.direction === 'sent' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleCancelRequest}
                                                disabled={isActionLoading}
                                                className="flex-1 sm:flex-none bg-yellow-50 text-yellow-700 border-2 border-yellow-200 px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
                                            >
                                                <Clock className="w-4 h-4 group-hover:hidden" />
                                                <X className="w-4 h-4 hidden group-hover:block" />
                                                <span className="group-hover:hidden">Pending Request</span>
                                                <span className="hidden group-hover:block">Cancel Request</span>
                                            </motion.button>
                                        )}
                                        {connectionStatus.status === 'pending' && connectionStatus.direction === 'received' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleAcceptRequest}
                                                disabled={isActionLoading}
                                                className="flex-1 sm:flex-none bg-green-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-xl shadow-green-200"
                                            >
                                                <Check className="w-4 h-4" />
                                                Accept Request
                                            </motion.button>
                                        )}
                                        {connectionStatus.status === 'connected' && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handleMessage}
                                                className="flex-1 sm:flex-none bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                                            >
                                                <MessageSquare className="w-4 h-4" />
                                                Message
                                            </motion.button>
                                        )}
                                    </>
                                )}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 sm:flex-none bg-white border-2 border-indigo-50 text-gray-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all shadow-sm"
                                >
                                    <Globe className="w-4 h-4" />
                                    Portfolio
                                </motion.button>
                            </div>
                        </div>

                        {/* Profile Info Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                            <div className="lg:col-span-2 space-y-8">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">{profile?.name}</h1>
                                        <CheckCircle className="w-7 h-7 text-blue-500 fill-blue-50" />
                                    </div>
                                    <p className="text-indigo-600 font-black text-xl mt-2 flex items-center gap-2">
                                        <Award className="w-6 h-6" />
                                        {profile?.specialization || 'Professional Advocate'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-6">
                                        <span className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-2xl text-gray-600 font-bold text-sm">
                                            <MapPin className="w-4 h-4 text-indigo-400" /> {profile?.location || 'New York, USA'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-2xl text-gray-600 font-bold text-sm">
                                            <Briefcase className="w-4 h-4 text-indigo-400" /> {profile?.experience || 0}+ Yrs Exp.
                                        </span>
                                        <span className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-2xl text-indigo-700 font-bold text-sm border border-indigo-100">
                                            <DollarSign className="w-4 h-4 text-indigo-500" /> {profile?.hourlyRate || 0}/hr
                                        </span>
                                        <span className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-700 font-bold text-sm border border-yellow-100">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {profile?.rating || '4.9'} ({profile?.reviewCount || '240'} Reviews)
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-indigo-600" />
                                        Professional Bio
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                        {profile?.bio || 'Professional legal advocate dedicated to providing top-tier legal services and achieving excellence in practice.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-800">Areas of Expertise</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile?.expertise || ['Corporate Law', 'Criminal Defense', 'Family Law', 'Property Dispute', 'Taxation']).map(tag => (
                                            <span key={tag} className="px-5 py-2.5 bg-white text-gray-700 rounded-2xl text-sm font-black border-2 border-indigo-50 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-default">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Sidebar */}
                            <div className="space-y-8">
                                <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100 shadow-inner">
                                    <h3 className="text-xl font-black text-gray-800 mb-6">Contact Info</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 group cursor-pointer">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                                                <Mail className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-bold text-gray-700 truncate">{profile?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group cursor-pointer">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                                                <Phone className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Phone Number</p>
                                                <p className="text-sm font-bold text-gray-700">{profile?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-indigo-100">
                                        <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-4">Social Presence</p>
                                        <div className="flex gap-3">
                                            {[X, ExternalLink, Globe].map((Icon, idx) => (
                                                <button key={idx} className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Icon className="w-5 h-5" /></button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-linear-to-br from-indigo-600 to-blue-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                        <Shield className="w-32 h-32" />
                                    </div>
                                    <Shield className="w-12 h-12 mb-6 text-indigo-200" />
                                    <h3 className="text-2xl font-black mb-3">Verified Pro</h3>
                                    <p className="text-indigo-100/80 font-bold leading-relaxed">
                                        Legal credentials and identity are fully verified by our safety systems.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Posts Section */}
                <div className="mt-12 pb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-2xl font-black text-gray-800">Contributions</h3>
                        <div className="h-[2px] flex-1 bg-indigo-50"></div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest bg-indigo-50 px-4 py-1.5 rounded-full">
                            {posts.length} Posts
                        </span>
                    </div>
                    {posts.length > 0 ? (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {posts.map(post => (
                                <AllPost key={post._id} post={post} onUpdate={fetchProfile} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-indigo-50 shadow-xl shadow-indigo-100/20">
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                                <BookOpen className="w-10 h-10 text-indigo-300 -rotate-12" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No posts yet</h3>
                            <p className="text-gray-400 font-bold max-w-xs mx-auto">This advocate hasn't shared any insights with the community yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdvocateProfileView;
