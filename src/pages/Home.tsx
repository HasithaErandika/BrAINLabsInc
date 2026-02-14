import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { intro } from '@/data/general';
import { ArrowRight, Brain, Sparkles } from 'lucide-react';
import BrainLabsLogo from '@/components/ui/BrainLabsLogo';
import { NeuralBrainIcon } from '@/components/ui/PageIcons';
import { Link } from 'react-router-dom';

export const Home = () => {
    return (
        <div className="relative">
            {/* Hero Section */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                {/* Premium Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

                {/* Decorative Orbs - Apple-inspired */}
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-20 left-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                        {/* Content - Apple-style large typography */}
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.6, 0.05, 0.01, 0.9] }}
                            className="space-y-6 md:space-y-8 lg:pl-4"
                        >
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full backdrop-blur-sm">
                                <NeuralBrainIcon size={16} />
                                <span className="text-xs md:text-sm font-medium">AI Research Laboratory</span>
                            </div>

                            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1] tracking-tight">
                                <span className="block">Brain-Inspired</span>
                                <span className="block text-primary">AI Solutions</span>
                            </h1>

                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                                {intro.description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                <Link to="/projects">
                                    <Button size="default" className="bg-primary hover:bg-primary/90 group text-sm px-6 h-10">
                                        Explore Research
                                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                                    </Button>
                                </Link>
                                <Link to="/publications">
                                    <Button size="default" variant="outline" className="text-sm px-6 h-10">
                                        View Publications
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Logo Animation */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2, ease: [0.6, 0.05, 0.01, 0.9] }}
                            className="hidden lg:flex justify-center pt-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                <BrainLabsLogo width={400} height={400} className="relative drop-shadow-2xl" />
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                >
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <span className="text-sm">Scroll to explore</span>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full"
                        />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section - Microsoft Fluent inspired */}
            <section className="py-20 bg-card/50 backdrop-blur-xl border-y border-border">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
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
                                className="text-center space-y-2"
                            >
                                <stat.icon className="mx-auto text-primary mb-4" size={28} />
                                <div className="text-3xl font-bold">{stat.value}</div>
                                <div className="text-xs md:text-sm text-muted-foreground uppercase tracking-wider">{stat.label}</div>
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
