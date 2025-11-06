import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Trash2, Eye, RefreshCw, Brain, TrendingUp, Clock, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { getSurveys, deleteSurvey } from '@/services/api'
import { formatDate, formatNumber, getStatusColor } from '@/lib/utils'

export default function DashboardPage() {
    const [surveys, setSurveys] = useState([])
    const [loading, setLoading] = useState(true)
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, surveyId: null, surveyTitle: '' })

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

    const handleDeleteClick = (surveyId, surveyTitle) => {
        setDeleteDialog({ isOpen: true, surveyId, surveyTitle })
    }

    const handleDeleteConfirm = async () => {
        const { surveyId } = deleteDialog
        try {
            await deleteSurvey(surveyId)
            toast.success('Survey deleted successfully')
            loadSurveys()
        } catch (error) {
            toast.error('Failed to delete survey')
        }
    }

    const handleDeleteCancel = () => {
        setDeleteDialog({ isOpen: false, surveyId: null, surveyTitle: '' })
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

    const completedSurveys = surveys.filter(s => s.status === 'completed').length
    const processingSurveys = surveys.filter(s => s.status === 'processing').length
    const totalResponses = surveys.reduce((sum, s) => sum + (s.total_responses || 0), 0)

    return (
        <div className="min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 flex items-center justify-center rounded-lg">
                                <Brain className="w-6 h-6 sm:w-7 sm:h-7 text-primary" strokeWidth={2} />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground">
                                    Dashboard
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground">
                                    Manage and analyze your survey data
                                </p>
                            </div>
                        </div>
                    </div>
                    <Link to="/upload">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button size="lg" className="gap-2 h-12 sm:h-14 px-6 sm:px-8">
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span>New Survey</span>
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
                >
                    {/* Total Surveys */}
                    <Card className="border-2">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Surveys</p>
                            <p className="text-3xl font-black">{formatNumber(surveys.length)}</p>
                        </CardContent>
                    </Card>

                    {/* Completed */}
                    <Card className="border-2">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                    {surveys.length > 0 ? Math.round((completedSurveys / surveys.length) * 100) : 0}%
                                </Badge>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Completed</p>
                            <p className="text-3xl font-black">{formatNumber(completedSurveys)}</p>
                        </CardContent>
                    </Card>

                    {/* Processing */}
                    <Card className="border-2">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                                {processingSurveys > 0 && (
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    >
                                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                                    </motion.div>
                                )}
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Processing</p>
                            <p className="text-3xl font-black">{formatNumber(processingSurveys)}</p>
                        </CardContent>
                    </Card>

                    {/* Total Responses */}
                    <Card className="border-2">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Brain className="w-5 h-5 text-primary" strokeWidth={2} />
                                </div>
                            </div>
                            <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wider">Total Responses</p>
                            <p className="text-3xl font-black">{formatNumber(totalResponses)}</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Surveys List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2">
                        <CardHeader className="space-y-2 border-b">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl sm:text-2xl font-black">Your Surveys</CardTitle>
                                    <CardDescription className="text-sm">
                                        {surveys.length} {surveys.length === 1 ? 'survey' : 'surveys'} • {completedSurveys} completed
                                    </CardDescription>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={loadSurveys}
                                    className="gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span className="hidden sm:inline">Refresh</span>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {surveys.length === 0 ? (
                                <div className="text-center py-12 sm:py-16">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground" strokeWidth={2} />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-black mb-2">No surveys yet</h3>
                                    <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                                        Get started by uploading your first survey
                                    </p>
                                    <Link to="/upload">
                                        <Button size="lg" className="gap-2">
                                            <Plus className="w-5 h-5" />
                                            Upload Survey
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {surveys.map((survey, idx) => (
                                        <motion.div
                                            key={survey.survey_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                        >
                                            <Card className="border hover:border-primary/50 transition-colors">
                                                <CardContent className="p-4 sm:p-5">
                                                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                                                        <div className="flex-1 w-full space-y-2">
                                                            {/* Title and Badges */}
                                                            <div className="flex items-start gap-2 flex-wrap">
                                                                <h3 className="font-bold text-base flex-1">{survey.title}</h3>
                                                                <Badge className={getStatusColor(survey.status)} variant="secondary">
                                                                    {survey.status}
                                                                </Badge>
                                                                {survey.survey_type === 'structured' && (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        Multi-Question
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            {/* Description */}
                                                            {survey.description && (
                                                                <p className="text-sm text-muted-foreground">
                                                                    {survey.description}
                                                                </p>
                                                            )}

                                                            {/* Tags */}
                                                            {survey.tags && survey.tags.length > 0 && (
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    {survey.tags.map((tag, index) => (
                                                                        <Badge
                                                                            key={index}
                                                                            variant="outline"
                                                                            className="text-xs"
                                                                        >
                                                                            {tag}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            {/* Stats */}
                                                            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                                                                {survey.survey_type === 'structured' ? (
                                                                    <>
                                                                        <span>{formatNumber(survey.total_participants || 0)} participants</span>
                                                                        <span>•</span>
                                                                        <span>{survey.questions?.length || 0} questions</span>
                                                                    </>
                                                                ) : (
                                                                    <span>{formatNumber(survey.total_responses)} responses</span>
                                                                )}
                                                                <span>•</span>
                                                                <span>{formatDate(survey.created_at)}</span>
                                                            </div>
                                                        </div>

                                                        {/* Action Buttons */}
                                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                                            <Link to={`/survey/${survey.survey_id}`} className="flex-1 sm:flex-none">
                                                                <Button variant="default" size="sm" className="gap-2 w-full">
                                                                    <Eye className="w-4 h-4" />
                                                                    <span>View</span>
                                                                </Button>
                                                            </Link>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => handleDeleteClick(survey.survey_id, survey.title)}
                                                                aria-label="Delete survey"
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

            {/* Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteDialog.isOpen}
                onClose={handleDeleteCancel}
                onConfirm={handleDeleteConfirm}
                title="Delete Survey"
                message={`Are you sure you want to delete "${deleteDialog.surveyTitle}"? This action cannot be undone and all associated analysis results will be permanently deleted.`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
            />
        </div>
    )
}
