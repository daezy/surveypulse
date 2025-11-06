import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Trash2, Eye, RefreshCw, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSurveys, deleteSurvey } from '@/services/api'
import { formatDate, formatNumber, getStatusColor } from '@/lib/utils'

export default function DashboardPage() {
    const [surveys, setSurveys] = useState([])
    const [loading, setLoading] = useState(true)

    const loadSurveys = async () => {
        try {
            const data = await getSurveys()
            setSurveys(data.surveys)
        } catch (error) {
            toast.error('Failed to load surveys')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSurveys()
    }, [])

    const handleDelete = async (surveyId) => {
        if (!confirm('Are you sure you want to delete this survey?')) return

        try {
            await deleteSurvey(surveyId)
            toast.success('Survey deleted successfully')
            loadSurveys()
        } catch (error) {
            toast.error('Failed to delete survey')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                    <Brain className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
                </motion.div>
            </div>
        )
    }

    return (
        <div className="min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-40" />
                                <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                    <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
                                </div>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
                                Dashboard
                            </h1>
                        </div>
                        <p className="text-sm sm:text-base md:text-lg text-muted-foreground">
                            Manage and analyze your survey data with AI
                        </p>
                    </div>
                    <Link to="/upload">
                        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                            <Button size="lg" className="gap-2 border-2 h-12 sm:h-14 px-6 sm:px-8">
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">New Survey</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                >
                    <Card className="border-2 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wider">Total Surveys</p>
                                    <p className="text-3xl sm:text-4xl font-black">{formatNumber(surveys.length)}</p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-400" strokeWidth={2} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wider">Completed</p>
                                    <p className="text-3xl sm:text-4xl font-black text-green-600 dark:text-green-400">
                                        {formatNumber(surveys.filter(s => s.status === 'completed').length)}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center">
                                    <span className="text-2xl sm:text-3xl">✓</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-7">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 sm:mb-2 uppercase tracking-wider">Total Responses</p>
                                    <p className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400">
                                        {formatNumber(surveys.reduce((sum, s) => sum + (s.total_responses || 0), 0))}
                                    </p>
                                </div>
                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                                    <span className="text-2xl sm:text-3xl">📊</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Surveys List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2 bg-background/80 backdrop-blur-sm">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl sm:text-2xl font-black">Your Surveys</CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                View and manage all your uploaded surveys
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {surveys.length === 0 ? (
                                <div className="text-center py-12 sm:py-16 md:py-20">
                                    <div className="relative inline-flex mb-4 sm:mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-20" />
                                        <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-muted flex items-center justify-center">
                                            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black mb-2 sm:mb-3">No surveys yet</h3>
                                    <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
                                        Get started by uploading your first survey
                                    </p>
                                    <Link to="/upload">
                                        <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                                            <Button size="lg" className="gap-2 border-2 h-12 sm:h-14 px-6 sm:px-8">
                                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                                Upload Survey
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3 sm:space-y-4">
                                    {surveys.map((survey, idx) => (
                                        <motion.div
                                            key={survey.survey_id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            whileHover={{ y: -4 }}
                                        >
                                            <Card className="border-2 bg-background/80 backdrop-blur-sm">
                                                <CardContent className="p-4 sm:p-6">
                                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                        <div className="flex-1 w-full">

                                                            <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                                                                <h3 className="font-black text-base sm:text-lg">{survey.title}</h3>
                                                                <Badge className={getStatusColor(survey.status)}>
                                                                    {survey.status}
                                                                </Badge>
                                                                {survey.survey_type === 'structured' && (
                                                                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs">
                                                                        Multi-Question
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            {survey.description && (
                                                                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                                                                    {survey.description}
                                                                </p>
                                                            )}
                                                            {survey.tags && survey.tags.length > 0 && (
                                                                <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                                    {survey.tags.map((tag, index) => (
                                                                        <Badge
                                                                            key={index}
                                                                            variant="outline"
                                                                            className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                                                                        >
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                                                                {survey.survey_type === 'structured' ? (
                                                                    <>
                                                                        <span>{formatNumber(survey.total_participants || 0)} participants</span>
                                                                        <span className="hidden sm:inline">•</span>
                                                                        <span>{survey.questions?.length || 0} questions</span>
                                                                    </>
                                                                ) : (
                                                                    <span>{formatNumber(survey.total_responses)} responses</span>
                                                                )}
                                                                <span className="hidden sm:inline">•</span>
                                                                <span className="text-xs">{formatDate(survey.created_at)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Link to={`/survey/${survey.survey_id}`} className="flex-1 sm:flex-none">
                                                                <Button variant="outline" size="sm" className="gap-2 border-2 w-full">
                                                                    <Eye className="w-4 h-4" />
                                                                    <span>View</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDelete(survey.survey_id)}
                                                                aria-label="Delete survey"
                                                                className="border-2"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
