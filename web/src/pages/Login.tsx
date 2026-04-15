import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { useAuth } from '@/context/AuthContext';

export const Login: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const successMessage = location.state?.message;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await login({ email, password });
            // Redirect based on role
            // In a real app we'd fetch the user role from context after login
        } catch (err: any) {
            setError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    // Redirect logic moved to a useEffect or handled by useAuth state in App.tsx
    // For simplicity here, we'll watch the user state if needed, but let's just 
    // use a simple redirect in the handleSubmit for now or let the user navigate.
    
    return (
        <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
            <SEO title="Login | BrainLabs" description="Sign in to your BrainLabs workspace." />

            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -right-1/4 w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-[100px]" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full max-w-md relative z-10"
            >
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-3 pb-6 text-center">
                        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center border border-primary/20 mb-2">
                            <NeuralBrainIcon size={24} className="text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
                        <CardDescription className="text-muted-foreground">
                            Enter your credentials to access your workspace
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {successMessage && (
                                <div className="p-3 text-sm bg-primary/10 border border-primary/20 text-primary rounded-md flex items-center gap-2">
                                    <CheckCircle2 size={16} />
                                    {successMessage}
                                </div>
                            )}
                            
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2 relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        required
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@brainlabs.edu"
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <input
                                        required
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
                                    <input type="checkbox" className="rounded border-input bg-transparent text-primary focus:ring-primary" />
                                    Remember me
                                </label>
                                <a href="#" className="text-primary hover:underline font-medium">Forgot password?</a>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 text-sm font-medium mt-2"
                            >
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </CardContent>
                    </form>

                    <CardFooter className="flex flex-col gap-4 border-t border-border/50 pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-medium text-primary hover:underline">
                                Create an account
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};
