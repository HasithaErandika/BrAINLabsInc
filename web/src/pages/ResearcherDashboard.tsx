import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Brain, Download, Settings, Sparkles, TrendingUp, Users, AlertCircle, Megaphone, FileText } from 'lucide-react';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { useAuth } from '@/context/AuthContext';

export const ResearcherDashboard: React.FC = () => {
    const { user } = useAuth();
    const isPending = user?.approval_status === 'PENDING';

    return (
        <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <SEO title="Researcher Dashboard | BrainLabs" />

            {isPending && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-4 text-amber-600 dark:text-amber-500 shadow-sm"
                >
                    <div className="p-2 bg-amber-500/20 rounded-full animate-pulse">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm">Account Pending Approval</h4>
                        <p className="text-xs opacity-90">An admin is reviewing your researcher credentials. Some features will be unlocked once verified.</p>
                    </div>
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                            <NeuralBrainIcon size={20} className="text-primary" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Researcher Workspace</h1>
                    </div>
                    <p className="text-muted-foreground ml-1">Welcome back, {user?.first_name} {user?.second_name}.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap items-center gap-3"
                >
                    <Button variant="outline" size="sm" className="gap-2 border-border/60 hover:bg-secondary">
                        <Download size={16} />
                        Export
                    </Button>
                    
                    {!isPending && (
                        <>
                            <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                <Megaphone size={16} />
                                Host Event
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                <FileText size={16} />
                                New Grant
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                                <Sparkles size={16} />
                                New Project
                            </Button>
                        </>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { title: "Active Projects", value: "4", icon: Brain, change: "+1 this month" },
                    { title: "Citations", value: "1,204", icon: TrendingUp, change: "+84 this week" },
                    { title: "Publications", value: "12", icon: BookOpen, change: "Under review: 2" },
                    { title: "Team Members", value: "8", icon: Users, change: "3 assistants" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                    >
                        <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:bg-card/80 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.change}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <motion.div 
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Current Research</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Ongoing initiatives and their status</p>
                            </div>
                            <Button variant="ghost" size="icon"><Settings size={18} /></Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { name: "Neuromorphic Vision Transformers", progress: 78, status: "Data Analysis" },
                                { name: "LLM Hallucination Mitigation", progress: 45, status: "Model Training" },
                                { name: "Energy-efficient Spiking Networks", progress: 92, status: "Paper Drafting" }
                            ].map((project, i) => (
                                <div key={i} className="p-4 rounded-lg bg-background/50 border border-border/30 hover:border-primary/30 transition-colors">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-semibold">{project.name}</h3>
                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                            project.progress > 80 ? 'bg-green-500/10 text-green-500' :
                                            project.progress > 50 ? 'bg-primary/10 text-primary' :
                                            'bg-amber-500/10 text-amber-500'
                                        }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-primary h-full rounded-full" 
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-2 text-right">{project.progress}% Complete</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Sidebar */}
                <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                {[
                                    { action: "Dataset approved", time: "2 hours ago", author: "Dr. Jenkins" },
                                    { action: "Model weights uploaded", time: "5 hours ago", author: "Alex (Assistant)" },
                                    { action: "Meeting notes added", time: "Yesterday", author: "Dr. Jenkins" }
                                ].map((activity, i) => (
                                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-primary bg-background shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow" />
                                        <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-border/50 bg-background/50 text-sm shadow-sm group-hover:border-primary/30 transition-colors">
                                            <div className="font-medium text-foreground">{activity.action}</div>
                                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                                <span>{activity.author}</span>
                                                <span>{activity.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};
