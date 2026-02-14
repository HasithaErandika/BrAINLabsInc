import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { team } from '@/data/team';
import { CollaborationIcon } from '@/components/ui/PageIcons';
import { Mail, Linkedin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Team = () => {
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
                            <CollaborationIcon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">Our Team</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Meet the Researchers
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            A multidisciplinary team of experts pushing the boundaries of AI and neuroscience research.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 lg:pl-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08, duration: 0.5 }}
                                whileHover={{ y: -3 }}
                            >
                                <Card className="h-full border-border/50 hover:border-primary/40 transition-all duration-300 group">
                                    <CardHeader className="pb-3 pt-6 px-6">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="shrink-0">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-16 h-16 rounded-full object-cover ring-1 ring-border group-hover:ring-primary/30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center ring-1 ring-border">
                                                        <span className="text-xl font-bold text-primary/70">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pt-1">
                                                <CardTitle className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors">
                                                    {member.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs font-medium text-primary mb-0.5 uppercase tracking-wide">
                                                    {member.position}
                                                </CardDescription>
                                                <p className="text-xs text-muted-foreground truncate">{member.university}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="px-6 pb-6 space-y-4">
                                        {/* Research Interests */}
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest opacity-80">
                                                Research Areas
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {member.researchInterests.slice(0, 4).map((interest, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="bg-secondary/50 text-foreground/80 hover:bg-primary/10 hover:text-primary text-[10px] px-2 py-0.5 font-medium border border-transparent hover:border-primary/20 transition-colors"
                                                    >
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="flex gap-3 pt-2 border-t border-border/40">
                                            {member.contact && (
                                                <a
                                                    href={`mailto:${member.contact}`}
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                                                >
                                                    <Mail size={14} />
                                                    <span>Email</span>
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                                                >
                                                    <Linkedin size={14} />
                                                    <span>LinkedIn</span>
                                                </a>
                                            )}
                                            {member.website && (
                                                <a
                                                    href={member.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors py-1"
                                                >
                                                    <Globe size={14} />
                                                    <span>Web</span>
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

            {/* CTA Section - Minimalist */}
            <section className="py-16 border-t border-border/40">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl mx-auto text-center space-y-6"
                    >
                        <h2 className="text-2xl font-bold">
                            Join Our Team
                        </h2>
                        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
                            We regularly accept interns and PhD candidates. Check out our open positions or get in touch regarding opportunities.
                        </p>
                        <Link to="/contact">
                            <Button variant="outline" className="h-9 px-6 text-sm hover:bg-primary hover:text-primary-foreground">
                                <Mail className="mr-2" size={14} />
                                Contact Us
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
