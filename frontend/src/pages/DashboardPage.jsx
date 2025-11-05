import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Trash2, Eye, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
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
            <div className="flex items-center justify-center min-h-[400px]">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                        Survey Dashboard
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage and analyze your survey data with AI
                    </p>
                </div>
                <Link to="/upload">
                    <Button size="lg" className="gap-2">
                        <Plus className="w-5 h-5" />
                        New Survey
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="overflow-hidden border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Surveys</p>
                                <p className="text-4xl font-bold">{formatNumber(surveys.length)}</p>
                            </div>
                            <div className="w-14 h-14 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl flex items-center justify-center">
                                <FileText className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Completed</p>
                                <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                                    {formatNumber(surveys.filter(s => s.status === 'completed').length)}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">✓</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="overflow-hidden border-2">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total Responses</p>
                                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                    {formatNumber(surveys.reduce((sum, s) => sum + (s.total_responses || 0), 0))}
                                </p>
                            </div>
                            <div className="w-14 h-14 bg-purple-500/10 dark:bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">📊</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Surveys List */}
            <Card className="border-2">
                <CardHeader>
                    <CardTitle className="text-2xl">Your Surveys</CardTitle>
                    <CardDescription className="text-base">
                        View and manage all your uploaded surveys
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {surveys.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto bg-muted rounded-2xl flex items-center justify-center mb-4">
                                <FileText className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">No surveys yet</h3>
                            <p className="text-muted-foreground mb-6 text-base">
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
                        <div className="space-y-4">
                            {surveys.map((survey) => (
                                <Card
                                    key={survey.survey_id}
                                    className="card-hover border"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="font-semibold text-lg">{survey.title}</h3>
                                                    <Badge className={getStatusColor(survey.status)}>
                                                        {survey.status}
                                                    </Badge>
                                                    {survey.survey_type === 'structured' && (
                                                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400">
                                                            Multi-Question
                                                        </Badge>
                                                    )}
                                                </div>
                                                {survey.description && (
                                                    <p className="text-sm text-muted-foreground mb-3">
                                                        {survey.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                                            <div className="flex items-center gap-2">
                                                <Link to={`/survey/${survey.survey_id}`}>
                                                    <Button variant="outline" size="sm" className="gap-2">
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden sm:inline">View</span>
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDelete(survey.survey_id)}
                                                    aria-label="Delete survey"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
