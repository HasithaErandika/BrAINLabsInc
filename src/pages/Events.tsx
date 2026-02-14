import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { pastEvents, upcomingEvents, eventResources } from '@/data/events';
import { WorkshopCalendarIcon } from '@/components/ui/PageIcons';
import { Calendar, ExternalLink, MapPin } from 'lucide-react';

export const Events = () => {
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
                            <WorkshopCalendarIcon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">Events & Workshops</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Events & Workshops
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            Join us for workshops, seminars, and collaborative events exploring the latest in AI research.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
                <section className="py-8 md:py-12">
                    <div className="container mx-auto px-4 lg:pl-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-8"
                        >
                            <h2 className="text-2xl font-bold mb-2">Upcoming Events</h2>
                            <p className="text-sm text-muted-foreground">Don't miss our upcoming workshops and seminars.</p>
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
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 lg:pl-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-2">Past Events</h2>
                        <p className="text-sm text-muted-foreground">Explore our previous workshops and resources.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-5 max-w-5xl">
                        {pastEvents.map((event, idx) => (
                            <EventCard key={idx} event={event} index={idx} />
                        ))}
                    </div>

                    {/* Resources CTA */}
                    {eventResources && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mt-12 max-w-2xl"
                        >
                            <Card className="bg-primary/5 border-primary/10">
                                <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                                            <ExternalLink size={16} className="text-primary" />
                                            {eventResources.title}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {eventResources.description}
                                        </p>
                                    </div>
                                    <Button variant="outline" size="sm" className="shrink-0" asChild>
                                        <a href={eventResources.link} target="_blank" rel="noopener noreferrer" className="gap-2">
                                            Access Resources
                                            <ExternalLink size={12} />
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
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
        >
            <Card className="h-full hover:shadow-md hover:shadow-primary/5 transition-all duration-300 border-border/50 hover:border-primary/40 group flex flex-col">
                <CardHeader className="pb-3 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                        <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 font-medium uppercase tracking-wider ${upcoming ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {event.type || 'Event'}
                        </Badge>
                        {upcoming && (
                            <Badge className="bg-primary text-primary-foreground text-[10px] px-2 py-0.5">
                                Upcoming
                            </Badge>
                        )}
                    </div>

                    <div className="space-y-2">
                        <CardTitle className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                            {event.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                            <MapPin size={14} className="shrink-0 text-muted-foreground" />
                            {event.description}
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="pt-0 mt-auto">
                    <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <Calendar size={14} className="text-primary/70" />
                            {event.date}
                        </div>

                        {event.link && (
                            <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                            >
                                View Details
                                <ExternalLink size={10} />
                            </a>
                        )}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
};
