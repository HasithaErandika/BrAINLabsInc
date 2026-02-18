import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { contact } from '@/data/general';
import { CommunicationHubIcon } from '@/components/ui/PageIcons';
import { Mail, Github, Twitter, Send, Linkedin } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';

export const Contact = () => {
    return (
        <div className="min-h-screen">
            <SEO
                title="Contact Us"
                description="Get in touch with BrAIN Labs for collaborations, inquiries, or research opportunities."
                keywords={["Contact BrAIN Labs", "AI Collaboration", "Research Opportunities", "Contact Researchers"]}
            />
            {/* Hero Header */}
            <section className="relative py-24 md:py-32 overflow-hidden" data-cursor="default">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
                            <CommunicationHubIcon size={18} />
                            <span className="text-sm font-medium">Get in Touch</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                            Contact Us
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Have a question or want to collaborate? We'd love to hear from you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Methods */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    {/* Map Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-6xl mx-auto mb-16 rounded-2xl overflow-hidden border border-border/50 h-[400px]"
                    >
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15843.19446270836!2d79.972794!3d6.915199!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a6771c5%3A0x2c63e352ea8f8c8!2sSLIIT!5e0!3m2!1sen!2slk!4v1645856754321!5m2!1sen!2slk"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="SLIIT Location"
                        />
                    </motion.div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
                        {[
                            {
                                icon: Mail,
                                title: "Email",
                                description: "Send us an email",
                                link: contact.email,
                                label: "info@brainlabs.inc"
                            },
                            {
                                icon: Github,
                                title: "GitHub",
                                description: "Check out our code",
                                link: contact.github,
                                label: "View Projects"
                            },
                            {
                                icon: Linkedin,
                                title: "LinkedIn",
                                description: "Connect professionally",
                                link: contact.linkedin,
                                label: "Follow Us"
                            },
                            {
                                icon: Twitter,
                                title: "Twitter",
                                description: "Follow our updates",
                                link: contact.twitter,
                                label: "@brainlabs"
                            }
                        ].map((method, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                            >
                                <Card className="h-full transition-all duration-300 border-border/50 hover:border-primary/50 group text-center">
                                    <CardHeader>
                                        <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                                            <method.icon className="text-primary" size={32} />
                                        </div>
                                        <CardTitle className="text-2xl">{method.title}</CardTitle>
                                        <CardDescription className="text-base">
                                            {method.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Button
                                            variant="outline"
                                            className="w-full group/btn"
                                            asChild
                                        >
                                            <a href={method.link} target="_blank" rel="noopener noreferrer">
                                                {method.label}
                                                <Send className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={14} />
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form Placeholder */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <Card className="border-primary/20">
                            <CardHeader className="text-center">
                                <CardTitle className="text-3xl mb-2">Send us a Message</CardTitle>
                                <CardDescription className="text-base">
                                    Fill out the form below and we'll get back to you as soon as possible
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="text-sm font-medium">
                                                Name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                placeholder="Your name"
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="text-sm font-medium">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                placeholder="your@email.com"
                                                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="subject" className="text-sm font-medium">
                                            Subject
                                        </label>
                                        <input
                                            id="subject"
                                            type="text"
                                            placeholder="What's this about?"
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="message" className="text-sm font-medium">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={6}
                                            placeholder="Tell us more..."
                                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full bg-primary hover:bg-primary/90"
                                    >
                                        <Send className="mr-2" size={18} />
                                        Send Message
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Contribution Note */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 text-center"
                        >
                            <Card className="bg-primary/5 border-primary/20">
                                <CardContent className="pt-6">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Interested in contributing to our research or joining our team?
                                        We regularly accept interns and PhD candidates.
                                        Reach out to discuss potential opportunities!
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
