import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { intro } from '@/data/general';
import { grants } from '@/data/grants';
import { ArrowRight, Brain, Sparkles, Award } from 'lucide-react';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CursorEffect } from '@/components/ui/CursorEffect';
import { BrainNetwork } from '@/components/ui/BrainNetwork';

export const Home = () => {
    return (
        <div className="relative">
            <CursorEffect />
            {/* Hero Section */}
            <section className="relative min-h-[calc(100vh-5rem)] flex items-center justify-center overflow-hidden py-10 md:py-0">
                {/* Premium Background */}
                <div className="absolute inset-0 bg-background" />

                {/* Decorative Orbs - Subtle & Professional */}
                <div className="absolute top-1/4 right-10 w-[30rem] h-[30rem] bg-foreground/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 left-10 w-[40rem] h-[40rem] bg-foreground/3 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        {/* Content - Professional Typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 border border-border bg-card px-4 py-1.5 rounded-full">
                                <NeuralBrainIcon size={14} className="text-foreground" />
                                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Research Laboratory</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-foreground">
                                <span className="block">Brain-Inspired</span>
                                <span className="block text-muted-foreground">Intelligence.</span>
                            </h1>

                            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                                {intro.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link to="/projects">
                                    <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8 h-12 text-sm font-medium">
                                        Explore Research
                                        <ArrowRight className="ml-2" size={16} />
                                    </Button>
                                </Link>
                                <Link to="/publications">
                                    <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-sm font-medium border-border hover:bg-secondary">
                                        View Publications
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Hero Graphic / 3D Element - Electric Brain */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="relative hidden lg:flex justify-center items-center h-full w-full"
                        >
                            <div className="relative w-full h-[500px] max-w-lg flex items-center justify-center">
                                {/* Abstract Background Glow */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-foreground/5 to-transparent rounded-full blur-3xl" />

                                {/* 3D Brain Network */}
                                <div className="relative z-10 w-full h-full">
                                    <BrainNetwork />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                    <div className="flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Scroll</span>
                        <motion.div
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-px h-12 bg-gradient-to-b from-foreground/50 to-transparent"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section - Clean & Minimal */}
            <section className="py-24 bg-card border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-6xl mx-auto">
                        {[
                            { value: "8", label: "Researchers", icon: Brain },
                            { value: "7", label: "Active Projects", icon: Sparkles },
                            { value: "3", label: "Publications", icon: ArrowRight },
                            { value: "2+", label: "Research Areas", icon: ArrowRight }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                className="text-center group"
                            >
                                <div className="mb-6 flex justify-center">
                                    <div className="p-4 rounded-full bg-secondary group-hover:bg-foreground/5 transition-colors">
                                        <stat.icon className="text-foreground" size={24} />
                                    </div>
                                </div>
                                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grants Section */}
            <section className="py-20 bg-background relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-4">
                            <Award size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">Recognition</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Research Grants</h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Supported by leading funding agencies to pioneer the next generation of AI.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {grants.map((grant, idx) => (
                            <motion.div
                                key={grant.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                            >
                                <Card className="h-full border-border/50 hover:border-primary/30 transition-colors">
                                    <CardHeader>
                                        <div className="flex justify-between items-start gap-4">
                                            <CardTitle className="text-xl leading-tight">{grant.title}</CardTitle>
                                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground whitespace-nowrap">
                                                {grant.year}
                                            </span>
                                        </div>
                                        <div className="text-sm font-medium text-primary pt-1">{grant.agency}</div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {grant.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto text-center space-y-8"
                    >
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
                            Ready to explore the future of AI?
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Discover our cutting-edge research and join us in pushing the boundaries of artificial intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link to="/team">
                                <Button size="default" className="bg-primary hover:bg-primary/90 text-sm px-6 h-10">
                                    Meet the Team
                                </Button>
                            </Link>
                            <Link to="/contact">
                                <Button size="default" variant="outline" className="text-sm px-6 h-10">
                                    Get in Touch
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
