import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { mission, collaborations, futureDirections, faq } from '@/data/general';
import * as Icons from 'lucide-react';
import { Target, Handshake, Rocket, HelpCircle } from 'lucide-react';
import { MissionCompassIcon } from '@/components/ui/PageIcons';

export const About = () => {
    const MissionIcon = (Icons as any)[mission.iconName] || Target;
    const CollabIcon = (Icons as any)[collaborations.iconName] || Handshake;
    const FutureIcon = (Icons as any)[futureDirections.iconName] || Rocket;

    return (
        <div className="min-h-screen">
            {/* Hero Header */}
            <section className="relative py-24 md:py-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-4xl"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <MissionCompassIcon size={18} />
                            <span className="text-sm font-medium">About Us</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center gap-4">
                            <MissionCompassIcon size={64} className="text-primary" />
                            About BrAINLabs
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Pioneering research at the intersection of artificial intelligence and neuroscience.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary/10 rounded-2xl">
                                <MissionIcon className="text-primary" size={36} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">{mission.title}</h2>
                        </div>

                        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                            {mission.description}
                        </p>

                        <div className="grid md:grid-cols-3 gap-6">
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
                                        <Card className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/50 group">
                                            <CardHeader>
                                                <PointIcon className="text-primary mb-4 group-hover:scale-110 transition-transform" size={32} />
                                                <CardDescription className="text-base text-foreground leading-relaxed">
                                                    {point.text}
                                                </CardDescription>
                                            </CardHeader>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Collaborations */}
            <section className="py-16 bg-card/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto"
                    >
                        <Card className="border-primary/20">
                            <CardHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <CollabIcon className="text-primary" size={32} />
                                    <CardTitle className="text-3xl">{collaborations.title}</CardTitle>
                                </div>
                                <CardDescription className="text-lg leading-relaxed">
                                    {collaborations.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </motion.div>
                </div>
            </section>

            {/* Future Directions */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary/10 rounded-2xl">
                                <FutureIcon className="text-primary" size={36} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">{futureDirections.title}</h2>
                        </div>

                        <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
                            {futureDirections.description}
                        </p>

                        <div className="grid md:grid-cols-2 gap-6">
                            {futureDirections.points.map((point, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                                >
                                    <Card className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/50">
                                        <CardContent className="pt-6">
                                            <p className="text-base leading-relaxed">{point}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-16 bg-card/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-4 bg-primary/10 rounded-2xl">
                                <HelpCircle className="text-primary" size={36} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold">Frequently Asked Questions</h2>
                        </div>

                        <Accordion type="single" collapsible className="space-y-4">
                            {faq.map((item, idx) => (
                                <AccordionItem key={idx} value={`item-${idx}`} className="border border-border rounded-lg px-6 bg-card">
                                    <AccordionTrigger className="text-lg font-semibold hover:text-primary transition-colors">
                                        {item.question}
                                    </AccordionTrigger>
                                    <AccordionContent className="text-base text-muted-foreground leading-relaxed">
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
