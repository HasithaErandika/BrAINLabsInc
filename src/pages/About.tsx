import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mission, collaborations, futureDirections, faq } from '@/data/general';
import * as Icons from 'lucide-react';
import { Target, Handshake, Rocket, HelpCircle, ArrowRight } from 'lucide-react';
import { MissionCompassIcon } from '@/components/ui/PageIcons';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const About = () => {
    const MissionIcon = (Icons as any)[mission.iconName] || Target;
    const CollabIcon = (Icons as any)[collaborations.iconName] || Handshake;
    const FutureIcon = (Icons as any)[futureDirections.iconName] || Rocket;

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="relative pt-24 md:pt-32 pb-12 md:pb-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-3xl lg:pl-4"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full mb-5">
                            <MissionCompassIcon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">About Us</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Pioneering AI Research
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            Exploring the intersection of artificial intelligence and neuroscience to build the next generation of intelligent systems.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-12 md:py-16">
                <div className="container mx-auto px-4 lg:pl-8">
                    <div className="max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-primary/10 rounded-lg">
                                    <MissionIcon className="text-primary" size={24} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">{mission.title}</h2>
                            </div>
                            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl">
                                {mission.description}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-5">
                            {mission.points.map((point, idx) => {
                                const PointIcon = (Icons as any)[point.iconName] || Target;
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                                    >
                                        <Card className="h-full hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/40 group">
                                            <CardHeader className="space-y-4">
                                                <PointIcon className="text-primary group-hover:scale-110 transition-transform duration-300" size={28} />
                                                <p className="text-sm font-medium leading-relaxed">
                                                    {point.text}
                                                </p>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* Collaborations */}
            <section className="py-16 bg-muted/30">
                <div className="container mx-auto px-4 lg:pl-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-2.5 bg-primary/10 rounded-lg shrink-0 mt-1">
                                <CollabIcon className="text-primary" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold mb-3">{collaborations.title}</h2>
                                <p className="text-base text-muted-foreground leading-relaxed mb-6">
                                    {collaborations.description}
                                </p>
                                <Link to="/contact">
                                    <Button variant="outline" size="sm" className="group">
                                        Partner with Us
                                        <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Future Directions */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4 lg:pl-8">
                    <div className="max-w-5xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-10"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2.5 bg-primary/10 rounded-lg">
                                    <FutureIcon className="text-primary" size={24} />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold">{futureDirections.title}</h2>
                            </div>
                            <p className="text-base text-muted-foreground leading-relaxed max-w-3xl">
                                {futureDirections.description}
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {futureDirections.points.map((point, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -10 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                                >
                                    <Card className="h-full hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/40 group">
                                        <CardContent className="pt-6 flex items-start gap-3">
                                            <div className="min-w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-125 transition-transform" />
                                            <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground transition-colors">
                                                {point}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-muted/30 border-t border-border/50">
                <div className="container mx-auto px-4 lg:pl-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-primary/10 rounded-lg">
                                <HelpCircle className="text-primary" size={24} />
                            </div>
                            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
                        </div>

                        <Accordion type="single" collapsible className="space-y-3">
                            {faq.map((item, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border border-border/60 rounded-lg px-4 bg-background/50">
                                    <AccordionTrigger className="text-base font-medium hover:text-primary transition-colors py-4">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
