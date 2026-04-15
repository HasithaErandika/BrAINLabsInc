import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { Mail, Lock, User, Briefcase, GraduationCap } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { api } from '@/lib/api';

export const SignUp: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        second_name: '',
        contact_email: '',
        password: '',
        role: 'research_assistant' as 'researcher' | 'research_assistant'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.register(formData);
            navigate('/login', { state: { message: 'Registration successful! Your account is pending admin approval.' } });
        } catch (err: any) {
            setError(err.message || 'Failed to register');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
            <SEO title="Sign Up | BrainLabs" description="Join BrainLabs research community." />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-primary/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg relative z-10"
            >
                <Card className="border-border/50 bg-card/60 backdrop-blur-xl shadow-2xl">
                    <CardHeader className="space-y-2 text-center">
                        <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center border border-primary/20 mb-2">
                            <GraduationCap size={24} className="text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight">Join BrainLabs</CardTitle>
                        <CardDescription>Create your account in our research workspace</CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            {error && (
                                <div className="p-3 text-sm bg-destructive/10 border border-destructive/20 text-destructive rounded-md">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 relative">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">First Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <input
                                            required
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                            className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                            placeholder="John"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Last Name</label>
                                    <input
                                        required
                                        value={formData.second_name}
                                        onChange={(e) => setFormData({...formData, second_name: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="email"
                                        value={formData.contact_email}
                                        onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 pl-10 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase ml-1">Select Role</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'researcher'})}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${formData.role === 'researcher' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'}`}
                                    >
                                        <Briefcase size={16} />
                                        <span className="text-sm font-medium">Researcher</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'research_assistant'})}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-md border transition-all ${formData.role === 'research_assistant' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-background/50 text-muted-foreground hover:border-primary/50'}`}
                                    >
                                        <GraduationCap size={16} />
                                        <span className="text-sm font-medium">Assistant</span>
                                    </button>
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-foreground text-background hover:bg-foreground/90 h-11 transition-all mt-4"
                            >
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        </CardContent>
                    </form>

                    <CardFooter className="flex justify-center border-t border-border/50 pt-6">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};
