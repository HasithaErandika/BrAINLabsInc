import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { team } from '@/data/team';
import { CollaborationIcon } from '@/components/ui/PageIcons';
import { Mail, Linkedin, Globe, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Team = () => {
    return (
        <div className="min-h-screen relative overflow-hidden bg-background">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-[40rem] h-[40rem] bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-[10%] left-[-10%] w-[35rem] h-[35rem] bg-secondary/10 rounded-full blur-3xl" />
            </div>

            {/* Hero Header */}
            <section className="relative pt-32 pb-16 md:pb-24">
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border/50 text-foreground px-4 py-1.5 rounded-full mb-6"
                        >
                            <CollaborationIcon size={16} className="text-primary" />
                            <span className="text-xs font-medium uppercase tracking-wider">World-Class Minds</span>
                        </motion.div>

                        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 tracking-tight text-foreground">
                            Meet the <span className="text-muted-foreground">Architects</span><br />
                            of Intelligence.
                        </h1>

                        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            A multidisciplinary collective of neuroscientists, engineers, and researchers united by a single vision: decoding the brain to build the future of AI.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Team Grid */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                            >
                                <Card className="h-full group relative overflow-hidden border-border/40 bg-card/30 backdrop-blur-md hover:bg-card/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2">
                                    {/* Glowing Border Layout */}
                                    <div className="absolute inset-0 border border-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                    <CardHeader className="pt-8 pb-4 flex flex-col items-center text-center relative z-10">
                                        {/* Avatar Container */}
                                        <div className="relative mb-6">
                                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-br from-border to-transparent group-hover:from-primary/50 transition-all duration-500">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-full h-full rounded-full object-cover border-4 border-background"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center border-4 border-background">
                                                        <span className="text-3xl font-bold text-muted-foreground/50">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors duration-300">
                                            {member.name}
                                        </h3>
                                        <p className="text-sm font-medium text-primary tracking-wide uppercase mb-1">{member.position}</p>
                                        <p className="text-xs text-muted-foreground">{member.university}</p>
                                    </CardHeader>

                                    <CardContent className="space-y-6 text-center relative z-10 pb-8">
                                        {/* Research Interests */}
                                        <div className="flex flex-wrap gap-2 justify-center px-4">
                                            {member.researchInterests.slice(0, 3).map((interest, i) => (
                                                <Badge
                                                    key={i}
                                                    variant="outline"
                                                    className="bg-background/50 border-border/50 text-[10px] px-2.5 py-1 font-medium text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground transition-all duration-300"
                                                >
                                                    {interest}
                                                </Badge>
                                            ))}
                                        </div>

                                        {/* Social Actions - Reveal on Hover */}
                                        <div className="flex items-center justify-center gap-4 pt-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
                                            {member.contact && (
                                                <a
                                                    href={`mailto:${member.contact}`}
                                                    className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110"
                                                    title="Email"
                                                >
                                                    <Mail size={16} />
                                                </a>
                                            )}
                                            {member.website && (
                                                <a
                                                    href={member.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110"
                                                    title="Website"
                                                >
                                                    <Globe size={16} />
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-110"
                                                    title="LinkedIn"
                                                >
                                                    <Linkedin size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Join Section */}
            <section className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-background" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl mx-auto text-center space-y-8 bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold">
                            Join the Lab
                        </h2>
                        <p className="text-muted-foreground text-lg">
                            We are always looking for exceptional interns and PhD candidates who share our passion for brain-inspired AI.
                        </p>
                        <div className="flex justify-center gap-4">
                            <Link to="/contact">
                                <Button size="lg" className="rounded-full px-8 bg-foreground text-background hover:bg-foreground/90">
                                    Get in Touch
                                    <ArrowUpRight className="ml-2" size={16} />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
