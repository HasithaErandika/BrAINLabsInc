import React from 'react';
import { motion } from 'framer-motion';
import { SEO } from '@/components/shared/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Calendar, CheckCircle2, ClipboardList, Clock, Library, AlertCircle, FileText, Sparkles, GraduationCap } from 'lucide-react';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { useAuth } from '@/context/AuthContext';

export const ResearchAssistantDashboard: React.FC = () => {
    const { user } = useAuth();
    const isPending = user?.approval_status === 'PENDING';

    return (
        <div className="relative min-h-screen pt-24 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
            <SEO title="Assistant Dashboard | BrainLabs" />

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
                        <h4 className="font-bold text-sm">Account Verification Required</h4>
                        <p className="text-xs opacity-90">Your profile is currently under review by the administration. You'll gain publishing rights once approved.</p>
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
                        <h1 className="text-3xl font-bold tracking-tight">Assistant Workspace</h1>
                    </div>
                    <p className="text-muted-foreground ml-1">Welcome back, {user?.first_name}. Here is your research overview.</p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-wrap items-center gap-3"
                >
                    {!isPending && (
                        <>
                            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                <FileText size={16} />
                                Post Blog
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary">
                                <GraduationCap size={16} />
                                New Tutorial
                            </Button>
                            <Button size="sm" className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
                                <Sparkles size={16} />
                                New Project
                            </Button>
                        </>
                    )}
                    <Button variant="outline" size="sm" className="gap-2 border-border/60">
                        <Calendar size={16} />
                        Schedule
                    </Button>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { title: "Assigned Tasks", value: "12", icon: ClipboardList, subtitle: "3 due today" },
                    { title: "Hours Logged", value: "32.5", icon: Clock, subtitle: "This week" },
                    { title: "Completed Hits", value: "156", icon: CheckCircle2, subtitle: "Data annotation" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
                    >
                        <Card className="bg-card/60 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task List */}
                <motion.div 
                    className="lg:col-span-2 space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
                        <CardHeader>
                            <CardTitle>My Tasks</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { title: "Annotate EEG dataset batches 4-6", project: "Neuromorphic Vision", priority: "High", status: "In Progress" },
                                { title: "Review literature on Spiking NNs", project: "General Research", priority: "Medium", status: "Pending" },
                                { title: "Prepare lab equipment for Tuesday", project: "Hardware Setup", priority: "Low", status: "Pending" },
                                { title: "Format references for recent paper", project: "LLM Mitigation", priority: "High", status: "Completed" },
                            ].map((task, i) => (
                                <div key={i} className={`p-4 rounded-lg border transition-colors ${task.status === 'Completed' ? 'bg-background/20 border-border/30 opacity-75' : 'bg-background/50 border-border/50 hover:border-primary/30'}`}>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <button className={`mt-0.5 shrink-0 w-5 h-5 rounded-full border flex items-center justify-center ${task.status === 'Completed' ? 'bg-primary border-primary text-background' : 'border-muted-foreground/50 hover:border-primary'}`}>
                                                {task.status === 'Completed' && <CheckCircle2 size={12} />}
                                            </button>
                                            <div>
                                                <h4 className={`font-medium ${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>{task.title}</h4>
                                                <p className="text-xs text-muted-foreground mt-1">{task.project}</p>
                                            </div>
                                        </div>
                                        {task.status !== 'Completed' && (
                                            <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full shrink-0 ${
                                                task.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                                                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                                                'bg-blue-500/10 text-blue-500'
                                            }`}>
                                                {task.priority}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Useful Links / Resources */}
                <motion.div 
                    className="space-y-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Card className="bg-card/60 backdrop-blur-sm border-border/50 h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Library size={18} className="text-primary" />
                                Resources
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "Lab Safety Guidelines v2.4",
                                "Data Annotation Protocol Handbook",
                                "Server Access Instructions",
                                "Weekly Team Meeting Notes Document"
                            ].map((resource, i) => (
                                <a key={i} href="#" className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:bg-background/80 hover:border-border/50 transition-colors group">
                                    <div className="w-8 h-8 rounded shrink-0 bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-background transition-colors">
                                        <BookOpen size={14} />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">{resource}</span>
                                </a>
                            ))}
                            <Button variant="ghost" className="w-full mt-2 text-sm">View All Resources</Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};
