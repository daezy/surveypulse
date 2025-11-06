import React from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
    Brain, Upload, BarChart3, Zap, Shield, ArrowRight, Check
} from 'lucide-react'

export default function HomePage() {
    const { scrollYProgress } = useScroll()
    const y = useTransform(scrollYProgress, [0, 1], [0, -50])

    const fadeInUp = {
        hidden: { y: 40, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1]
            }
        }
    }

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    return (
        <div className="relative overflow-hidden bg-background">
            {/* Enhanced Background Layer */}
            <div className="fixed inset-0 -z-10">
                {/* Animated Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

                {/* Diagonal Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,#8881_49%,#8881_51%,transparent_52%)] bg-[size:8rem_8rem] opacity-30" />

                {/* Animated Gradient Orbs */}
                <motion.div
                    animate={{
                        x: [0, 100, 0],
                        y: [0, -50, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-500/10 blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -100, 0],
                        y: [0, 50, 0],
                        scale: [1.2, 1, 1.2],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute bottom-0 left-1/4 w-[700px] h-[700px] bg-purple-500/10 blur-3xl"
                />
                <motion.div
                    animate={{
                        x: [0, -80, 0],
                        y: [0, -80, 0],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: 30,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/3 left-1/2 w-[500px] h-[500px] bg-cyan-500/8 blur-3xl"
                />

                {/* Geometric Shapes */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute top-20 left-20 w-32 h-32 border border-blue-500/10"
                />
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-40 right-40 w-48 h-48 border-2 border-purple-500/10"
                />
                <motion.div
                    animate={{
                        rotate: [0, 180, 360],
                        scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/2 right-20 w-24 h-24 border border-cyan-500/10 transform -translate-y-1/2"
                />

                {/* Floating Dots */}
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2]
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                        className="absolute w-1 h-1 bg-foreground/20"
                        style={{
                            left: `${10 + (i * 7)}%`,
                            top: `${20 + (i * 5)}%`,
                        }}
                    />
                ))}

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />
            </div>

            <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 py-12 sm:py-16 md:py-20">
                <div className="max-w-6xl mx-auto text-center w-full">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="space-y-6 sm:space-y-8"
                    >
                        <motion.div variants={fadeInUp} className="flex justify-center mb-2 sm:mb-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-40" />
                                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Brain className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-white" strokeWidth={2} />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={fadeInUp}>
                            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight mb-4 sm:mb-6">
                                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                                    SurveyPulse
                                </span>
                            </h1>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-3xl mx-auto font-light px-4">
                                AI-powered survey analysis in seconds
                            </p>
                        </motion.div>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 sm:pt-6 md:pt-8 px-4">
                            <Link to="/upload" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full">
                                    <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-foreground text-background hover:bg-foreground/90">
                                        Start Analyzing
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link to="/dashboard" className="w-full sm:w-auto">
                                <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }} className="w-full">
                                    <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-2">
                                        View Dashboard
                                    </Button>
                                </motion.div>
                            </Link>
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            className="pt-12 sm:pt-16 md:pt-20 grid grid-cols-3 gap-6 sm:gap-8 md:gap-12 max-w-3xl mx-auto px-4"
                        >
                            {[
                                { value: "100%", label: "AI-Powered" },
                                { value: "10x", label: "Faster" },
                                { value: "99%", label: "Accurate" }
                            ].map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -4 }}
                                    className="space-y-1 sm:space-y-2"
                                >
                                    <div className="text-3xl sm:text-4xl md:text-5xl font-black">
                                        {stat.value}
                                    </div>
                                    <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">
                                        {stat.label}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUp}
                        className="text-center mb-10 sm:mb-12 md:mb-16"
                    >
                        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black mb-2 sm:mb-3 md:mb-4">
                            Built for speed
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                            Everything you need. Nothing you don't.
                        </p>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border"
                    >
                        {[
                            {
                                icon: Brain,
                                title: "AI Analysis",
                                description: "Advanced models extract key insights automatically"
                            },
                            {
                                icon: Zap,
                                title: "Real-time",
                                description: "Process hundreds of responses in seconds"
                            },
                            {
                                icon: Shield,
                                title: "Secure",
                                description: "Enterprise-grade encryption and privacy"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                variants={fadeInUp}
                                whileHover={{ y: -4 }}
                                className="bg-background/80 backdrop-blur-sm p-6 sm:p-7 md:p-8 group border border-border/50"
                            >
                                <div className="mb-4 sm:mb-5 md:mb-6">
                                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-foreground text-background flex items-center justify-center">
                                        <feature.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 md:w-6 md:h-6" strokeWidth={2} />
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-black mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-16 sm:py-20 md:py-24 px-4 sm:px-6">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeInUp}
                    >
                        <Card className="border-2 border-foreground overflow-hidden bg-background/80 backdrop-blur-md">
                            <CardContent className="p-8 sm:p-10 md:p-12 lg:p-16 text-center">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-5 md:mb-6">
                                    Start analyzing today
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-7 md:mb-8 max-w-2xl mx-auto px-4">
                                    Transform your survey data into actionable insights
                                </p>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                    <Link to="/upload" className="w-full sm:w-auto">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                                            <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-foreground text-background hover:bg-foreground/90">
                                                <Upload className="w-4 h-4 mr-2" />
                                                Upload Survey
                                            </Button>
                                        </motion.div>
                                    </Link>
                                    <Link to="/dashboard" className="w-full sm:w-auto">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                                            <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-2">
                                                View Examples
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </div>

                                <div className="mt-6 sm:mt-7 md:mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>No credit card required</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        <span>Free to start</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
