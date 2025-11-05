import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Brain, LayoutDashboard, Upload, Github, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/ThemeContext'

export default function Layout({ children }) {
    const location = useLocation()
    const { theme, toggleTheme } = useTheme()

    const isActive = (path) => location.pathname === path

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Navigation */}
            <nav className="acrylic-bg border-b border-border sticky top-0 z-50 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group focus-ring rounded-lg">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-200 group-hover:scale-[1.02]">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <div className="hidden md:block">
                                <h1 className="font-bold text-lg text-foreground">
                                    LLM Survey Analysis
                                </h1>
                                <p className="text-xs text-muted-foreground">
                                    AI-Powered Research Tool
                                </p>
                            </div>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center gap-1">
                            <Link to="/dashboard">
                                <Button
                                    variant={isActive('/dashboard') ? 'default' : 'ghost'}
                                    className="gap-2 transition-all duration-200 hover:scale-[1.02]"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    <span className="hidden sm:inline">Dashboard</span>
                                </Button>
                            </Link>
                            <Link to="/upload">
                                <Button
                                    variant={isActive('/upload') ? 'default' : 'ghost'}
                                    className="gap-2 transition-all duration-200 hover:scale-[1.02]"
                                >
                                    <Upload className="w-4 h-4" />
                                    <span className="hidden sm:inline">Upload</span>
                                </Button>
                            </Link>

                            {/* Divider */}
                            <div className="w-px h-6 bg-border mx-1"></div>

                            {/* Theme Toggle */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="transition-all duration-200 hover:scale-[1.02]"
                                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                            >
                                {theme === 'light' ? (
                                    <Moon className="w-[1.1rem] h-[1.1rem]" />
                                ) : (
                                    <Sun className="w-[1.1rem] h-[1.1rem]" />
                                )}
                            </Button>

                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Button variant="ghost" size="icon" className="transition-all duration-200 hover:scale-[1.02]" aria-label="View on GitHub">
                                    <Github className="w-[1.1rem] h-[1.1rem]" />
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-16rem)]">
                <div className="animate-fade-in">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="acrylic-bg border-t border-border mt-auto transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="text-center space-y-3">
                        <p className="text-sm text-muted-foreground">
                            Implementation of Large Language Models for Software Engineering Survey Analysis
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Final Year Research Project • {new Date().getFullYear()}
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-2">
                            <a href="#" className="text-sm text-primary hover:underline transition-colors focus-ring">
                                About
                            </a>
                            <span className="text-border">|</span>
                            <a href="#" className="text-sm text-primary hover:underline transition-colors focus-ring">
                                Documentation
                            </a>
                            <span className="text-border">|</span>
                            <a href="#" className="text-sm text-primary hover:underline transition-colors focus-ring">
                                Privacy
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
