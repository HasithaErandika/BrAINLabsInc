import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { publications } from '@/data/publications';
import { AcademicPaperIcon } from '@/components/ui/PageIcons';
import { ExternalLink, FileText, Calendar, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Publications = () => {
    // Group by year
    const publicationsByYear = publications.reduce((acc, pub) => {
        if (!acc[pub.year]) acc[pub.year] = [];
        acc[pub.year].push(pub);
        return acc;
    }, {} as Record<number, typeof publications>);

    const years = Object.keys(publicationsByYear).sort((a, b) => Number(b) - Number(a));

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
                            <AcademicPaperIcon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">Publications</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Research Output
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            Peer-reviewed research papers and scholarly contributions from BrAIN Labs researchers.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Publications by Year */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 lg:pl-8">
                    <div className="max-w-4xl space-y-12">
                        {years.map((year, yearIdx) => (
                            <motion.div
                                key={year}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: yearIdx * 0.1, duration: 0.6 }}
                                className="space-y-6"
                            >
                                {/* Year Header */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2 text-primary font-bold text-2xl">
                                        <Calendar size={24} className="opacity-80" />
                                        {year}
                                    </div>
                                    <div className="flex-1 h-px bg-border/60" />
                                </div>

                                {/* Publications */}
                                <div className="space-y-4">
                                    {publicationsByYear[Number(year)].map((pub, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        >
                                            <Card className="transition-all duration-300 border-border/50 hover:border-primary/30 group">
                                                <CardContent className="p-5 md:p-6">
                                                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start">
                                                        <div className="hidden md:flex shrink-0 p-3 bg-muted/50 rounded-lg text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                                            <FileText size={24} />
                                                        </div>

                                                        <div className="flex-1 space-y-3">
                                                            <div>
                                                                <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors mb-2">
                                                                    {pub.title}
                                                                </h3>
                                                                <p className="text-sm text-muted-foreground leading-relaxed">
                                                                    {pub.authors}
                                                                </p>
                                                            </div>

                                                            <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                                                                <Badge variant="outline" className="font-medium border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 transition-colors">
                                                                    <BookOpen size={12} className="mr-1.5" />
                                                                    {pub.venue}
                                                                </Badge>
                                                                {pub.doi && (
                                                                    <span className="text-muted-foreground font-mono text-xs opacity-70">
                                                                        DOI: {pub.doi}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {pub.link && (
                                                            <div className="shrink-0 mt-2 md:mt-0">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="group/btn text-muted-foreground hover:text-primary"
                                                                    asChild
                                                                >
                                                                    <a href={pub.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                                                        <span className="text-xs font-medium">View Paper</span>
                                                                        <ExternalLink className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" size={12} />
                                                                    </a>
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};
