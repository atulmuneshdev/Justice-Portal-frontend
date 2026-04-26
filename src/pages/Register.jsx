import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Lock, Phone, User, Briefcase, Award, BookOpen, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState(null); // null initially to force selection
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        phone: '', 
        password: '',
        specialization: '',
        experience: '',
        bio: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!role) {
            toast.error('Please select an account type');
            return;
        }
        console.log('Registration form submitted:', { role, formData });
        try {
            await register(formData, role);
            toast.success(`Registration Successful! Welcome ${role}.`);
            navigate('/feed');
        } catch (error) {
            console.error('Registration Error in component:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Registration Failed';
            toast.error(errorMessage);
        }
    };

    if (!role) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-12"
                >
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">Choose Account Type</h2>
                        <p className="text-gray-500 font-bold">How would you like to join JusticePortal?</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => setRole('client')}
                            className="p-8 rounded-3xl border-2 border-gray-100 hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                        >
                            <div className="bg-green-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-green-200 transition-colors">
                                <User className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">I'm a Client</h3>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed">I need legal assistance and want to connect with expert advocates.</p>
                        </motion.button>

                        <motion.button
                            whileHover={{ y: -5 }}
                            onClick={() => setRole('advocate')}
                            className="p-8 rounded-3xl border-2 border-gray-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
                        >
                            <div className="bg-indigo-100 p-4 rounded-2xl w-fit mb-6 group-hover:bg-indigo-200 transition-colors">
                                <Briefcase className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">I'm an Advocate</h3>
                            <p className="text-gray-500 text-sm font-bold leading-relaxed">I'm a legal professional looking to build my network and help clients.</p>
                        </motion.button>
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 text-sm font-bold">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:underline">Sign In</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-6 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-md lg:max-w-300 w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100"
            >
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={() => setRole(null)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className={`${role === 'advocate' ? 'bg-indigo-100' : 'bg-green-100'} p-3 rounded-xl transition-colors`}>
                            <UserPlus className={`${role === 'advocate' ? 'text-indigo-600' : 'text-green-600'} w-6 h-6`} />
                        </div>
                        <div className="w-6"></div> {/* Spacer */}
                    </div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {role === 'advocate' ? 'Advocate Registration' : 'Client Registration'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Complete your profile to get started
                    </p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Full Name</label>
                            <div className="relative mt-1">
                                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                <input
                                    type="text"
                                    required
                                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Email</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                    <input
                                        type="email"
                                        className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                        placeholder="email@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone</label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                    <input
                                        type="tel"
                                        className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                        placeholder="+1 234 567 890"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {role === 'advocate' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Advocate Type / Specialization</label>
                                            <div className="relative mt-1">
                                                <Award className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                                <select
                                                    required={role === 'advocate'}
                                                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm bg-white"
                                                    value={formData.specialization}
                                                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                                >
                                                    <option value="">Select Specialization</option>
                                                    <option value="Criminal Law">Criminal Law</option>
                                                    <option value="Civil Law">Civil Law</option>
                                                    <option value="Corporate Law">Corporate Law</option>
                                                    <option value="Family Law">Family Law</option>
                                                    <option value="Tax Law">Tax Law</option>
                                                    <option value="Intellectual Property">Intellectual Property</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Experience</label>
                                            <div className="relative mt-1">
                                                <Briefcase className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                                <input
                                                    type="number"
                                                    required={role === 'advocate'}
                                                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                                    placeholder="Years"
                                                    value={formData.experience}
                                                    onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Short Bio</label>
                                        <div className="relative mt-1">
                                            <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                            <textarea
                                                rows="2"
                                                className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                                placeholder="Professional summary..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            ></textarea>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                <input
                                    type="password"
                                    required
                                    className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${role === 'advocate' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-100 mt-6`}
                        >
                            Sign up as {role.charAt(0).toUpperCase() + role.slice(1)}
                        </motion.button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className={`font-bold hover:underline ${role === 'advocate' ? 'text-indigo-600' : 'text-green-600'}`}>
                            Log in
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
