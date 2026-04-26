import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Users, Briefcase, MessageSquare, PlusCircle, Search, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();

    const stats = [
        { label: 'Find Advocate', value: '500+', icon: <Users className="w-6 h-6" />, color: 'bg-blue-600', link: '/find-advocate' },
        { label: 'Active Cases', value: '2', icon: <Briefcase className="w-6 h-6" />, color: 'bg-green-600', link: '/cases' },
        { label: 'Messages', value: '15', icon: <MessageSquare className="w-6 h-6" />, color: 'bg-purple-600', link: '/chat' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    };

    return (
        <div className="pt-24 min-h-screen bg-gray-50 p-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto"
            >
                {/* Header Section */}
                <motion.div variants={itemVariants} className="bg-white p-8 rounded-2xl shadow-sm mb-8 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-4xl font-bold text-gray-800">Hello, {user?.name}! 👋</h1>
                        <p className="text-gray-600 mt-3 text-lg">Welcome to your dashboard. Connect with advocates and manage your cases seamlessly.</p>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <Link to="/find-advocate">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-200"
                                >
                                    <Search className="w-5 h-5" />
                                    Find an Advocate
                                </motion.button>
                            </Link>
                            <Link to="/cases">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2"
                                >
                                    <PlusCircle className="w-5 h-5 text-green-600" />
                                    Create New Case
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Briefcase className="w-64 h-64 text-blue-600 transform rotate-12 translate-x-12 -translate-y-12" />
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Link to={stat.link} key={index}>
                            <motion.div
                                variants={itemVariants}
                                whileHover={{ y: -5, shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                className="bg-white p-6 rounded-2xl shadow-sm flex items-center gap-6 border-b-4 border-transparent hover:border-blue-600 transition-all"
                            >
                                <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                    {stat.icon}
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium">{stat.label}</p>
                                    <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity Placeholder */}
                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-blue-600" />
                            Recent Activity
                        </h2>
                        <button className="text-blue-600 font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Users className="w-6 h-6 text-gray-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-gray-800 font-bold">New message from Advocate Smith</p>
                                    <p className="text-gray-500 text-sm">Regarding your case: "Civil Property Dispute"</p>
                                </div>
                                <p className="text-gray-400 text-xs">2 hours ago</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
