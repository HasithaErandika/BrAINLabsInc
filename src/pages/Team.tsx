import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { team } from '@/data/team';
import { CollaborationIcon } from '@/components/ui/PageIcons';
import { Mail, Globe, Linkedin } from 'lucide-react';

export const Team = () => {
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
                            <CollaborationIcon size={18} />
                            <span className="text-sm font-medium">Our Team</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center gap-4">
                            <CollaborationIcon size={64} className="text-primary" />
                            Meet the Researchers
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            A multidisciplinary team of experts pushing the boundaries of AI and neuroscience research.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Team Grid */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {team.map((member, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                            >
                                <Card className="h-full hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group border-border/50 hover:border-primary/50">
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            {/* Avatar */}
                                            <div className="shrink-0">
                                                {member.image ? (
                                                    <img
                                                        src={member.image}
                                                        alt={member.name}
                                                        className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 group-hover:scale-110 transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                        <span className="text-2xl font-bold text-primary">
                                                            {member.name.split(' ').map(n => n[0]).join('')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <CardTitle className="text-xl mb-1 group-hover:text-primary transition-colors">
                                                    {member.name}
                                                </CardTitle>
                                                <CardDescription className="text-sm mb-2">{member.position}</CardDescription>
                                                <p className="text-xs text-muted-foreground">{member.university}</p>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        {/* Research Interests */}
                                        <div className="space-y-2">
                                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Research Interests
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {member.researchInterests.map((interest, i) => (
                                                    <Badge
                                                        key={i}
                                                        variant="secondary"
                                                        className="bg-primary/10 text-primary hover:bg-primary/20 text-xs"
                                                    >
                                                        {interest}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Links */}
                                        <div className="flex gap-2 pt-2">
                                            {member.contact && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <a href={`mailto:${member.contact}`} className="flex items-center justify-center gap-2">
                                                        <Mail size={14} />
                                                        <span className="text-xs">Email</span>
                                                    </a>
                                                </Button>
                                            )}
                                            {member.linkedin && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <a href={member.linkedin.startsWith('http') ? member.linkedin : `https://linkedin.com/in/${member.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                        <Linkedin size={14} />
                                                        <span className="text-xs">LinkedIn</span>
                                                    </a>
                                                </Button>
                                            )}
                                            {member.website && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    asChild
                                                >
                                                    <a href={member.website.startsWith('http') ? member.website : `https://${member.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2">
                                                        <Globe size={14} />
                                                        <span className="text-xs">Website</span>
                                                    </a>
                                                </Button>
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
            <section className="py-24 bg-card/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-3xl mx-auto text-center space-y-6"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold">
                            Join Our Team
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            We regularly accept interns and PhD candidates. Check out our open positions or get in touch to learn more about opportunities at BrAINLabs.
                        </p>
                        <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4">
                            <Mail className="mr-2" size={20} />
                            Contact Us
                        </Button>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
