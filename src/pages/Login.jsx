import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Phone, User, Briefcase, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ReactTyped } from "react-typed";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('client'); // 'client' or 'advocate'
    const [loginType, setLoginType] = useState('email'); // 'email' or 'phone'
    const [formData, setFormData] = useState({ email: '', phone: '', password: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Login form submitted:', { role, loginType, formData });
        try {
            await login(formData, role);
            toast.success(`Welcome back, ${role}!`);
            navigate('/feed');
        } catch (error) {
            console.error('Login Error in component:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Login Failed';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="min-h-screen  flex flex-col lg:flex-row items-center justify-between py-3 px-4 sm:px-6 lg:px-8">
            



            {/* left side */}
            <div className="flex flex-col items-center justify-center text-center px-4 py-10  h-[100dvh] lg:h-full  ">

                {/* Logo */}
                <div style={{ perspective: 1000 }} className="relative w-fit mx-auto flex flex-col items-center mb-10">

                    {/* Shine Effect */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-linear-to-r from-transparent via-white/40 to-transparent"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    />

                    {/* Logo */}
                    <motion.img
                        src="log.png"
                        alt="Justice Portal"
                        className="w-24 mb-4 relative z-10"

                        initial={{ opacity: 0, y: 100, rotateY: -180 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            rotateY: 360
                        }}

                        transition={{
                            opacity: { duration: 1 },
                            y: { duration: 1 },
                            rotateY: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear"
                            }
                        }}

                        style={{ transformStyle: "preserve-3d" }}
                    />

                    <h1 className="text-4xl font-bold">Justice Portal ⚖️</h1>

                </div>
                {/* Typed Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <ReactTyped
                        strings={[
                            "Welcome Back, Advocate ⚖️",
                            "Your Legal Command Center",
                            "Justice Portal Dashboard"
                        ]}
                        typeSpeed={70}
                        backSpeed={40}
                        loop
                        className="font-extrabold text-3xl md:text-4xl text-gray-900"
                    />
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    className="text-gray-500 mt-3 max-w-md font-bold  text-2xl md:text-base"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Manage cases, collaborate with advocates, and streamline your legal workflow — all in one secure platform.
                </motion.p>

                {/* Feature Highlights */}
                <motion.div
                    className="flex flex-wrap justify-center gap-3 mt-6 text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <span className="bg-gray-100 px-3 py-1 font-bold rounded-full shadow-lg/30">📁 Case Management</span>
                    <span className="bg-gray-100 px-3 py-1 font-bold rounded-full shadow-lg/30">💬 Advocate Chat</span>
                    <span className="bg-gray-100 px-3 py-1 font-bold rounded-full shadow-lg/30">📸 Media Posts</span>
                    <span className="bg-gray-100 px-3 py-1 font-bold rounded-full shadow-lg/30">🤝 Connect Network</span>
                </motion.div>

            </div>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-linear-to-t to-black/20 from-lime-400/10 h-[50%] p-3 sm:p-10 rounded-2xl shadow-xl border border-gray-100"
            >
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`${role === 'advocate' ? 'bg-indigo-600' : 'bg-blue-600'} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transition-colors rotate-12`}
                    >
                        <LogIn className="text-white w-8 h-8 -rotate-12" />
                    </motion.div>


                    <h2 className="text-3xl font-extrabold text-gray-900">
                        <ReactTyped
                            strings={["Justice Portal"]}
                            typeSpeed={100}
                            backSpeed={50}
                            loop={false}
                            
                        />
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">Please enter your details to sign in.</p>
                </div>

                {/* Role Selector */}
                <div className="flex bg-gray-50 p-1.5 rounded-2xl shadow-inner mb-8">
                    <button
                        type="button"
                        onClick={() => setRole('client')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${role === 'client' ? 'bg-white text-blue-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User className="w-4 h-4" />
                        Client
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('advocate')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-300 ${role === 'advocate' ? 'bg-white text-indigo-600 shadow-md' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Advocate
                    </button>
                </div>

                {/* Login Method Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        type="button"
                        onClick={() => setLoginType('email')}
                        className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${loginType === 'email' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        Email
                    </button>
                    <button
                        type="button"
                        onClick={() => setLoginType('phone')}
                        className={`px-6 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${loginType === 'phone' ? 'bg-gray-900 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                    >
                        Phone
                    </button>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {loginType === 'email' ? (
                            <div>
                                <label className="text-xs font-bold text-black uppercase tracking-wider ml-1">Email Address</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute  left-3 top-3.5 w-5 h-5 text-gray-900" />
                                    <input
                                        type="email"
                                        required
                                        className="appearance-none block w-full pl-10 pr-4 py-3 border placeholder-gray-900 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                        placeholder="name@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value, phone: '' })}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                                <div className="relative mt-1">
                                    <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                    <input
                                        type="tel"
                                        required
                                        className="appearance-none block w-full pl-10 pr-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                                        placeholder="+1 (555) 000-0000"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value, email: '' })}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-900 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-900" />
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
                            className={`group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white ${role === 'advocate' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg shadow-blue-100`}
                        >
                            Sign In
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <p className="text-sm text-gray-500">
                        New to JusticePortal?{' '}
                        <Link to="/register" className={`font-bold hover:underline ${role === 'advocate' ? 'text-indigo-600' : 'text-green-600'}`}>
                            Create an account
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
