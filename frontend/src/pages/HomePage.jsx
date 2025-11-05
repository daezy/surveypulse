import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Brain, Upload, BarChart3, FileText, Zap, Shield } from 'lucide-react'

export default function HomePage() {
    return (
        <div className="space-y-20 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center space-y-8 py-12 md:py-20">
                <div className="flex justify-center mb-8">
                    <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
                        <Brain className="w-14 h-14 text-white" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
                        LLM Survey Analysis
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                        Transform qualitative survey data into actionable insights using state-of-the-art Large Language Models
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                    <Link to="/upload">
                        <Button size="lg" className="gap-2 text-base px-8">
                            <Upload className="w-5 h-5" />
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/dashboard">
                        <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                            <BarChart3 className="w-5 h-5" />
                            View Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                <Card className="card-hover border-2 overflow-hidden">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-3">Smart Summarization</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            AI-powered summaries that capture key themes and insights from thousands of responses
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-2 overflow-hidden">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="w-16 h-16 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <BarChart3 className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-3">Sentiment Analysis</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Understand developer emotions and attitudes through advanced sentiment classification
                        </p>
                    </CardContent>
                </Card>

                <Card className="card-hover border-2 overflow-hidden">
                    <CardContent className="pt-8 pb-6 text-center">
                        <div className="w-16 h-16 bg-pink-500/10 dark:bg-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Brain className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="font-semibold text-xl mb-3">Topic Detection</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Automatically identify and group responses into meaningful themes and categories
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* How It Works */}
            <div className="space-y-12 max-w-5xl mx-auto">
                <div className="text-center space-y-3">
                    <h2 className="text-4xl font-bold">How It Works</h2>
                    <p className="text-lg text-muted-foreground">
                        Simple three-step process to extract insights
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-10">
                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-lg">
                            1
                        </div>
                        <h3 className="font-semibold text-xl">Upload Data</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Upload your survey responses in CSV, TXT, or JSON format
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-lg">
                            2
                        </div>
                        <h3 className="font-semibold text-xl">AI Analysis</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Our LLM processes and analyzes your data using advanced NLP
                        </p>
                    </div>

                    <div className="text-center space-y-4">
                        <div className="w-20 h-20 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-lg">
                            3
                        </div>
                        <h3 className="font-semibold text-xl">Get Insights</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            View comprehensive analysis with visualizations and export results
                        </p>
                    </div>
                </div>
            </div>

            {/* Benefits */}
            <Card className="bg-accent/50 border-2 max-w-5xl mx-auto">
                <CardContent className="pt-8 pb-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-yellow-500/10 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Fast & Efficient</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Analyze hundreds of responses in minutes, not days
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-500/10 dark:bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Your data is encrypted and handled with strict privacy standards
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">AI-Powered</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Leverages state-of-the-art GPT models for deep understanding
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Visual Insights</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Beautiful charts and graphs to understand your data
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* CTA */}
            <Card className="bg-primary text-white border-0 shadow-xl max-w-4xl mx-auto">
                <CardContent className="pt-6 text-center py-16">
                    <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
                        Join researchers and organizations using AI to understand developer feedback better
                    </p>
                    <Link to="/upload">
                        <Button size="lg" variant="secondary" className="gap-2 text-base px-8">
                            <Upload className="w-5 h-5" />
                            Upload Your First Survey
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
