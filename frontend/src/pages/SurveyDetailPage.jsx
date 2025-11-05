import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, RefreshCw, Download, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSurvey, startAnalysis, getAnalysisStatus, getAnalysisResults } from '@/services/api'
import { formatDate, formatNumber, getStatusColor, downloadJSON } from '@/lib/utils'
import AnalysisResults from '@/components/AnalysisResults'

export default function SurveyDetailPage() {
    const { surveyId } = useParams()
    const navigate = useNavigate()
    const [survey, setSurvey] = useState(null)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [selectedAnalysisTypes, setSelectedAnalysisTypes] = useState([
        'full_analysis'
    ])

    const loadSurvey = async () => {
        try {
            const data = await getSurvey(surveyId)
            setSurvey(data)

            // If completed, try to load analysis
            if (data.status === 'completed') {
                try {
                    const results = await getAnalysisResults(surveyId)
                    setAnalysisResult(results)
                } catch (err) {
                    console.log('No analysis results yet')
                }
            }
        } catch (error) {
            toast.error('Failed to load survey')
            navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadSurvey()
    }, [surveyId])

    // Poll for status when processing
    useEffect(() => {
        if (survey?.status === 'processing') {
            const interval = setInterval(async () => {
                try {
                    const status = await getAnalysisStatus(surveyId)
                    if (status.status === 'completed') {
                        loadSurvey()
                        toast.success('Analysis completed!')
                    } else if (status.status === 'failed') {
                        loadSurvey()
                        toast.error('Analysis failed')
                    }
                } catch (err) {
                    console.error('Status check failed:', err)
                }
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [survey?.status])

    const handleStartAnalysis = async () => {
        setAnalyzing(true)
        try {
            await startAnalysis({
                survey_id: surveyId,
                analysis_types: selectedAnalysisTypes
            })
            toast.success('Analysis started! This may take a few minutes.')
            // Start polling
            setTimeout(loadSurvey, 2000)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to start analysis')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleDownload = () => {
        if (analysisResult) {
            downloadJSON(analysisResult, `analysis-${surveyId}.json`)
            toast.success('Results downloaded!')
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
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">{survey.title}</h1>
                        <Badge className={getStatusColor(survey.status)}>
                            {survey.status}
                        </Badge>
                    </div>
                    {survey.description && (
                        <p className="text-muted-foreground mt-1">{survey.description}</p>
                    )}
                </div>
                {analysisResult && (
                    <Button onClick={handleDownload}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Results
                    </Button>
                )}
            </div>

            {/* Survey Info */}
            <Card>
                <CardHeader>
                    <CardTitle>Survey Information</CardTitle>
                    {survey.survey_type === 'structured' && (
                        <CardDescription>
                            Multi-question survey with {survey.questions?.length || 0} questions
                        </CardDescription>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                {survey.survey_type === 'structured' ? 'Total Participants' : 'Total Responses'}
                            </p>
                            <p className="text-2xl font-bold">
                                {formatNumber(survey.total_participants || survey.total_responses)}
                            </p>
                        </div>
                        {survey.survey_type === 'structured' && (
                            <div>
                                <p className="text-sm text-muted-foreground">Questions</p>
                                <p className="text-2xl font-bold">{survey.questions?.length || 0}</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="text-lg font-semibold">{formatDate(survey.created_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Last Updated</p>
                            <p className="text-lg font-semibold">{formatDate(survey.updated_at)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge className={`${getStatusColor(survey.status)} text-lg px-3 py-1`}>
                                {survey.status}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Questions List (for structured surveys) */}
            {survey.survey_type === 'structured' && survey.questions && (
                <Card>
                    <CardHeader>
                        <CardTitle>Survey Questions</CardTitle>
                        <CardDescription>
                            Questions included in this survey
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {survey.questions.map((question, idx) => (
                                <div key={question.question_id} className="p-3 bg-gray-50 rounded-md border">
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                                            Q{idx + 1}
                                        </span>
                                        <div className="flex-1">
                                            <p className="font-medium">{question.question_text}</p>
                                            <div className="flex gap-2 mt-2">
                                                <Badge variant="outline" className="text-xs">
                                                    {question.question_type}
                                                </Badge>
                                                {question.is_analyzed && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        AI Analyzed
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Analysis Controls */}
            {survey.status !== 'completed' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Start Analysis</CardTitle>
                        <CardDescription>
                            Analyze survey responses using AI-powered LLM
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {survey.status === 'processing' ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center space-y-3">
                                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
                                    <p className="text-lg font-semibold">Analysis in Progress</p>
                                    <p className="text-sm text-muted-foreground">
                                        This may take a few minutes. You can leave this page.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium mb-2">Analysis Type:</p>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={selectedAnalysisTypes.includes('full_analysis')}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedAnalysisTypes(['full_analysis'])
                                                    }
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span>Full Analysis (Recommended)</span>
                                            <Badge variant="secondary">Summary + Sentiment + Topics + Problems</Badge>
                                        </label>
                                    </div>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full"
                                    onClick={handleStartAnalysis}
                                    disabled={analyzing || selectedAnalysisTypes.length === 0}
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Starting Analysis...
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4 mr-2" />
                                            Start AI Analysis
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Analysis Results */}
            {analysisResult && <AnalysisResults results={analysisResult} />}

            {/* Sample Responses */}
            {survey.survey_type === 'structured' ? (
                // Show structured responses grouped by question
                survey.processed_data && Object.keys(survey.processed_data).length > 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sample Responses by Question</CardTitle>
                            <CardDescription>
                                Preview of responses for each question (showing first 5 per question)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {Object.entries(survey.processed_data).map(([questionId, data], qIdx) => (
                                    <div key={questionId}>
                                        <div className="mb-3">
                                            <h4 className="font-semibold text-blue-600 mb-1">
                                                Question {qIdx + 1}: {data.question_text}
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {data.response_count} total responses
                                            </p>
                                        </div>
                                        <div className="space-y-2 ml-4">
                                            {data.responses?.slice(0, 5).map((response, idx) => (
                                                <div key={idx} className="p-2 bg-gray-50 rounded-md border-l-2 border-blue-400">
                                                    <span className="text-xs font-mono text-muted-foreground mr-2">
                                                        {idx + 1}.
                                                    </span>
                                                    <span className="text-sm">{response}</span>
                                                </div>
                                            ))}
                                            {data.responses?.length > 5 && (
                                                <p className="text-xs text-muted-foreground ml-2">
                                                    ...and {data.responses.length - 5} more responses
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ) : null
            ) : (
                // Show simple responses for single-question surveys
                survey.responses && survey.responses.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sample Responses</CardTitle>
                            <CardDescription>
                                Preview of survey responses (showing first 10)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {survey.responses.slice(0, 10).map((response, idx) => (
                                    <div key={idx} className="p-3 bg-gray-50 rounded-md border">
                                        <span className="text-sm font-mono text-muted-foreground mr-2">
                                            {idx + 1}.
                                        </span>
                                        <span className="text-sm">{response}</span>
                                    </div>
                                ))}
                            </div>
                            {survey.responses.length > 10 && (
                                <p className="text-sm text-muted-foreground mt-3 text-center">
                                    ...and {survey.responses.length - 10} more responses
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )
            )}
        </div>
    )
}
