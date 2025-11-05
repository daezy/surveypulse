import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, LineChart, Line, Area, AreaChart
} from 'recharts'
import { FileText, TrendingUp, AlertCircle, Lightbulb, BarChart3, Target, MessageSquare } from 'lucide-react'
import { getSentimentColor, getSentimentBgColor, getSentimentVariant, formatNumber } from '@/lib/utils'

const COLORS = ['#10b981', '#ef4444', '#6b7280']
const TOPIC_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6']
const PRIORITY_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#6b7280' }

export default function AnalysisResults({ results }) {
    // Check if this is a structured (multi-question) survey
    const isStructuredSurvey = results.question_analyses && results.question_analyses.length > 0

    // Helper function to aggregate data from structured surveys
    const aggregateStructuredData = () => {
        if (!isStructuredSurvey) return null

        const allTopics = {}
        const allProblems = []
        let totalPositive = 0, totalNegative = 0, totalNeutral = 0

        results.question_analyses?.forEach(qa => {
            // Aggregate sentiment
            if (qa.sentiment?.distribution) {
                totalPositive += qa.sentiment.distribution.positive || 0
                totalNegative += qa.sentiment.distribution.negative || 0
                totalNeutral += qa.sentiment.distribution.neutral || 0
            }

            // Aggregate topics
            qa.topics?.forEach(topic => {
                if (allTopics[topic.topic]) {
                    allTopics[topic.topic].count++
                } else {
                    allTopics[topic.topic] = {
                        name: topic.topic,
                        count: 1,
                        keywords: topic.keywords || []
                    }
                }
            })

            // Aggregate problems
            qa.open_problems?.forEach(problem => {
                allProblems.push({
                    ...problem,
                    question: qa.question_text
                })
            })
        })

        return {
            sentiment: { positive: totalPositive, negative: totalNegative, neutral: totalNeutral },
            topics: Object.values(allTopics).sort((a, b) => b.count - a.count).slice(0, 7),
            problems: allProblems
        }
    }

    const aggregatedData = isStructuredSurvey ? aggregateStructuredData() : null

    // Prepare sentiment chart data
    const sentimentData = isStructuredSurvey && aggregatedData ? [
        { name: 'Positive', value: aggregatedData.sentiment.positive, color: COLORS[0] },
        { name: 'Negative', value: aggregatedData.sentiment.negative, color: COLORS[1] },
        { name: 'Neutral', value: aggregatedData.sentiment.neutral, color: COLORS[2] },
    ] : results.sentiment_distribution ? [
        { name: 'Positive', value: results.sentiment_distribution.positive || 0, color: COLORS[0] },
        { name: 'Negative', value: results.sentiment_distribution.negative || 0, color: COLORS[1] },
        { name: 'Neutral', value: results.sentiment_distribution.neutral || 0, color: COLORS[2] },
    ] : []

    // Prepare topics chart data
    const topicsData = isStructuredSurvey && aggregatedData
        ? aggregatedData.topics.map((topic, idx) => ({
            name: topic.name.length > 20 ? topic.name.substring(0, 20) + '...' : topic.name,
            fullName: topic.name,
            count: topic.count,
            fill: TOPIC_COLORS[idx % TOPIC_COLORS.length]
        }))
        : results.topics?.slice(0, 7).map((topic, idx) => ({
            name: topic.topic.length > 20 ? topic.topic.substring(0, 20) + '...' : topic.topic,
            fullName: topic.topic,
            value: topic.frequency === 'high' ? 10 : topic.frequency === 'medium' ? 5 : 2,
            fill: TOPIC_COLORS[idx % TOPIC_COLORS.length]
        })) || []

    // Prepare problems by priority data
    const allProblems = isStructuredSurvey && aggregatedData
        ? aggregatedData.problems
        : results.open_problems || []

    const problemsByPriority = {
        high: allProblems.filter(p => p.priority === 'high').length,
        medium: allProblems.filter(p => p.priority === 'medium').length,
        low: allProblems.filter(p => p.priority === 'low').length,
    }

    const problemsData = [
        { name: 'High Priority', value: problemsByPriority.high, color: PRIORITY_COLORS.high },
        { name: 'Medium Priority', value: problemsByPriority.medium, color: PRIORITY_COLORS.medium },
        { name: 'Low Priority', value: problemsByPriority.low, color: PRIORITY_COLORS.low },
    ].filter(d => d.value > 0)

    // Calculate total sentiment responses
    const totalSentimentResponses = sentimentData.reduce((sum, item) => sum + item.value, 0)

    return (
        <div className="space-y-6">
            {/* Summary Stats Card */}
            <Card className="bg-primary text-white border-0 shadow-lg">
                <CardContent className="pt-6">
                    <h2 className="text-2xl font-bold mb-4">📊 Analysis Complete</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {isStructuredSurvey ? (
                            <>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-white/80 text-sm mb-1">Questions Analyzed</p>
                                    <p className="text-3xl font-bold">{results.total_questions_analyzed || results.question_analyses?.length || 0}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                    <p className="text-white/80 text-sm mb-1">Total Responses</p>
                                    <p className="text-3xl font-bold">{formatNumber(results.total_responses_analyzed)}</p>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                                <p className="text-white/80 text-sm mb-1">Responses Analyzed</p>
                                <p className="text-3xl font-bold">{formatNumber(results.total_responses_analyzed)}</p>
                            </div>
                        )}
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white/80 text-sm mb-1">Processing Time</p>
                            <p className="text-3xl font-bold">{results.processing_time ? `${results.processing_time.toFixed(1)}s` : 'N/A'}</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                            <p className="text-white/80 text-sm mb-1">Analysis Date</p>
                            <p className="text-lg font-bold">{results.created_at ? new Date(results.created_at).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Visualization Summary Dashboard */}
            <Card className="border-2 border-primary/20 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                    <div className="flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        <CardTitle className="text-2xl">Visual Summary Dashboard</CardTitle>
                    </div>
                    <CardDescription>
                        Comprehensive overview of key metrics and insights
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Sentiment Distribution Chart */}
                        {sentimentData.length > 0 && totalSentimentResponses > 0 && (
                            <div className="col-span-full lg:col-span-1">
                                <div className="bg-accent/50 rounded-lg p-4 h-full">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Sentiment Distribution
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={sentimentData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                                            >
                                                {sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatNumber(value)}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {sentimentData.map((item, idx) => (
                                            <div key={idx} className="text-center p-2 bg-card rounded-lg">
                                                <div className="flex items-center justify-center gap-1 mb-1">
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: COLORS[idx] }}
                                                    />
                                                    <span className="text-xs font-medium">{item.name}</span>
                                                </div>
                                                <p className="text-lg font-bold">{formatNumber(item.value)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {((item.value / totalSentimentResponses) * 100).toFixed(1)}%
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Topics Distribution Chart */}
                        {topicsData.length > 0 && (
                            <div className="col-span-full lg:col-span-1">
                                <div className="bg-accent/50 rounded-lg p-4 h-full">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <MessageSquare className="w-5 h-5 text-primary" />
                                        Top Topics
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={topicsData} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                            <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                                            <YAxis
                                                type="category"
                                                dataKey="name"
                                                stroke="hsl(var(--muted-foreground))"
                                                width={100}
                                                tick={{ fontSize: 11 }}
                                            />
                                            <Tooltip
                                                content={({ payload }) => {
                                                    if (payload && payload[0]) {
                                                        return (
                                                            <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
                                                                <p className="font-semibold text-sm">{payload[0].payload.fullName}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {isStructuredSurvey ? `Mentioned in ${payload[0].value} questions` : `Frequency: ${payload[0].value}`}
                                                                </p>
                                                            </div>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            />
                                            <Bar
                                                dataKey={isStructuredSurvey ? "count" : "value"}
                                                radius={[0, 8, 8, 0]}
                                            >
                                                {topicsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        {topicsData.length} main {topicsData.length === 1 ? 'topic' : 'topics'} identified
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Problems by Priority Chart */}
                        {problemsData.length > 0 && (
                            <div className="col-span-full lg:col-span-1">
                                <div className="bg-accent/50 rounded-lg p-4 h-full">
                                    <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-destructive" />
                                        Problems by Priority
                                    </h3>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={problemsData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                paddingAngle={2}
                                                dataKey="value"
                                                label={({ name, value }) => `${value}`}
                                            >
                                                {problemsData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value} problems`, 'Count']}
                                                contentStyle={{
                                                    backgroundColor: 'hsl(var(--card))',
                                                    border: '1px solid hsl(var(--border))',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-2 mt-2">
                                        {problemsData.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-card rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded"
                                                        style={{ backgroundColor: item.color }}
                                                    />
                                                    <span className="text-sm font-medium">{item.name}</span>
                                                </div>
                                                <span className="text-lg font-bold">{item.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground text-center mt-2">
                                        Total: {allProblems.length} {allProblems.length === 1 ? 'problem' : 'problems'} identified
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Key Metrics Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Topics Detected</p>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {isStructuredSurvey && aggregatedData ? aggregatedData.topics.length : results.topics?.length || 0}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Open Problems</p>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {allProblems.length}
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Key Findings</p>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {isStructuredSurvey
                                    ? results.question_analyses?.reduce((sum, qa) => sum + (qa.key_findings?.length || 0), 0) || 0
                                    : results.key_findings?.length || 0
                                }
                            </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-4 text-center">
                            <p className="text-xs text-muted-foreground mb-1">Overall Sentiment</p>
                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {isStructuredSurvey
                                    ? (aggregatedData.sentiment.positive > aggregatedData.sentiment.negative ? 'Positive' :
                                        aggregatedData.sentiment.negative > aggregatedData.sentiment.positive ? 'Negative' : 'Neutral')
                                    : results.overall_sentiment?.label?.toUpperCase() || 'N/A'
                                }
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Cross-Question Insights (for structured surveys) */}
            {isStructuredSurvey && results.cross_question_insights && (
                <Card className="border-2 border-primary/30 bg-accent">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            <CardTitle>Cross-Question Insights</CardTitle>
                        </div>
                        <CardDescription>
                            Patterns and themes identified across all questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {results.cross_question_insights.overall_insights &&
                            results.cross_question_insights.overall_insights !== "Unable to generate cross-question insights" && (
                                <div className="bg-card p-4 rounded-lg border">
                                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                        Overall Insights
                                    </h4>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {results.cross_question_insights.overall_insights}
                                    </p>
                                </div>
                            )}
                        {results.cross_question_insights.common_themes && results.cross_question_insights.common_themes.length > 0 && (
                            <div className="bg-card p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Common Themes</h4>
                                <div className="flex flex-wrap gap-2">
                                    {results.cross_question_insights.common_themes.map((theme, idx) => (
                                        <Badge key={idx} variant="secondary" className="px-3 py-1">
                                            {theme}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                        {results.cross_question_insights.key_patterns && results.cross_question_insights.key_patterns.length > 0 && (
                            <div className="bg-card p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Key Patterns</h4>
                                <ul className="space-y-2">
                                    {results.cross_question_insights.key_patterns.map((pattern, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span className="text-muted-foreground">{pattern}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {results.cross_question_insights.cross_question_findings && results.cross_question_insights.cross_question_findings.length > 0 && (
                            <div className="bg-card p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Cross-Question Findings</h4>
                                <ul className="space-y-2">
                                    {results.cross_question_insights.cross_question_findings.map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span className="text-muted-foreground">{finding}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Per-Question Analysis (for structured surveys) */}
            {isStructuredSurvey && results.question_analyses && results.question_analyses.map((qa, qIdx) => (
                <Card key={qa.question_id} className="border-l-4 border-l-primary shadow-md hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-accent">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold shadow-md">
                                {qIdx + 1}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{qa.question_text}</CardTitle>
                                <CardDescription className="text-base">
                                    {formatNumber(qa.response_count)} responses analyzed
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                        {/* Question Summary */}
                        {qa.summary && (
                            <div className="bg-accent p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-primary" />
                                    Summary
                                </h4>
                                <p className="text-muted-foreground leading-relaxed">{qa.summary}</p>
                            </div>
                        )}

                        {/* Key Findings */}
                        {qa.key_findings && qa.key_findings.length > 0 && (
                            <div className="bg-accent p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-primary" />
                                    Key Findings
                                </h4>
                                <ul className="space-y-2">
                                    {qa.key_findings.map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                                                {idx + 1}
                                            </div>
                                            <span className="text-sm text-muted-foreground">{finding}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Sentiment */}
                        {qa.sentiment && (
                            <div className="bg-accent p-4 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <h4 className="font-semibold text-sm">Sentiment:</h4>
                                    <Badge variant={getSentimentVariant(qa.sentiment.label)}>
                                        {qa.sentiment.label?.toUpperCase() || 'NEUTRAL'}
                                    </Badge>
                                    {qa.sentiment.confidence !== undefined && qa.sentiment.confidence !== null && !isNaN(qa.sentiment.confidence) && (
                                        <span className="text-sm text-muted-foreground">
                                            {(qa.sentiment.confidence * 100).toFixed(0)}% confidence
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Topics */}
                        {qa.topics && qa.topics.length > 0 && (
                            <div className="bg-accent p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3">Topics Detected</h4>
                                <div className="flex flex-wrap gap-2">
                                    {qa.topics.map((topic, idx) => (
                                        <Badge key={idx} variant="secondary">
                                            {topic.topic}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Open Problems */}
                        {qa.open_problems && qa.open_problems.length > 0 && (
                            <div className="bg-accent p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-destructive" />
                                    Open Problems Identified
                                </h4>
                                <div className="space-y-3">
                                    {qa.open_problems.map((problem, idx) => (
                                        <div key={idx} className="p-3 bg-card rounded-lg border-l-4 border-destructive shadow-sm">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="font-medium text-sm">{problem.title}</span>
                                                <Badge variant="destructive" className="text-xs">
                                                    {problem.priority}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">{problem.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}

            {/* Summary Section (for simple surveys) */}
            {!isStructuredSurvey && results.summary && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle>Executive Summary</CardTitle>
                        </div>
                        <CardDescription>
                            AI-generated overview of survey responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="prose max-w-none">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {results.summary}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Key Findings (for simple surveys) */}
            {!isStructuredSurvey && results.key_findings && results.key_findings.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lightbulb className="w-5 h-5 text-primary" />
                            <CardTitle>Key Findings</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3">
                            {results.key_findings.map((finding, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="text-muted-foreground flex-1">{finding}</p>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Sentiment Analysis (for simple surveys) */}
            {!isStructuredSurvey && results.overall_sentiment && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            <CardTitle>Sentiment Analysis</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Overall Sentiment */}
                            <div>
                                <h3 className="font-semibold mb-3">Overall Sentiment</h3>
                                <div className={`p-6 rounded-lg ${getSentimentBgColor(results.overall_sentiment.label)}`}>
                                    <div className="text-center">
                                        <p className={`text-4xl font-bold ${getSentimentColor(results.overall_sentiment.label)}`}>
                                            {results.overall_sentiment.label?.toUpperCase()}
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Confidence: {(results.overall_sentiment.confidence * 100).toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                                {results.sentiment_explanation && (
                                    <p className="text-sm text-muted-foreground mt-3">
                                        {results.sentiment_explanation}
                                    </p>
                                )}
                            </div>

                            {/* Sentiment Distribution */}
                            {sentimentData.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-3">Distribution</h3>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <PieChart>
                                            <Pie
                                                data={sentimentData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {sentimentData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex justify-center gap-4 mt-2">
                                        {sentimentData.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded"
                                                    style={{ backgroundColor: COLORS[idx] }}
                                                />
                                                <span className="text-sm">{item.name}: {formatNumber(item.value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Topic Detection (for simple surveys) */}
            {!isStructuredSurvey && results.topics && results.topics.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <CardTitle>Detected Topics</CardTitle>
                        </div>
                        <CardDescription>
                            Main themes identified in responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Topics Chart */}
                        {topicsData.length > 0 && (
                            <div className="mb-6">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={topicsData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {/* Topics List */}
                        <div className="space-y-4">
                            {results.topics.map((topic, idx) => (
                                <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-lg">{topic.topic}</h4>
                                        <Badge variant="secondary">{topic.frequency}</Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {topic.keywords?.map((keyword, kidx) => (
                                            <Badge key={kidx} variant="outline">
                                                {keyword}
                                            </Badge>
                                        ))}
                                    </div>
                                    {topic.sample_responses && topic.sample_responses.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">Sample responses:</p>
                                            {topic.sample_responses.map((response, ridx) => (
                                                <p key={ridx} className="text-sm text-muted-foreground italic">
                                                    "{response}"
                                                </p>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Open Problems (for simple surveys) */}
            {!isStructuredSurvey && results.open_problems && results.open_problems.length > 0 && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-destructive" />
                            <CardTitle>Identified Open Problems</CardTitle>
                        </div>
                        <CardDescription>
                            Research gaps and challenges mentioned by respondents
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {results.open_problems.map((problem, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 border-2 rounded-lg hover:shadow-md transition-shadow border-border"
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-semibold text-lg flex-1">{problem.title}</h4>
                                        <Badge
                                            variant={problem.priority === 'high' ? 'destructive' : 'secondary'}
                                            className="ml-2"
                                        >
                                            {problem.priority} priority
                                        </Badge>
                                    </div>
                                    <Badge variant="outline" className="mb-2">
                                        {problem.category}
                                    </Badge>
                                    <p className="text-muted-foreground mb-3">{problem.description}</p>
                                    {problem.supporting_responses && problem.supporting_responses.length > 0 && (
                                        <div className="bg-accent p-3 rounded-md">
                                            <p className="text-xs font-medium text-muted-foreground mb-2">
                                                Supporting evidence:
                                            </p>
                                            <div className="space-y-1">
                                                {problem.supporting_responses.map((response, ridx) => (
                                                    <p key={ridx} className="text-sm text-muted-foreground italic">
                                                        • "{response}"
                                                    </p>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

        </div>
    )
}
