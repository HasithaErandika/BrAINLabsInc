import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Github, Mail, Linkedin } from 'lucide-react';
import { contact } from '@/data/general';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50 mt-auto">
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* About */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-bold mb-4">BrAINLabs Inc.</h3>
                        <p className="text-base text-muted-foreground leading-relaxed mb-6">
                            Research laboratory dedicated to exploring the intersection of AI, ML, and Neuroscience.
                            Developing intelligent systems through brain-inspired approaches.
                        </p>
                        <div className="flex gap-3">
                            <a
                                href={contact.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-muted/50 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                                aria-label="Twitter"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href={contact.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-muted/50 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                                aria-label="GitHub"
                            >
                                <Github size={20} />
                            </a>
                            <a
                                href={contact.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-3 bg-muted/50 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                                aria-label="LinkedIn"
                            >
                                <Linkedin size={20} />
                            </a>
                            <a
                                href={contact.email}
                                className="p-3 bg-muted/50 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all hover:scale-110 hover:shadow-lg hover:shadow-primary/20"
                                aria-label="Email"
                            >
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                            <Link to="/projects" className="text-muted-foreground hover:text-primary transition-colors">Projects</Link>
                            <Link to="/team" className="text-muted-foreground hover:text-primary transition-colors">Team</Link>
                            <Link to="/publications" className="text-muted-foreground hover:text-primary transition-colors">Publications</Link>
                            <Link to="/events" className="text-muted-foreground hover:text-primary transition-colors">Events</Link>
                        </div>
                    </div>

                    {/* More */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">More</h3>
                        <div className="flex flex-col gap-3 text-sm">
                            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link>
                            <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} BrAINLabs Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};
