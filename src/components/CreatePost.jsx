import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Video, Calendar, FileText, Send, X, User } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CreatePost = ({ onPostCreated }) => {
    const { user } = useAuth();
    // Helper to get optimized image URL from ImageKit
    const getOptimizedUrl = (pic, width = 100) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url;
    };

    const [content, setContent] = useState('');
    const [media, setMedia] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [isPosting, setIsPosting] = useState(false);

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMedia(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeMedia = () => {
        setMedia(null);
        setMediaPreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !media) return;

        setIsPosting(true);
        const formData = new FormData();
        formData.append('content', content);
        if (media) {
            formData.append('media', media);
        }

        try {
            await API.post('/posts', formData);
            setContent('');
            removeMedia();
            toast.success('Post shared successfully!');
            if (onPostCreated) onPostCreated();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to share post');
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-6 hover:shadow-md transition-shadow duration-300"
        >
            <div className="flex gap-4 mb-4">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-12 h-12 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 shrink-0 overflow-hidden border-2 border-white shadow-sm"
                >
                    {user?.profilePic ? (
                        <img src={getOptimizedUrl(user.profilePic, 100)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-300" />
                        </div>
                    )}
                </motion.div>
                <div className="flex-1">
                    <textarea
                        id="post-input"
                        className="w-full bg-transparent border-none outline-none text-gray-800 placeholder-gray-400 text-lg font-medium resize-none min-h-[100px] py-2"
                        placeholder="Share a legal insight or update with the community..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <AnimatePresence>
                    {mediaPreview && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative mb-5 rounded-2xl overflow-hidden border border-gray-100 shadow-lg group mx-2"
                        >
                            <button
                                type="button"
                                onClick={removeMedia}
                                className="absolute top-3 right-3 p-2 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all z-10 backdrop-blur-sm"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {media?.type.startsWith('image/') ? (
                                <img src={mediaPreview} alt="Preview" className="w-full max-h-[450px] object-cover" />
                            ) : (
                                <video src={mediaPreview} className="w-full max-h-[450px]" controls />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-1">
                        <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-indigo-50 cursor-pointer transition-all group">
                            <Image className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-600 text-[13px] font-black hidden sm:inline uppercase tracking-widest">Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={handleMediaChange} />
                        </label>
                        <label className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-green-50 cursor-pointer transition-all group">
                            <Video className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-600 text-[13px] font-black hidden sm:inline uppercase tracking-widest">Video</span>
                            <input type="file" className="hidden" accept="video/*" onChange={handleMediaChange} />
                        </label>
                        <button type="button" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-orange-50 transition-all group">
                            <Calendar className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-600 text-[13px] font-black hidden sm:inline uppercase tracking-widest">Event</span>
                        </button>
                        <button type="button" className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl hover:bg-purple-50 transition-all group">
                            <FileText className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                            <span className="text-gray-600 text-[13px] font-black hidden sm:inline uppercase tracking-widest">Write</span>
                        </button>
                    </div>

                    <motion.button
                        disabled={isPosting || (!content.trim() && !media)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className={`flex  items-center gap-2.5 px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg ${isPosting || (!content.trim() && !media) ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 hover:shadow-indigo-300'}`}
                    >
                        {isPosting ? 'Sharing...' : (
                            <>
                                 Post
                                <Send className="w-4 h-4" />
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
};

export default CreatePost;
