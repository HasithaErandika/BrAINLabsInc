import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { publications } from '@/data/publications';
import { AcademicPaperIcon } from '@/components/ui/PageIcons';
import { ExternalLink, FileText } from 'lucide-react';

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
                            <AcademicPaperIcon size={18} />
                            <span className="text-sm font-medium">Publications</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center gap-4">
                            <AcademicPaperIcon size={64} className="text-primary" />
                            Research Publications
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Peer-reviewed research papers and scholarly contributions from BrAINLabs researchers.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Publications by Year */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto space-y-16">
                        {years.map((year, yearIdx) => (
                            <motion.div
                                key={year}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: yearIdx * 0.1, duration: 0.6 }}
                                className="space-y-6"
                            >
                                {/* Year Header */}
                                <div className="flex items-center gap-4">
                                    <h2 className="text-4xl font-bold">{year}</h2>
                                    <div className="flex-1 h-px bg-border" />
                                </div>

                                {/* Publications */}
                                <div className="space-y-4">
                                    {publicationsByYear[Number(year)].map((pub, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                                        >
                                            <Card className="hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 hover:border-primary/50 group">
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div className="flex-1">
                                                            <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                                                                {pub.title}
                                                            </CardTitle>
                                                            <CardDescription className="text-sm">
                                                                {pub.authors}
                                                            </CardDescription>
                                                        </div>
                                                        <FileText className="text-primary shrink-0" size={24} />
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                                            <span className="font-medium">{pub.venue}</span>
                                                            {pub.doi && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>DOI: {pub.doi}</span>
                                                                </>
                                                            )}
                                                        </div>

                                                        {pub.link && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="group/btn"
                                                                asChild
                                                            >
                                                                <a href={pub.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                                    View Publication
                                                                    <ExternalLink className="group-hover/btn:translate-x-1 transition-transform" size={14} />
                                                                </a>
                                                            </Button>
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
