import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../api/axios';
import { Search, User, Award, MapPin, Star, MessageSquare, Briefcase, Filter, DollarSign, UserPlus, Clock, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const FindAdvocate = () => {
    const { isOnline } = useNotification();
    const navigate = useNavigate();
    const [advocates, setAdvocates] = useState([]);
    const [connectionStatuses, setConnectionStatuses] = useState({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterState, setFilterState] = useState({
        specialization: '',
        minExperience: '',
        minRating: '',
        maxRate: ''
    });

    const specializations = [
        'Criminal Lawyer', 'Civil Lawyer', 'Family Lawyer',
        'Corporate Lawyer', 'Intellectual Property', 'Tax Lawyer'
    ];

    const getOptimizedUrl = (pic, width = 200) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url;
    };

    useEffect(() => {
        fetchAdvocates();
    }, []);

    useEffect(() => {
        if (advocates.length > 0) {
            fetchAllConnectionStatuses();
        }
    }, [advocates]);

    const fetchAllConnectionStatuses = async () => {
        try {
            const statuses = {};
            await Promise.all(
                advocates.map(async (adv) => {
                    try {
                        const { data } = await API.get(`/connections/status/${adv._id}`);
                        statuses[adv._id] = data;
                    } catch {
                        statuses[adv._id] = { status: 'none' };
                    }
                })
            );
            setConnectionStatuses(statuses);
        } catch (error) {
            console.error('Failed to fetch connection statuses');
        }
    };

    const fetchAdvocates = async (activeFilters = filterState, search = searchTerm) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);
            if (activeFilters.specialization) params.append('specialization', activeFilters.specialization);
            if (activeFilters.minExperience) params.append('minExperience', activeFilters.minExperience);
            if (activeFilters.minRating) params.append('minRating', activeFilters.minRating);
            if (activeFilters.maxRate) params.append('maxRate', activeFilters.maxRate);

            const { data } = await API.get(`/users/advocates?${params.toString()}`);
            setAdvocates(data);
        } catch (error) {
            toast.error('Failed to load advocates');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterState(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchAdvocates();
        setShowFilters(false);
    };

    const clearFilters = () => {
        const resetFilters = {
            specialization: '',
            minExperience: '',
            minRating: '',
            maxRate: ''
        };
        setFilterState(resetFilters);
        setSearchTerm('');
        fetchAdvocates(resetFilters, '');
    };

    const handleConnect = async (advocateId) => {
        try {
            await API.post('/connections/request', { receiverId: advocateId });
            toast.success('Connection request sent!');
            fetchAllConnectionStatuses();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        }
    };

    const handleCancelRequest = async (connectionId) => {
        try {
            await API.delete(`/connections/cancel/${connectionId}`);
            toast.success('Request cancelled');
            fetchAllConnectionStatuses();
        } catch (error) {
            toast.error('Failed to cancel request');
        }
    };

    const handleAcceptRequest = async (connectionId) => {
        if (!connectionId) {
            toast.error('Could not accept request: Missing ID');
            return;
        }
        try {
            await API.put(`/connections/accept/${connectionId}`);
            toast.success('Request accepted!');
            fetchAllConnectionStatuses();
        } catch (error) {
            toast.error('Failed to accept request');
        }
    };

    const handleRejectRequest = async (connectionId) => {
        if (!connectionId) {
            toast.error('Could not reject request: Missing ID');
            return;
        }
        try {
            await API.put(`/connections/reject/${connectionId}`);
            toast.success('Request rejected');
            fetchAllConnectionStatuses();
        } catch (error) {
            toast.error('Failed to reject request');
        }
    };

    const handleMessage = (advocate) => {
        navigate('/chat', { state: { user: advocate, role: 'advocate' } });
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Find an Advocate</h1>
                        <p className="text-gray-500 mt-1">Discover top-rated legal professionals</p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && fetchAdvocates()}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-medium ${showFilters ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <Filter className="w-5 h-5" />
                            <span className="hidden sm:inline">Filters</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-8"
                        >
                            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Specialization</label>
                                    <select
                                        name="specialization"
                                        value={filterState.specialization}
                                        onChange={handleFilterChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">All Specializations</option>
                                        {specializations.map(spec => (
                                            <option key={spec} value={spec}>{spec}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min. Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="minExperience"
                                        value={filterState.minExperience}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. 5"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min. Rating</label>
                                    <select
                                        name="minRating"
                                        value={filterState.minRating}
                                        onChange={handleFilterChange}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Any Rating</option>
                                        <option value="4">4+ Stars</option>
                                        <option value="4.5">4.5+ Stars</option>
                                        <option value="4.8">4.8+ Stars</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max. Hourly Rate ($)</label>
                                    <input
                                        type="number"
                                        name="maxRate"
                                        value={filterState.maxRate}
                                        onChange={handleFilterChange}
                                        placeholder="e.g. 200"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="md:col-span-4 flex justify-end gap-3 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={clearFilters}
                                        className="px-6 py-2 text-gray-600 font-bold hover:text-gray-800 transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={applyFilters}
                                        className="px-8 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                                    >
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white rounded-2xl animate-pulse shadow-sm border border-gray-100"></div>
                        ))}
                    </div>
                ) : (
                    <AnimatePresence mode='popLayout'>
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {advocates.map((adv) => {
                                const status = connectionStatuses[adv._id] || { status: 'none' };
                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -5 }}
                                        key={adv._id}
                                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <Link to={`/advocate-profile/${adv._id}`} className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center overflow-hidden border border-blue-100 shadow-inner">
                                                {adv.profilePic ? (
                                                    <img src={getOptimizedUrl(adv.profilePic, 150)} alt={adv.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-8 h-8 text-blue-500" />
                                                )}
                                            </Link>
                                            <div>
                                                <Link to={`/advocate-profile/${adv._id}`} className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">{adv.name}</Link>
                                                <p className="text-blue-600 font-medium flex items-center gap-1">
                                                    <Award className="w-4 h-4" />
                                                    {adv.specialization || 'General Advocate'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3 mb-6">
                                            <div className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Briefcase className="w-4 h-4" />
                                                    <span>{adv.experience || 0}+ yrs exp.</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="font-bold">{adv.rating || 'New'}</span>
                                                    <span className="text-gray-400">({adv.reviewCount || 0})</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600 text-sm">
                                                <MapPin className="w-4 h-4" />
                                                <span>{adv.location || 'Remote Available'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-blue-700 font-bold bg-blue-50 w-fit px-3 py-1 rounded-lg text-sm">
                                                <DollarSign className="w-4 h-4" />
                                                <span>${adv.hourlyRate || 0}/hr</span>
                                            </div>

                                            <p className="text-gray-500 text-sm line-clamp-2 italic pt-2">
                                                "{adv.bio || 'Professional legal advice for your needs.'}"
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            {status.status === 'none' && (
                                                <button
                                                    onClick={() => handleConnect(adv._id)}
                                                    className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    Connect
                                                </button>
                                            )}
                                            {status.status === 'pending' && status.direction === 'sent' && (
                                                <button
                                                    onClick={() => handleCancelRequest(status.connectionId)}
                                                    className="flex-1 bg-yellow-50 text-yellow-700 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-yellow-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all group"
                                                >
                                                    <Clock className="w-4 h-4 group-hover:hidden" />
                                                    <X className="w-4 h-4 hidden group-hover:block" />
                                                    <span className="group-hover:hidden">Pending</span>
                                                    <span className="hidden group-hover:block">Cancel</span>
                                                </button>
                                            )}
                                            {status.status === 'pending' && status.direction === 'received' && (
                                                <div className="flex-1 flex gap-2">
                                                    <button
                                                        onClick={() => handleRejectRequest(status.connectionId)}
                                                        className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors border border-red-100"
                                                    >
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptRequest(status.connectionId)}
                                                        className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        Accept
                                                    </button>
                                                </div>
                                            )}
                                            {status.status === 'connected' && (
                                                <button
                                                    onClick={() => handleMessage(adv)}
                                                    className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2"
                                                >
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </AnimatePresence>
                )}

                {!loading && advocates.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                            <Search className="w-8 h-8 text-gray-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">No advocates found</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                        <button
                            onClick={clearFilters}
                            className="mt-6 text-blue-600 font-bold hover:underline"
                        >
                            Clear all filters
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default FindAdvocate;