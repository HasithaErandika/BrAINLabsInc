import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BrainLabsHorizontalLogo } from '@/components/ui/BrainLabsLogo';
import { useAuth } from '@/context/AuthContext';
import React from 'react';

export const Navbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const navLinks = [
        { label: 'Home', path: '/' },
        { label: 'Projects', path: '/projects' },
        { label: 'Team', path: '/team' },
        { label: 'Publications', path: '/publications' },
        { label: 'Events', path: '/events' },
        { label: 'Blog', path: '/blog' },
        { label: 'About', path: '/about' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsOpen(false);
    };

    const getDashboardLink = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/dashboard/admin';
        if (user.role === 'researcher') return '/dashboard/researcher';
        return '/dashboard/assistant';
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20"> 
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-1 group" onClick={() => setIsOpen(false)}> 
                        <BrainLabsHorizontalLogo width={220} height={55} className="group-hover:opacity-80 transition-opacity" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`text-sm font-medium transition-all relative group ${isActive(link.path)
                                    ? 'text-primary'
                                    : 'text-foreground/70 hover:text-primary'
                                    }`}
                            >
                                {link.label}
                                {isActive(link.path) && (
                                    <span className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary" />
                                )}
                                <span className="absolute -bottom-[20px] left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform" />
                            </Link>
                        ))}
                        
                        <div className="flex items-center gap-2 pl-4 ml-2 border-l border-border/50">
                            {user ? (
                                <div className="flex items-center gap-3">
                                    <Link to={getDashboardLink()}>
                                        <Button size="sm" variant="ghost" className="gap-2 text-foreground/80">
                                            <LayoutDashboard size={16} className="text-primary" />
                                            Dashboard
                                        </Button>
                                    </Link>
                                    <Button size="sm" variant="outline" onClick={handleLogout} className="border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 gap-2">
                                        <LogOut size={14} />
                                        Logout
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link to="/login">
                                        <Button size="sm" variant="ghost" className="hover:text-primary">
                                            Log In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 text-foreground hover:text-primary transition-colors"
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {isOpen && (
                    <div className="md:hidden py-6 bg-background border-t border-border/50 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`text-lg font-medium px-4 py-2 rounded-lg transition-colors ${isActive(link.path)
                                        ? 'bg-primary/5 text-primary'
                                        : 'text-foreground/70 hover:bg-secondary'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                            
                            <div className="mt-4 pt-4 border-t border-border/40 px-2 flex flex-col gap-3">
                                {user ? (
                                    <>
                                        <Link to={getDashboardLink()} onClick={() => setIsOpen(false)} className="w-full">
                                            <Button variant="outline" className="w-full justify-start gap-3 h-12">
                                                <LayoutDashboard size={18} className="text-primary" />
                                                Dashboard
                                            </Button>
                                        </Link>
                                        <Button variant="ghost" onClick={handleLogout} className="w-full justify-start gap-3 h-12 text-destructive hover:bg-destructive/5">
                                            <LogOut size={18} />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link to="/login" onClick={() => setIsOpen(false)}>
                                            <Button variant="ghost" className="w-full h-11">Log In</Button>
                                        </Link>
                                        <Link to="/signup" onClick={() => setIsOpen(false)}>
                                            <Button className="w-full h-11 shadow-lg shadow-primary/20">Sign Up</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};
