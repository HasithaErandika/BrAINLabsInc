import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pastEvents, upcomingEvents, eventResources } from '@/data/events';
import { WorkshopCalendarIcon } from '@/components/ui/PageIcons';
import { Calendar, ExternalLink } from 'lucide-react';

export const Events = () => {
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
                            <WorkshopCalendarIcon size={18} />
                            <span className="text-sm font-medium">Events & Workshops</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center gap-4">
                            <WorkshopCalendarIcon size={64} className="text-primary" />
                            Events & Workshops
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Join us for workshops, seminars, and collaborative events exploring the latest in AI research.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-12"
                        >
                            <h2 className="text-4xl font-bold mb-4">Upcoming Events</h2>
                            <p className="text-muted-foreground">Don't miss our upcoming workshops and seminars</p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                            {upcomingEvents.map((event, idx) => (
                                <EventCard key={idx} event={event} index={idx} upcoming />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Past Events */}
            <section className="py-16 bg-card/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl font-bold mb-4">Past Events</h2>
                        <p className="text-muted-foreground">Explore our previous workshops and their resources</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-5xl">
                        {pastEvents.map((event, idx) => (
                            <EventCard key={idx} event={event} index={idx} />
                        ))}
                    </div>

                    {/* Event Resources */}
                    {eventResources && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-16 max-w-3xl"
                        >
                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ExternalLink size={20} />
                                        {eventResources.title}
                                    </CardTitle>
                                    <CardDescription>
                                        {eventResources.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-between"
                                        asChild
                                    >
                                        <a href={eventResources.link} target="_blank" rel="noopener noreferrer">
                                            <span>Visit Workshop Site</span>
                                            <ExternalLink size={16} />
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
};

const EventCard = ({ event, index, upcoming = false }: {
    event: typeof pastEvents[0],
    index: number,
    upcoming?: boolean
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
        >
            <Card className="h-full hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/50 group">
                <CardHeader>
                    {upcoming && (
                        <Badge className="w-fit mb-2 bg-primary text-primary-foreground">
                            Upcoming
                        </Badge>
                    )}
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                        {event.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {event.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar size={16} className="text-primary" />
                        <span>{event.date}</span>
                    </div>
                    {event.link && (
                        <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                View Workshop
                                <ExternalLink size={14} />
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
};
