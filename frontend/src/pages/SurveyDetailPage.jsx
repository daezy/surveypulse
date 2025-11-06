import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, RefreshCw, Download, Loader2, FileText, Heart, Tag, AlertCircle, Sparkles, Check, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSurvey, startAnalysis, getAnalysisStatus, getAnalysisResults } from '@/services/api'
import { formatDate, formatNumber, getStatusColor, downloadPDFReport } from '@/lib/utils'
import AnalysisResults from '@/components/AnalysisResults'

export default function SurveyDetailPage() {
    const { surveyId } = useParams()
    const navigate = useNavigate()
    const [survey, setSurvey] = useState(null)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [progress, setProgress] = useState(null)
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
                    console.log('📊 Analysis results loaded:', results)
                    if (results.question_analyses && results.question_analyses.length > 0) {
                        console.log('📝 First question summary type:', typeof results.question_analyses[0].summary)
                        console.log('📝 First question summary preview:', results.question_analyses[0].summary?.substring(0, 100))
                    }
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
            console.log('🔄 Starting polling for survey:', surveyId)

            const interval = setInterval(async () => {
                try {
                    console.log('📡 Polling status for survey:', surveyId)
                    const status = await getAnalysisStatus(surveyId)
                    console.log('✅ Status received:', status)

                    // Update progress if available
                    if (status.progress) {
                        setProgress(status.progress)
                        console.log('📊 Progress updated:', status.progress)
                    }

                    if (status.status === 'completed') {
                        console.log('🎉 Analysis completed!')
                        setProgress(null)
                        loadSurvey()
                        toast.success('Analysis completed!')
                    } else if (status.status === 'failed') {
                        console.log('❌ Analysis failed!')
                        setProgress(null)
                        loadSurvey()
                        toast.error('Analysis failed')
                    }
                } catch (err) {
                    console.error('❌ Status check failed:', err)
                }
            }, 2000) // Poll every 2 seconds for more responsive updates

            return () => {
                console.log('🛑 Stopping polling for survey:', surveyId)
                clearInterval(interval)
            }
        }
    }, [survey?.status, surveyId])

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

    const handleDownloadPDF = async () => {
        if (analysisResult && survey) {
            try {
                const filename = `${survey.title.replace(/[^a-z0-9]/gi, '_')}_analysis_report.pdf`
                await downloadPDFReport(analysisResult, survey, filename)
                toast.success('Report downloaded as PDF!')
            } catch (error) {
                console.error('PDF generation error:', error)
                toast.error('Failed to generate PDF')
            }
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
                    className="space-y-4"
                >
                    <Button variant="outline" onClick={() => navigate('/dashboard')} className="border-2">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap mb-2 sm:mb-3">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">{survey.title}</h1>
                                <Badge className={getStatusColor(survey.status)}>
                                    {survey.status}
                                </Badge>
                                {survey.survey_type === 'structured' && (
                                    <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs sm:text-sm">
                                        Multi-Question
                                    </Badge>
                                )}
                            </div>
                            {survey.description && (
                                <p className="text-sm sm:text-base text-muted-foreground mb-2">{survey.description}</p>
                            )}
                            {survey.tags && survey.tags.length > 0 && (
                                <div className="flex items-center gap-2 flex-wrap">
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
                        </div>
                        {analysisResult && (
                            <motion.div whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                                <Button onClick={handleDownloadPDF} className="border-2 w-full lg:w-auto">
                                    <Download className="w-4 h-4 mr-2" />
                                    Export PDF
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Survey Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card className="border-2 bg-background/80 backdrop-blur-sm">
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-xl sm:text-2xl font-black">Survey Information</CardTitle>
                            {survey.survey_type === 'structured' && (
                                <CardDescription className="text-sm sm:text-base">
                                    Multi-question survey with {survey.questions?.length || 0} questions
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">
                                        {survey.survey_type === 'structured' ? 'Participants' : 'Responses'}
                                    </p>
                                    <p className="text-2xl sm:text-3xl font-black">
                                        {formatNumber(survey.total_participants || survey.total_responses)}
                                    </p>
                                </div>
                                {survey.survey_type === 'structured' && (
                                    <div>
                                        <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Questions</p>
                                        <p className="text-2xl sm:text-3xl font-black">{survey.questions?.length || 0}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Created</p>
                                    <p className="text-base sm:text-lg font-black">{formatDate(survey.created_at)}</p>
                                </div>
                                <div>
                                    <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wider mb-1 sm:mb-2">Updated</p>
                                    <p className="text-base sm:text-lg font-black">{formatDate(survey.updated_at)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Questions List (for structured surveys) */}
                {survey.survey_type === 'structured' && survey.questions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Survey Questions</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Questions included in this survey
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {survey.questions.map((question, idx) => (
                                        <div key={question.question_id} className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700">
                                            <div className="flex items-start gap-2 sm:gap-3">
                                                <span className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 flex-shrink-0">
                                                    Q{idx + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-sm sm:text-base text-foreground">{question.question_text}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        <Badge variant="outline" className="text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600">
                                                            {question.question_type}
                                                        </Badge>
                                                        {question.is_analyzed && (
                                                            <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">
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
                    </motion.div>
                )}

                {/* Analysis Controls */}
                {survey.status !== 'completed' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Start Analysis</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Analyze survey responses using AI-powered LLM
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {survey.status === 'processing' ? (
                                    <div className="bg-gradient-to-br from-primary/5 to-blue-50 dark:from-primary/10 dark:to-blue-950/30 p-8 rounded-xl border-2 border-primary/20">
                                        <div className="text-center space-y-4">
                                            <div className="relative">
                                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-primary">AI Analysis in Progress</h3>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    Processing {survey.survey_type === 'structured' ? `${survey.questions?.length || 4} questions` : 'survey responses'} with OpenAI GPT-4o-mini
                                                </p>
                                            </div>

                                            {/* Progress Bar */}
                                            {progress && (
                                                <div className="mt-6">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-sm font-medium text-primary">
                                                            {progress.percentage || 0}% Complete
                                                        </span>
                                                        {progress.current_question && progress.total_questions && (
                                                            <span className="text-sm text-muted-foreground">
                                                                Question {progress.current_question} of {progress.total_questions}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                                                        <div
                                                            className="bg-gradient-to-r from-primary to-blue-600 h-full rounded-full transition-all duration-500 ease-out"
                                                            style={{ width: `${progress.percentage || 0}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Indicators */}
                                            <div className="flex justify-center items-center gap-6 mt-6">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${progress?.step === 'preprocessing' || progress?.percentage > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className={`text-xs ${progress?.step === 'preprocessing' ? 'text-green-600 font-medium' : 'text-muted-foreground'}`}>
                                                        Data Loaded
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${progress?.step === 'analyzing_questions' ? 'bg-primary animate-pulse' : progress?.percentage > 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className={`text-xs ${progress?.step === 'analyzing_questions' ? 'text-primary font-medium' : progress?.percentage > 50 ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                                                        AI Processing
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${progress?.step === 'finalizing' ? 'bg-primary animate-pulse' : progress?.percentage >= 95 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                    <span className={`text-xs ${progress?.step === 'finalizing' ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                                        Finalizing
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Live Activity */}
                                            <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-primary/20">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                    <span className="text-muted-foreground">
                                                        {progress?.message || 'Processing survey data...'}
                                                    </span>
                                                </div>
                                                {progress?.last_updated && (
                                                    <div className="flex items-center gap-2 text-xs mt-2 text-muted-foreground">
                                                        <span>Last updated: {new Date(progress.last_updated).toLocaleTimeString()}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <p className="text-sm text-muted-foreground mt-4">
                                                Estimated time: {survey.survey_type === 'structured'
                                                    ? `${Math.round((survey.questions?.length || 4) * 0.75)}-${Math.round((survey.questions?.length || 4) * 1)} minutes`
                                                    : '2-3 minutes'
                                                }
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                You can safely leave this page. We'll notify you when complete.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <div>
                                            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
                                                <Sparkles className="w-5 h-5 text-primary" />
                                                Select Analysis
                                            </h3>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {/* Full Analysis Card */}
                                                <button
                                                    onClick={() => setSelectedAnalysisTypes(['full_analysis'])}
                                                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${selectedAnalysisTypes.includes('full_analysis')
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-accent'
                                                        }`}
                                                >
                                                    {selectedAnalysisTypes.includes('full_analysis') && (
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <Sparkles className="w-6 h-6 text-white" />
                                                    </div>

                                                    <h4 className="font-bold text-sm mb-1">Full Analysis</h4>
                                                    <Badge variant="default" className="text-xs mb-2">Best</Badge>

                                                    <div className="flex justify-center gap-1 mt-2">
                                                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                                                        <Heart className="w-3.5 h-3.5 text-pink-600" />
                                                        <Tag className="w-3.5 h-3.5 text-green-600" />
                                                        <AlertCircle className="w-3.5 h-3.5 text-orange-600" />
                                                    </div>
                                                </button>

                                                {/* Summary Only Card */}
                                                <button
                                                    onClick={() => setSelectedAnalysisTypes(['summarization'])}
                                                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${selectedAnalysisTypes.includes('summarization')
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-accent'
                                                        }`}
                                                >
                                                    {selectedAnalysisTypes.includes('summarization') && (
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <FileText className="w-6 h-6 text-white" />
                                                    </div>

                                                    <h4 className="font-bold text-sm mb-1">Summary</h4>
                                                    <p className="text-xs text-muted-foreground">Quick overview</p>
                                                </button>

                                                {/* Sentiment Only Card */}
                                                <button
                                                    onClick={() => setSelectedAnalysisTypes(['sentiment'])}
                                                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${selectedAnalysisTypes.includes('sentiment')
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-accent'
                                                        }`}
                                                >
                                                    {selectedAnalysisTypes.includes('sentiment') && (
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <Heart className="w-6 h-6 text-white" />
                                                    </div>

                                                    <h4 className="font-bold text-sm mb-1">Sentiment</h4>
                                                    <p className="text-xs text-muted-foreground">Emotional tone</p>
                                                </button>

                                                {/* Topics Only Card */}
                                                <button
                                                    onClick={() => setSelectedAnalysisTypes(['topics'])}
                                                    className={`relative p-4 rounded-xl border-2 transition-all text-center ${selectedAnalysisTypes.includes('topics')
                                                        ? 'border-primary bg-primary/5 shadow-lg'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-accent'
                                                        }`}
                                                >
                                                    {selectedAnalysisTypes.includes('topics') && (
                                                        <div className="absolute top-2 right-2">
                                                            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                                <Check className="w-3 h-3 text-white" />
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                        <Tag className="w-6 h-6 text-white" />
                                                    </div>

                                                    <h4 className="font-bold text-sm mb-1">Topics</h4>
                                                    <p className="text-xs text-muted-foreground">Key themes</p>
                                                </button>
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
                    </motion.div>
                )}

                {/* Analysis Results */}
                {analysisResult && <AnalysisResults results={analysisResult} />}

                {/* Sample Responses */}
                {survey.survey_type === 'structured' ? (
                    // Show structured responses grouped by question
                    survey.processed_data && Object.keys(survey.processed_data).length > 0 ? (
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
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
                                                <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-1">
                                                    Question {qIdx + 1}: {data.question_text}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">
                                                    {data.response_count} total responses
                                                </p>
                                            </div>
                                            <div className="space-y-2 ml-4">
                                                {data.responses?.slice(0, 5).map((response, idx) => (
                                                    <div key={idx} className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border-l-2 border-blue-400 dark:border-blue-500">
                                                        <span className="text-xs font-mono text-muted-foreground mr-2">
                                                            {idx + 1}.
                                                        </span>
                                                        <span className="text-sm text-foreground">{response}</span>
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
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Sample Responses</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Preview of survey responses (showing first 10)
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 sm:space-y-3">
                                    {survey.responses.slice(0, 10).map((response, idx) => (
                                        <div key={idx} className="p-3 sm:p-4 bg-gray-50/50 dark:bg-gray-800/50 border-2 border-gray-200 dark:border-gray-700">
                                            <span className="text-xs sm:text-sm font-mono text-muted-foreground mr-2 font-black">
                                                {idx + 1}.
                                            </span>
                                            <span className="text-xs sm:text-sm text-foreground">{response}</span>
                                        </div>
                                    ))}
                                </div>
                                {survey.responses.length > 10 && (
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 text-center">
                                        ...and {survey.responses.length - 10} more responses
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )
                )}
            </div>
        </div>
    )
}
