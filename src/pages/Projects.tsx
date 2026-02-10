import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { projects } from '@/data/projects';
import { ResearchLabIcon } from '@/components/ui/PageIcons';
import * as Icons from 'lucide-react';
import { MessageSquare } from 'lucide-react';

export const Projects = () => {
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
                            <ResearchLabIcon size={18} />
                            <span className="text-sm font-medium">Research Projects</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight flex items-center gap-4">
                            <ResearchLabIcon size={64} className="text-primary" />
                            Our Research
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                            Exploring the frontiers of AI through innovative research in large language models and neuromorphic computing.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Projects Content */}
            <section className="py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <Tabs defaultValue="all" className="w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                        >
                            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12 h-12">
                                <TabsTrigger value="all" className="text-base">All</TabsTrigger>
                                <TabsTrigger value="llm" className="text-base">LLMs</TabsTrigger>
                                <TabsTrigger value="neuro" className="text-base">Neuromorphic</TabsTrigger>
                            </TabsList>
                        </motion.div>

                        <TabsContent value="all" className="space-y-16">
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
            className="space-y-8"
        >
            {/* Category Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-xl">
                    <IconComponent className="text-primary" size={32} />
                </div>
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold">{category.category}</h2>
                    <p className="text-muted-foreground mt-2">{category.description}</p>
                </div>
            </div>

            {/* Project Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((project, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1, duration: 0.6 }}
                        whileHover={{ y: -4 }}
                    >
                        <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
                            <CardHeader>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                    {project.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base leading-relaxed">
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
