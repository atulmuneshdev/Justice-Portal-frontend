import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageCircle, Share2, Send, MoreHorizontal, User, CheckCircle, Globe } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const PostCard = ({ post, onUpdate }) => {
    const { user } = useAuth();
    // Helper to get optimized image URL from ImageKit
    const getOptimizedUrl = (pic, width = 400) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url; // Fallback for local or other URLs
    };

    const [isLiking, setIsLiking] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsPostingComment] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isExpanded, setIsExpanded] = useState(false);

    const isOwner = user?.role === 'advocate' && (post.advocate?._id || post.advocate) === (user?._id || user?.id);
    const isLiked = post.likes?.some(like => (like.user?._id || like.user) === (user?._id || user?.id));

    const MAX_CHAR_COUNT = 250;
    const isLongContent = post.content.length > MAX_CHAR_COUNT;
    const displayContent = isExpanded ? post.content : post.content.slice(0, MAX_CHAR_COUNT);

    const handleLike = async () => {
        if (isLiking) return;
        setIsLiking(true);
        try {
            await API.post(`/posts/${post._id}/like`);
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to like post');
        } finally {
            setIsLiking(false);
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || isCommenting) return;

        setIsPostingComment(true);
        try {
            await API.post(`/posts/${post._id}/comment`, { text: newComment });
            setNewComment('');
            if (onUpdate) onUpdate();
            toast.success('Comment added!');
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setIsPostingComment(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await API.delete(`/posts/${post._id}`);
            toast.success('Post deleted successfully');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to delete post');
        }
    };

    const handleUpdate = async () => {
        if (!editContent.trim()) return;
        try {
            await API.put(`/posts/${post._id}`, { content: editContent });
            setIsEditing(false);
            toast.success('Post updated successfully');
            if (onUpdate) onUpdate();
        } catch (error) {
            toast.error('Failed to update post');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white  rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden hover:shadow-md transition-shadow duration-300"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="w-14 h-14 rounded-xl bg-linear-to-br from-indigo-50 to-blue-50 overflow-hidden border-2 border-white shadow-sm shrink-0"
                    >
                        {post.advocate?.profilePic ? (
                            <img src={getOptimizedUrl(post.advocate.profilePic, 100)} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <User className="w-7 h-7 text-indigo-300" />
                            </div>
                        )}
                    </motion.div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-black text-gray-900 text-[15px] hover:text-indigo-600 cursor-pointer transition-colors leading-tight">
                                {post.advocate?.name}
                            </h4>
                            <div className="bg-blue-50 rounded-full p-0.5">
                                <CheckCircle className="w-3.5 h-3.5 text-blue-600 fill-blue-50" />
                            </div>
                            <span className="text-indigo-600 font-black text-[10px] bg-indigo-50 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Verified</span>
                        </div>
                        <p className="text-gray-500 text-xs font-bold mt-0.5 flex items-center gap-1">
                            <span className="line-clamp-1">{post.advocate?.specialization || 'Legal Professional'}</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-indigo-500">Advocate</span>
                        </p>
                        <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
                            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <Globe className="w-3 h-3" />
                            <span>Public</span>
                        </div>
                    </div>
                </div>
                {isOwner && (
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-all"
                        >
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1.5 overflow-hidden"
                                >
                                    <button
                                        onClick={() => { setIsEditing(true); setShowOptions(false); }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors font-bold"
                                    >
                                        Edit Post
                                    </button>
                                    <div className="h-[1px] bg-gray-50 my-1 mx-2"></div>
                                    <button
                                        onClick={() => { handleDelete(); setShowOptions(false); }}
                                        className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                                    >
                                        Delete Post
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                {isEditing ? (
                    <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <textarea
                            className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px] shadow-inner"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-xs font-black text-gray-500 hover:bg-white rounded-full border border-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-5 py-2 text-xs font-black bg-indigo-600 text-white hover:bg-indigo-700 rounded-full shadow-lg shadow-indigo-100 transition-all"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-gray-800 text-[15px] leading-[1.6] font-medium whitespace-pre-wrap">
                            {displayContent}
                            {!isExpanded && isLongContent && "..."}
                        </p>
                        {isLongContent && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="text-indigo-600 text-sm font-black hover:underline focus:outline-none"
                            >
                                {isExpanded ? "Show less" : "Read more"}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Media */}
            {post.media?.url && (
                <div className="px-2 pb-2">
                    <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex justify-center max-h-[370px] shadow-inner">
                        {post.media.type === 'image' ? (
                            <motion.img
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={`${post.media.url}?tr=w-800,q-80`}
                                loading="lazy"
                                alt="Post media"
                                className="w-full object-cover cursor-zoom-in"
                                whileHover={{ scale: 1.01 }}
                                transition={{ duration: 0.3 }}
                            />
                        ) : (
                            <video
                                src={post.media.url}
                                className="w-full"
                                controls
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="px-4 py-3 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-1.5 group cursor-pointer">
                    <div className="flex -space-x-1.5">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center ring-2 ring-white z-10">
                            <ThumbsUp className="w-3 h-3 text-white fill-white" />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center ring-2 ring-white z-0">
                            <MessageCircle className="w-3 h-3 text-white fill-white" />
                        </div>
                    </div>
                    <span className="text-[11px] text-gray-500 font-black group-hover:text-indigo-600 transition-colors">
                        {post.likes?.length || 0} Likes • {post.comments?.length || 0} Comments
                    </span>
                </div>
                <div className="flex items-center gap-3 text-[11px] text-gray-400 font-black uppercase tracking-wider">
                    <span className="hover:text-indigo-600 cursor-pointer transition-colors">12 Shares</span>
                </div>
            </div>

            {/* Actions */}
            <div className="px-1 sm:px-2 py-1 flex items-center gap-0.5 sm:gap-1">
                <PostActionButton
                    onClick={handleLike}
                    icon={<ThumbsUp className={`w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform ${isLiked ? 'text-blue-600 fill-blue-600 scale-110' : 'group-hover:scale-110'}`} />}
                    label="Like"
                    isActive={isLiked}
                    activeClass="text-blue-600 bg-blue-50/50"
                />
                <PostActionButton
                    onClick={() => setShowComments(!showComments)}
                    icon={<MessageCircle className="w-4 h-4 sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" />}
                    label="Comment"
                    isActive={showComments}
                    activeClass="text-indigo-600 bg-indigo-50/50"
                />
                <PostActionButton
                    icon={<Share2 className="w-4 h-4 sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" />}
                    label="Share"
                />
                <PostActionButton
                    icon={<Send className="w-4 h-4 sm:w-[18px] sm:h-[18px] group-hover:scale-110 transition-transform" />}
                    label="Send"
                />
            </div>

            {/* Comments Section */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-gray-50/50 overflow-hidden border-t border-gray-100"
                    >
                        <div className="p-4 space-y-5">
                            {/* Comment Input */}
                            <div className="flex gap-3">
                                <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-100 to-blue-100 shrink-0 overflow-hidden border-2 border-white shadow-sm flex items-center justify-center">
                                    {user?.profilePic ? (
                                        <img src={getOptimizedUrl(user.profilePic, 100)} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-5 h-5 text-indigo-400" />
                                    )}
                                </div>
                                <form onSubmit={handleComment} className="flex-1 relative">
                                    <input
                                        type="text"
                                        placeholder="Add a comment as a counselor..."
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none pr-12 transition-all shadow-sm"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isCommenting}
                                        className="absolute right-1.5 top-1.5 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30"
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-4">
                                {post.comments.map((comment, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={idx}
                                        className="flex gap-3"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-gray-200 shrink-0 overflow-hidden border border-white shadow-sm">
                                            {comment.user?.profilePic ? (
                                                <img src={getOptimizedUrl(comment.user.profilePic, 80)} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="bg-white rounded-2xl rounded-tl-none p-3.5 flex-1 border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-1.5">
                                                <h5 className="text-[13px] font-black text-gray-900 flex items-center gap-1.5">
                                                    {comment.user?.name || 'Justice Member'}
                                                    <span className="text-[10px] text-gray-400 font-bold">• 1st</span>
                                                </h5>
                                                <span className="text-[9px] text-gray-400 font-black uppercase tracking-tighter">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[13px] text-gray-700 leading-relaxed font-medium">
                                                {comment.text}
                                            </p>
                                            <div className="flex items-center gap-3 mt-2.5 pt-2.5 border-t border-gray-50">
                                                <button className="text-[10px] font-black text-gray-500 hover:text-indigo-600 uppercase tracking-widest">Like</button>
                                                <button className="text-[10px] font-black text-gray-500 hover:text-indigo-600 uppercase tracking-widest">Reply</button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PostActionButton = ({ icon, label, onClick, isActive, activeClass }) => (
    <button
        onClick={onClick}
        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl hover:bg-gray-100/80 transition-all font-black text-xs group ${isActive ? activeClass : 'text-gray-500'}`}
    >
        {icon}
        <span className="hidden sm:inline uppercase tracking-widest">{label}</span>
    </button>
);

export default PostCard;
