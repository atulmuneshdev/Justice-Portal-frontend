import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import {
    User, Mail, Phone, MessageSquare, BookOpen,
    Edit3, Camera, MapPin, Star, Shield, CheckCircle,
    Globe, X, Save, ExternalLink, Heart, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import AllPost from '../components/AllPost';

const ClientProfile = () => {
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState({
        name: '',
        location: '',
        bio: '',
        legalInterests: ''
    });

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
    }, []);

    const fetchProfile = async () => {
        try {
            const role = currentUser?.role || 'client';
            const userId = currentUser?.id || currentUser?._id;

            if (!userId) {
                toast.error('Session expired. Please login again.');
                return;
            }

            const { data } = await API.get(`/users/profile/${role}/${userId}`);
            setProfile(data.user);
            setPosts(data.posts || []);
            setEditData({
                name: data.user.name || '',
                location: data.user.location || '',
                bio: data.user.bio || '',
                legalInterests: data.user.legalInterests || ''
            });
        } catch (error) {
            console.error('Profile Load Error:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfilePicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePic', file);

        const toastId = toast.loading('Uploading profile picture...');
        try {
            const { data } = await API.patch('/users/profile-pic', formData);
            setProfile({ ...profile, profilePic: data.user.profilePic });
            toast.success('Profile picture updated!', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload profile picture', { id: toastId });
        }
    };

    const handleBackgroundPicUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('backgroundPic', file);

        const toastId = toast.loading('Uploading background...');
        try {
            const { data } = await API.patch('/users/background-pic', formData);
            setProfile({ ...profile, backgroundPic: data.user.backgroundPic });
            toast.success('Background updated!', { id: toastId });
        } catch (error) {
            toast.error('Failed to upload background', { id: toastId });
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Updating profile...');
        try {
            const { data } = await API.patch('/users/profile', editData);
            setProfile(data.user);
            setIsModalOpen(false);
            toast.success('Profile updated successfully!', { id: toastId });
        } catch (error) {
            toast.error('Failed to update profile', { id: toastId });
        }
    };

    if (loading) return (
        <div className="pt-24 flex flex-col justify-center items-center min-h-screen bg-gray-50">
            <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-bold text-teal-600">Loading Profile...</p>
        </div>
    );

    return (
        <div className="pt-20 sm:pt-24 h-screen bg-gray-50 pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl sm:rounded-[2.5rem] shadow-xl shadow-teal-100/50 border border-teal-50 overflow-hidden"
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
                            <div className="h-full w-full bg-linear-to-br from-teal-600 via-teal-700 to-emerald-600">
                                <div className="absolute inset-0 opacity-10 pattern-grid-lg scale-150 rotate-12"></div>
                            </div>
                        )}
                        <label className="absolute bottom-4 right-4 bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 sm:p-3 rounded-xl sm:rounded-2xl cursor-pointer transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 border border-white/20">
                            <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
                            <input type="file" className="hidden" onChange={handleBackgroundPicUpload} accept="image/*" />
                        </label>
                    </div>

                    <div className="px-4 sm:px-8 pb-8 sm:pb-10 relative">
                        {/* Profile Image & Action Buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-20 mb-6 sm:mb-8 gap-4 sm:gap-6">
                            <div className="relative self-center sm:self-auto">
                                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2rem] sm:rounded-[2.5rem] bg-white p-1.5 sm:p-2 shadow-2xl shadow-teal-200/50">
                                    <div className="w-full h-full rounded-[1.7rem] sm:rounded-[2rem] bg-gray-100 overflow-hidden border border-gray-100 relative group">
                                        {profile?.profilePic ? (
                                            <img
                                                src={getOptimizedUrl(profile.profilePic, 300)}
                                                alt={profile.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-teal-50">
                                                <User className="w-12 h-10 sm:w-16 sm:h-12 text-teal-200" />
                                            </div>
                                        )}
                                        <label className="absolute inset-0 bg-teal-900/60 flex flex-col items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm">
                                            <Camera className="text-white w-6 h-6 sm:w-8 sm:h-8 mb-1" />
                                            <span className="text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest">Update</span>
                                            <input type="file" className="hidden" onChange={handleProfilePicUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-white shadow-lg shadow-green-200"></div>
                            </div>

                            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 sm:flex-none bg-white border-2 border-teal-50 text-gray-700 px-6 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-teal-50 hover:text-teal-600 transition-all shadow-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    My Cases
                                </motion.button>
                                <motion.button
                                    onClick={() => setIsModalOpen(true)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex-1 sm:flex-none bg-teal-600 text-white px-8 py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-teal-700 transition-all shadow-xl shadow-teal-200"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
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
                                    <p className="text-teal-600 font-black text-xl mt-2 flex items-center gap-2">
                                        <Shield className="w-6 h-6" />
                                        Justice Member
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-6">
                                        <span className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-2xl text-gray-600 font-bold text-sm">
                                            <MapPin className="w-4 h-4 text-teal-400" /> {profile?.location || 'New York, USA'}
                                        </span>
                                        <span className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-2xl text-gray-600 font-bold text-sm">
                                            <User className="w-4 h-4 text-teal-400" /> Member since 2024
                                        </span>
                                        <span className="flex items-center gap-2 bg-teal-50 px-4 py-2 rounded-2xl text-teal-700 font-bold text-sm border border-teal-100">
                                            <MessageSquare className="w-4 h-4 text-teal-500" /> {profile?.consultationsCount || 0} Consultations
                                        </span>
                                        <span className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl text-yellow-700 font-bold text-sm border border-yellow-100">
                                            <Heart className="w-4 h-4 fill-rose-400 text-rose-400" /> Community Contributor
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-800 flex items-center gap-2">
                                        <BookOpen className="w-6 h-6 text-teal-600" />
                                        About Me
                                    </h3>
                                    <p className="text-gray-500 leading-relaxed text-lg font-medium">
                                        {profile?.bio || 'Justice seeker and community member looking for professional legal guidance and sharing insights.'}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-black text-gray-800">Legal Interests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile?.legalInterests?.split(',') || ['Consumer Rights', 'Civil Law', 'Property Rights', 'Legal Awareness']).map(tag => (
                                            <span key={tag} className="px-5 py-2.5 bg-white text-gray-700 rounded-2xl text-sm font-black border-2 border-teal-50 hover:border-teal-200 hover:bg-teal-50/30 transition-all cursor-default">
                                                {tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Contact Sidebar */}
                            <div className="space-y-8">
                                <div className="bg-teal-50/50 rounded-[2rem] p-8 border border-teal-100 shadow-inner">
                                    <h3 className="text-xl font-black text-gray-800 mb-6">Contact Info</h3>
                                    <div className="space-y-5">
                                        <div className="flex items-center gap-4 group cursor-pointer">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-teal-50 group-hover:scale-110 transition-transform">
                                                <Mail className="w-6 h-6 text-teal-500" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-bold text-gray-700 truncate">{profile?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 group cursor-pointer">
                                            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-teal-50 group-hover:scale-110 transition-transform">
                                                <Phone className="w-6 h-6 text-teal-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest">Phone Number</p>
                                                <p className="text-sm font-bold text-gray-700">{profile?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 pt-8 border-t border-teal-100">
                                        <p className="text-[10px] font-black text-teal-300 uppercase tracking-widest mb-4">Connect with me</p>
                                        <div className="flex gap-3">
                                            {[X, ExternalLink, Globe].map((Icon, idx) => (
                                                <button key={idx} className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all"><Icon className="w-5 h-5" /></button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-linear-to-br from-teal-600 to-emerald-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-teal-200 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                                        <Shield className="w-32 h-32" />
                                    </div>
                                    <Shield className="w-12 h-12 mb-6 text-teal-200" />
                                    <h3 className="text-2xl font-black mb-3">Verified Profile</h3>
                                    <p className="text-teal-100/80 font-bold leading-relaxed">
                                        Your profile has been verified for a secure and trusted legal community experience.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Stats Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-xl shadow-teal-100/30"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800">My Network</h3>
                            <Link to="/network" className="text-teal-600 font-black text-sm hover:bg-teal-50 px-4 py-2 rounded-xl transition-all">Find Advocates</Link>
                        </div>
                        <div className="flex -space-x-4 overflow-hidden p-1">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="inline-block h-14 w-14 rounded-2xl ring-4 ring-white bg-teal-50 border-2 border-teal-100 flex items-center justify-center overflow-hidden shadow-lg">
                                    <User className="w-7 h-7 text-teal-200" />
                                </div>
                            ))}
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white ring-4 ring-white text-xs font-black shadow-lg">
                                +4
                            </div>
                        </div>
                        <p className="mt-6 text-gray-400 font-bold text-base">Connected with 8 professional advocates.</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[2.5rem] p-10 border border-teal-50 shadow-xl shadow-teal-100/30"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-black text-gray-800">Legal Activity</h3>
                            <div className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-2xl text-xs font-black tracking-widest uppercase shadow-sm">Active</div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-teal-50/30 rounded-[2rem] border border-teal-50">
                                <p className="text-[10px] text-teal-300 font-black uppercase tracking-widest mb-2">Cases Posted</p>
                                <p className="text-4xl font-black text-teal-600">{profile?.casesPostedCount || 0}</p>
                            </div>
                            <div className="p-6 bg-emerald-50/30 rounded-[2rem] border border-emerald-50">
                                <p className="text-[10px] text-emerald-300 font-black uppercase tracking-widest mb-2">Saved Posts</p>
                                <p className="text-4xl font-black text-emerald-600">14</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Interactions Section */}
                <div className="mt-12 pb-12">
                    <div className="flex items-center gap-4 mb-8">
                        <h3 className="text-2xl font-black text-gray-800">My Interactions</h3>
                        <div className="h-[2px] flex-1 bg-teal-50"></div>
                        <span className="text-xs font-black text-teal-400 uppercase tracking-widest bg-teal-50 px-4 py-1.5 rounded-full">
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
                        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-teal-50 shadow-xl shadow-teal-100/20">
                            <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                                <MessageSquare className="w-10 h-10 text-teal-300 -rotate-12" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 mb-2">No activity yet</h3>
                            <p className="text-gray-400 font-bold max-w-xs mx-auto">Start your legal journey by asking questions or connecting with advocates.</p>
                            <Link
                                to="/feed"
                                className="mt-8 inline-block px-8 py-3 bg-teal-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all"
                            >
                                Explore Legal Feed
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 border border-teal-50 relative overflow-hidden"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-6 right-6 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            <div className="mb-8">
                                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Edit Profile</h2>
                                <p className="text-gray-400 font-bold mt-1">Keep your personal details up to date.</p>
                            </div>

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-teal-300 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                            value={editData.name}
                                            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-teal-300 uppercase tracking-widest ml-1">Location</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                            value={editData.location}
                                            onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-teal-300 uppercase tracking-widest ml-1">Legal Interests (comma separated)</label>
                                        <input
                                            type="text"
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-bold text-gray-700 shadow-inner"
                                            value={editData.legalInterests}
                                            onChange={(e) => setEditData({ ...editData, legalInterests: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-teal-300 uppercase tracking-widest ml-1">Bio</label>
                                        <textarea
                                            rows="4"
                                            className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-teal-500 outline-none transition-all font-bold text-gray-700 shadow-inner resize-none"
                                            value={editData.bio}
                                            onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-gray-400 bg-gray-100 hover:bg-gray-200 transition-all uppercase tracking-widest text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-4 rounded-2xl font-black text-white bg-teal-600 hover:bg-teal-700 shadow-xl shadow-teal-200 transition-all flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                                    >
                                        <Save className="w-4 h-4" />
                                        Save Changes
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

export default ClientProfile;
