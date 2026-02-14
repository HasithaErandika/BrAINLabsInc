import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { team } from '@/data/team';
import { CollaborationIcon } from '@/components/ui/PageIcons';
import { Mail, Linkedin } from 'lucide-react';
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
                <div className="container mx-auto px-4">
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
                                <Card className="h-full hover:shadow-md hover:shadow-primary/5 transition-all duration-300 group border-border/50 hover:border-primary/40">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start gap-3">
                                            {/* Avatar */}
                                            <div className="shrink-0">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-14 h-14 rounded-full object-cover ring-2 ring-border group-hover:ring-primary/30 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                                        <span className="text-lg font-semibold text-primary">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-base font-semibold mb-0.5 group-hover:text-primary transition-colors">
                                                    {member.name}
                                                </CardTitle>
                                                <CardDescription className="text-xs mb-1">{member.position}</CardDescription>
                                                <p className="text-xs text-muted-foreground/70">{member.university}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-3 pt-0">
                                        {/* Research Interests */}
                                        <div className="space-y-2">
                                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                                                Research Interests
                                            </div>
                                            <div className="flex flex-wrap gap-1.5">
                                                {member.researchInterests.map((interest, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="bg-primary/8 text-primary hover:bg-primary/15 text-[10px] px-2 py-0.5 font-medium"
                                                    >
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="flex gap-2 pt-1">
                                            {member.contact && (
                                                <a
                                                    href={`mailto:${member.contact}`}
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Mail size={12} />
                                                    <span>Email</span>
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Linkedin size={12} />
                                                    <span>LinkedIn</span>
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

            {/* CTA Section */}
            <section className="py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-2xl mx-auto text-center space-y-5"
                    >
                        <h2 className="text-2xl md:text-3xl font-bold">
                            Join Our Team
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                            We regularly accept interns and PhD candidates. Check out our open positions or get in touch to learn more about opportunities at BrAIN Labs.
                        </p>
                        <Link to="/contact">
                            <Button className="bg-primary hover:bg-primary/90 text-sm h-9 px-5 mt-2">
                                <Mail className="mr-1.5" size={14} />
                                Contact Us
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
