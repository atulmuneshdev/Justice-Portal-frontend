import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, NavLink as RouterNavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Home, Users, Briefcase, MessageSquare,
    User as UserIcon, LayoutDashboard, Menu, X,
    Bell, Search, ChevronRight
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Helper to get optimized image URL from ImageKit
    const getOptimizedUrl = (pic, width = 100) => {
        const url = pic?.url || (typeof pic === 'string' ? pic : null);
        if (!url) return null;
        if (url.includes('ik.imagekit.io')) {
            return `${url}?tr=w-${width},q-80`;
        }
        return url;
    };

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navLinks = [
        { to: "/feed", icon: <Home className="w-5 h-5" />, label: "Home" },
        { to: "/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Stats" },
        { to: "/find-advocate", icon: <Users className="w-5 h-5" />, label: "Advocates" },
        ...(user.role === 'advocate' ? [{ to: "/network", icon: <Users className="w-5 h-5 text-indigo-500" />, label: "Network" }] : []),
        { to: "/cases", icon: <Briefcase className="w-5 h-5" />, label: "Cases" },
        { to: "/chat", icon: <MessageSquare className="w-5 h-5" />, label: "Messages" },
    ];

    return (
        <>
            <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-md py-2' : 'bg-white border-b border-gray-100 py-3'}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">

                    {/* Logo */}
                    <Link to="/feed" className="flex items-center gap-2 group">
                        <div className="bg-indigo-600 p-1.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform duration-300">
                            <Shield className="w-6 h-6 text-white fill-indigo-200/20" />
                        </div>
                        <span className="text-xl font-black text-gray-900 tracking-tighter hidden sm:block">
                            Justice<span className="text-indigo-600">Portal</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100">
                        {navLinks.map((link) => (
                            <NavLink key={link.to} {...link} />
                        ))}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Search & Notifications (Desktop Only) */}
                        <div className="hidden lg:flex items-center gap-2">
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                        </div>

                        {/* Profile Link */}
                        <Link to="/profile" className="flex items-center gap-3 group pl-2 sm:pl-4 border-l border-gray-100">
                            <div className="text-right hidden xl:block">
                                <p className="text-sm font-black text-gray-800 leading-none group-hover:text-indigo-600 transition-colors">{user.name}</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{user.role}</p>
                            </div>
                            {user.profilePic ? (
                                <img
                                    src={getOptimizedUrl(user.profilePic, 80)}
                                    alt="Profile"
                                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border-2 border-white shadow-md group-hover:border-indigo-100 transition-all"
                                />
                            ) : (
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-100 transition-all">
                                    <UserIcon className="text-indigo-600 w-5 h-5" />
                                </div>
                            )}
                        </Link>

                        {/* Logout (Desktop Only) */}
                        <button
                            onClick={handleLogout}
                            className="hidden md:flex p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2.5 text-gray-600 bg-gray-50 rounded-xl border border-gray-100 hover:bg-white transition-all"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Bottom Mobile Navigation (Modern Reachability) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100] px-6 py-3 flex justify-between items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {navLinks.slice(0, 4).map((link) => (
                    <RouterNavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 transition-all ${isActive ? 'text-indigo-600 scale-110' : 'text-gray-400'}`
                        }
                    >
                        {link.icon}
                        <span className="text-[10px] font-black uppercase tracking-tighter">{link.label}</span>
                    </RouterNavLink>
                ))}
            </div>

            {/* Mobile Menu Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[90] md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed right-0 top-0 bottom-0 w-[280px] bg-white z-[110] md:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <span className="font-black text-xl tracking-tighter text-gray-900">Menu</span>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                                {navLinks.map((link) => (
                                    <MobileNavLink key={link.to} {...link} />
                                ))}
                                <div className="pt-4 mt-4 border-t border-gray-100">
                                    <MobileNavLink to="/profile" icon={<UserIcon className="w-5 h-5" />} label="My Profile" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all mt-2"
                                    >
                                        <LogOut className="w-5 h-5" />
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-gray-50 border-t border-gray-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                        <Shield className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">JusticePortal</p>
                                        <p className="text-[10px] font-bold text-gray-400">v1.0.0 Stable</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

const NavLink = ({ to, icon, label }) => (
    <RouterNavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${isActive
                ? 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
            }`
        }
    >
        {icon}
        <span className="hidden lg:inline">{label}</span>
    </RouterNavLink>
);

const MobileNavLink = ({ to, icon, label }) => (
    <RouterNavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${isActive
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`
        }
    >
        <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
        </div>
        <ChevronRight className="w-4 h-4 opacity-30" />
    </RouterNavLink>
);

const Shield = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default Navbar;
