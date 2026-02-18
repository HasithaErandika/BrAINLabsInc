import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects } from '@/data/projects';
import { ResearchLabIcon } from '@/components/ui/PageIcons';
import * as Icons from 'lucide-react';
import { MessageSquare } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';

export const Projects = () => {
    return (
        <div className="min-h-screen">
            <SEO
                title="Research Projects"
                description="Explore our cutting-edge research in Large Language Models (LLMs) and Neuromorphic Computing at BrAIN Labs."
                keywords={["LLM", "Neuromorphic Computing", "AI Research", "BrAIN Labs Projects"]}
            />
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
                            <ResearchLabIcon size={16} />
                            <span className="text-xs font-medium uppercase tracking-wide">Research Projects</span>
                        </div>

                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                            Our Research
                        </h1>

                        <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                            Exploring the frontiers of AI through innovative research in large language models and neuromorphic computing.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Projects Content */}
            <section className="py-8 md:py-12">
                <div className="container mx-auto px-4 lg:pl-8">
                    <Tabs defaultValue="all" className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <TabsList className="grid w-full max-w-sm mx-auto grid-cols-3 mb-10 h-auto min-h-[40px]">
                                <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                                <TabsTrigger value="llm" className="text-sm">LLMs</TabsTrigger>
                                <TabsTrigger value="neuro" className="text-sm">Neuromorphic</TabsTrigger>
                            </TabsList>
                        </motion.div>

                        <TabsContent value="all" className="space-y-14">
                            {projects.map((category, catIdx) => (
                                <CategorySection key={catIdx} category={category} index={catIdx} />
                            ))}
                        </TabsContent>

                        <TabsContent value="llm">
                            <CategorySection category={projects[0]} index={0} />
                        </TabsContent>

                        <TabsContent value="neuro">
                            <CategorySection category={projects[1]} index={0} />
                        </TabsContent>
                    </Tabs>
                </div>
            </section>
        </div>
    );
};

const CategorySection = ({ category, index }: { category: typeof projects[0], index: number }) => {
    const IconComponent = (Icons as any)[category.iconName] || MessageSquare;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.7 }}
            className="space-y-6"
        >
            {/* Category Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-primary/10 rounded-lg">
                    <IconComponent className="text-primary" size={22} />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">{category.category}</h2>
                    <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {category.items.map((project, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08, duration: 0.5 }}
                        whileHover={{ y: -3 }}
                    >
                        <Card className="h-full border-border/50 hover:border-primary/40 transition-all duration-300 group">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors leading-snug">
                                    {project.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-sm leading-relaxed">
                                    {project.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
