import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brain, LayoutDashboard, Upload, Github, Moon, Sun, Twitter, Linkedin, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'
import { motion } from 'framer-motion'

export default function Layout({ children }) {
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Modern Minimal Navigation */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50 transition-colors duration-300"
            >
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo - Angular Design */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                                <div className="relative w-11 h-11 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                            </motion.div>
                            <div className="hidden md:block">
                                <h1 className="font-black text-lg tracking-tight">
                                    Survey<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Pulse</span>
                                </h1>
                            </div>
                        </Link>

                        {/* Navigation Links - Minimal Style */}
                        <div className="flex items-center gap-2">
                            <Link to="/dashboard">
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        variant={isActive('/dashboard') ? 'default' : 'ghost'}
                                        className={`gap-2 h-10 ${isActive('/dashboard') ? 'bg-foreground text-background' : ''}`}
                                    >
                                        <LayoutDashboard className="w-4 h-4" />
                                        <span className="hidden sm:inline font-medium">Dashboard</span>
                                    </Button>
                                </motion.div>
                            </Link>
                            <Link to="/upload">
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                                    <Button
                                        variant={isActive('/upload') ? 'default' : 'ghost'}
                                        className={`gap-2 h-10 ${isActive('/upload') ? 'bg-foreground text-background' : ''}`}
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="hidden sm:inline font-medium">Upload</span>
                                    </Button>
                                </motion.div>
                            </Link>

                            {/* Divider */}
                            <div className="w-px h-6 bg-border mx-2"></div>

                            {/* Theme Toggle */}
                            <motion.div whileHover={{ rotate: 180 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleTheme}
                                    className="h-10 w-10"
                                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                                >
                                    {theme === 'light' ? (
                                        <Moon className="w-[1.1rem] h-[1.1rem]" />
                                    ) : (
                                        <Sun className="w-[1.1rem] h-[1.1rem]" />
                                    )}
                                </Button>
                            </motion.div>

                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }}>
                                    <Button variant="ghost" size="icon" className="h-10 w-10" aria-label="View on GitHub">
                                        <Github className="w-[1.1rem] h-[1.1rem]" />
                                    </Button>
                                </motion.div>
                            </a>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-20rem)]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {children}
                </motion.div>
            </main>

            {/* Modern Minimal Footer */}
            <footer className="border-t border-border/50 bg-background/80 backdrop-blur-md mt-auto transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    {/* Footer Top */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                        {/* Brand Column */}
                        <div className="md:col-span-2 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" strokeWidth={2} />
                                </div>
                                <h2 className="font-black text-xl tracking-tight">
                                    Survey<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Pulse</span>
                                </h2>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                                AI-powered survey analysis platform. Transform your data into actionable insights in seconds.
                            </p>
                            {/* Social Links */}
                            <div className="flex items-center gap-2 pt-2">
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    href="https://github.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border border-border/50 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                </motion.a>
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    href="https://twitter.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border border-border/50 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors"
                                >
                                    <Twitter className="w-4 h-4" />
                                </motion.a>
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    href="https://linkedin.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-9 h-9 border border-border/50 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors"
                                >
                                    <Linkedin className="w-4 h-4" />
                                </motion.a>
                                <motion.a
                                    whileHover={{ y: -2 }}
                                    href="mailto:hello@surveypulse.ai"
                                    className="w-9 h-9 border border-border/50 flex items-center justify-center hover:border-foreground/50 hover:bg-foreground/5 transition-colors"
                                >
                                    <Mail className="w-4 h-4" />
                                </motion.a>
                            </div>
                        </div>

                        {/* Product Links */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Product</h3>
                            <ul className="space-y-3">
                                <li>
                                    <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Dashboard
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/upload" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Upload Survey
                                    </Link>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Resources Links */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider">Resources</h3>
                            <ul className="space-y-3">
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="pt-8 border-t border-border/50">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-muted-foreground">
                                © {new Date().getFullYear()} SurveyPulse. All rights reserved.
                            </p>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <span>Built with</span>
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                                    className="text-red-500 mx-1"
                                >
                                    ♥
                                </motion.span>
                                <span>using AI</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
