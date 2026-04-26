import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api/axios';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import { User, Bookmark, Clock, Users, ChevronDown, Info } from 'lucide-react';
import toast from 'react-hot-toast';

const Feed = () => {
    const { user } = useAuth();
    // Helper to get optimized image URL from ImageKit
    const getOptimizedUrl = (pic, width = 200) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url;
    };

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {
        try {
            const { data } = await API.get('/posts');
            setPosts(data);
        } catch (error) {
            toast.error('Failed to load posts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return (
        <div className="pt-20 sm:pt-24 min-h-screen bg-[#F8F9FA] pb-24 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">

                {/* Left Sidebar - Profile Summary */}
                <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="h-20 bg-linear-to-br from-indigo-600 via-blue-600 to-indigo-700"></div>
                        <div className="px-5 pb-5">
                            <div className="flex justify-center -mt-10 mb-4">
                                <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                                    <div className="w-full h-full rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                                        {user?.profilePic ? (
                                            <img src={getOptimizedUrl(user.profilePic, 160)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                <User className="w-10 h-10 text-indigo-200" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-center border-b border-gray-50 pb-5">
                                <h3 className="font-black text-gray-900 text-lg hover:text-indigo-600 cursor-pointer transition-colors leading-tight">{user?.name}</h3>
                                <p className="text-gray-400 text-[10px] font-black mt-1.5 uppercase tracking-[0.2em]">{user?.role}</p>
                            </div>
                            <div className="py-4 border-b border-gray-50 space-y-1">
                                <div className="flex justify-between items-center text-xs font-black py-2 hover:bg-indigo-50 px-3 rounded-xl cursor-pointer transition-all group">
                                    <span className="text-gray-500 group-hover:text-indigo-600">Connections</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">42</span>
                                </div>
                                <Link to="/chat" className="flex justify-between items-center text-xs font-black py-2 hover:bg-indigo-50 px-3 rounded-xl cursor-pointer transition-all group">
                                    <span className="text-gray-500 group-hover:text-indigo-600">Messages</span>
                                    <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">15</span>
                                </Link>
                            </div>
                            <div className="pt-4 px-1">
                                <div className="flex items-center gap-3 text-xs font-black text-gray-700 hover:text-indigo-600 cursor-pointer transition-colors">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                                        <Bookmark className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <span>My Items & Saved</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-28"
                    >
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Recent Topics</h4>
                        <div className="space-y-3">
                            {['#LawTech2026', '#JusticeSystem', '#LegalInnovation', '#Advocacy'].map(tag => (
                                <div key={tag} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-indigo-600 cursor-pointer transition-all group">
                                    <div className="w-6 h-6 rounded bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <Users className="w-3 h-3" />
                                    </div>
                                    <span>{tag}</span>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 pt-4 border-t border-gray-50 text-[11px] font-black text-gray-400 flex items-center justify-center gap-2 hover:text-indigo-600 transition-all uppercase tracking-widest">
                            Discover More
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>

                {/* Main Feed */}
                <main className="col-span-1 md:col-span-8 lg:col-span-6 space-y-6">
                    {user?.role === 'advocate' && <CreatePost onPostCreated={fetchPosts} />}

                    <div className="flex items-center gap-4 px-2">
                        <div className="h-[1px] flex-1 bg-gray-200"></div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            Sort by: <span className="text-indigo-600 flex items-center gap-1 cursor-pointer hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all">Most Recent <ChevronDown className="w-3 h-3" /></span>
                        </span>
                        <div className="h-[1px] flex-1 bg-gray-200"></div>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 shadow-sm"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {posts.map((post, index) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <PostCard post={post} onUpdate={fetchPosts} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {posts.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm"
                                >
                                    <div className="w-24 h-24 bg-indigo-50 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                                        <Clock className="w-12 h-12 text-indigo-400 -rotate-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-2">The feed is quiet...</h3>
                                    <p className="text-gray-400 font-bold max-w-xs mx-auto">Be the first counselor to share a legal insight with the community today!</p>
                                    <button className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                        Create First Post
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    )}
                </main>

                {/* Right Sidebar - News/Recommendations */}
                <div className="hidden lg:block lg:col-span-3 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-black text-gray-900 text-sm uppercase tracking-widest">Justice News</h3>
                            <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center cursor-help">
                                <Info className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="space-y-6">
                            <NewsItem
                                title="New Civil Rights Legislation Passed: What Advocates Need to Know"
                                time="4h ago"
                                readers="1,240 readers"
                            />
                            <NewsItem
                                title="Top 10 Tech Law Trends Shaping the Legal Landscape in 2026"
                                time="8h ago"
                                readers="856 readers"
                            />
                            <NewsItem
                                title="Annual Advocate Networking Event: Registration Now Open for NYC"
                                time="1d ago"
                                readers="432 readers"
                            />
                        </div>
                        <button className="w-full mt-8 text-[11px] font-black text-gray-400 hover:text-indigo-600 transition-all text-center uppercase tracking-[0.2em] py-3 bg-gray-50 rounded-xl">
                            View All News
                        </button>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="sticky top-28 pt-2"
                    >
                        <div className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-[10px] font-black text-gray-400 px-4 uppercase tracking-widest">
                            <span className="hover:text-indigo-600 cursor-pointer transition-colors">About</span>
                            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Help</span>
                            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy</span>
                            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Terms</span>
                            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Ad Choices</span>
                        </div>
                        <div className="mt-8 flex flex-col items-center justify-center gap-3">
                            <div className="flex items-center gap-2 text-indigo-600 font-black text-xs">
                                <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <span className="text-white text-[10px]">JP</span>
                                </div>
                                <span className="tracking-widest uppercase">JusticePortal</span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-300">© 2026 JusticePortal Corporation</p>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

const NewsItem = ({ title, time, readers }) => (
    <div className="group cursor-pointer">
        <h4 className="text-[13px] font-black text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
            {title}
        </h4>
        <div className="flex gap-3 text-[9px] text-gray-400 font-black uppercase tracking-tighter mt-2">
            <span>{time}</span>
            <span className="text-gray-200">•</span>
            <span>{readers}</span>
        </div>
    </div>
);

export default Feed;
