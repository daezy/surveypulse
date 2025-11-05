import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { uploadSurvey, uploadSurveyFile, uploadTwoFileSurvey } from '@/services/api'

export default function UploadPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)
    const [manualMode, setManualMode] = useState(false)
    const [twoFileMode, setTwoFileMode] = useState(false)
    const [schemaFile, setSchemaFile] = useState(null)
    const [responsesFile, setResponsesFile] = useState(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        responses: ''
    })

    const onDrop = (acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0])
            toast.success('File selected successfully')
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'text/plain': ['.txt'],
            'application/json': ['.json']
        },
        maxFiles: 1
    })

    const handleFileUpload = async () => {
        if (!uploadedFile) {
            toast.error('Please select a file first')
            return
        }

        setLoading(true)
        try {
            const result = await uploadSurveyFile(uploadedFile)
            toast.success('Survey uploaded successfully!')
            navigate(`/survey/${result.survey_id}`)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to upload survey')
        } finally {
            setLoading(false)
        }
    }

    const handleTwoFileUpload = async () => {
        if (!schemaFile || !responsesFile) {
            toast.error('Please select both schema and responses files')
            return
        }

        setLoading(true)
        try {
            const result = await uploadTwoFileSurvey(schemaFile, responsesFile)
            toast.success('Two-file survey uploaded successfully!')
            navigate(`/survey/${result.survey_id}`)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to upload survey')
        } finally {
            setLoading(false)
        }
    }

    const handleManualSubmit = async (e) => {
        e.preventDefault()

        if (!formData.title || !formData.responses) {
            toast.error('Please fill in all required fields')
            return
        }

        const responses = formData.responses
            .split('\n')
            .map(r => r.trim())
            .filter(r => r.length > 0)

        if (responses.length === 0) {
            toast.error('Please enter at least one response')
            return
        }

        setLoading(true)
        try {
            const result = await uploadSurvey({
                title: formData.title,
                description: formData.description,
                responses
            })
            toast.success('Survey uploaded successfully!')
            navigate(`/survey/${result.survey_id}`)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to upload survey')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Upload Survey Data
                </h1>
                <p className="text-muted-foreground">
                    Upload your survey responses for AI-powered analysis
                </p>
            </div>

            {/* Toggle Mode */}
            <div className="flex justify-center gap-2 flex-wrap">
                <Button
                    variant={!manualMode && !twoFileMode ? 'default' : 'outline'}
                    onClick={() => {
                        setManualMode(false)
                        setTwoFileMode(false)
                    }}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Single File
                </Button>
                <Button
                    variant={twoFileMode ? 'default' : 'outline'}
                    onClick={() => {
                        setManualMode(false)
                        setTwoFileMode(true)
                    }}
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Two Files (Schema + Responses)
                </Button>
                <Button
                    variant={manualMode ? 'default' : 'outline'}
                    onClick={() => {
                        setManualMode(true)
                        setTwoFileMode(false)
                    }}
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Manual Entry
                </Button>
            </div>

            {/* Single File Upload Mode */}
            {!manualMode && !twoFileMode && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Survey File</CardTitle>
                        <CardDescription>
                            Supported formats: CSV, TXT, JSON (max 10MB)
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            {...getRootProps()}
                            className={`
                border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}
                ${uploadedFile ? 'bg-green-50' : ''}
              `}
                        >
                            <input {...getInputProps()} />
                            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            {uploadedFile ? (
                                <div className="space-y-2">
                                    <p className="text-lg font-medium text-green-600">File Selected</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>{uploadedFile.name}</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setUploadedFile(null)
                                            }}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg mb-2">
                                        {isDragActive ? 'Drop file here' : 'Drag & drop or click to select'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        CSV, TXT, or JSON files accepted
                                    </p>
                                </div>
                            )}
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleFileUpload}
                            disabled={!uploadedFile || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload & Analyze
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Two-File Upload Mode */}
            {twoFileMode && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Schema & Responses Files</CardTitle>
                        <CardDescription>
                            Upload two separate files: questions schema and participant responses
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Schema File Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Schema File (Questions) <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            setSchemaFile(e.target.files[0])
                                            toast.success('Schema file selected')
                                        }
                                    }}
                                    className="hidden"
                                    id="schema-file-input"
                                />
                                <label htmlFor="schema-file-input" className="cursor-pointer">
                                    {schemaFile ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <FileText className="w-5 h-5" />
                                            <span className="font-medium">{schemaFile.name}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setSchemaFile(null)
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm">Click to select schema file</p>
                                            <p className="text-xs text-muted-foreground mt-1">CSV or JSON</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Format: question_id, question_text, question_type, is_analyzed
                            </p>
                        </div>

                        {/* Responses File Upload */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium">
                                Responses File <span className="text-red-500">*</span>
                            </label>
                            <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                <input
                                    type="file"
                                    accept=".csv,.json"
                                    onChange={(e) => {
                                        if (e.target.files.length > 0) {
                                            setResponsesFile(e.target.files[0])
                                            toast.success('Responses file selected')
                                        }
                                    }}
                                    className="hidden"
                                    id="responses-file-input"
                                />
                                <label htmlFor="responses-file-input" className="cursor-pointer">
                                    {responsesFile ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <FileText className="w-5 h-5" />
                                            <span className="font-medium">{responsesFile.name}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    setResponsesFile(null)
                                                }}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                            <p className="text-sm">Click to select responses file</p>
                                            <p className="text-xs text-muted-foreground mt-1">CSV or JSON</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Format: participant_id, q1, q2, q3, ... (matching question IDs)
                            </p>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleTwoFileUpload}
                            disabled={!schemaFile || !responsesFile || loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload Two-File Survey
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Manual Entry Mode */}
            {manualMode && (
                <Card>
                    <CardHeader>
                        <CardTitle>Manual Entry</CardTitle>
                        <CardDescription>
                            Enter survey responses manually (one per line)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Survey Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Developer Experience Survey 2024"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description (optional)
                                </label>
                                <Input
                                    placeholder="Brief description of the survey"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Survey Responses <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    className="w-full min-h-[200px] p-3 border rounded-md focus:ring-2 focus:ring-primary"
                                    placeholder="Enter one response per line...&#10;&#10;Example:&#10;The IDE crashes frequently when working with large files&#10;Documentation could be more comprehensive&#10;Great collaboration features"
                                    value={formData.responses}
                                    onChange={(e) => setFormData({ ...formData, responses: e.target.value })}
                                    required
                                />
                                <p className="text-sm text-muted-foreground mt-1">
                                    {formData.responses.split('\n').filter(r => r.trim()).length} responses
                                </p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Submit & Analyze
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Info Section */}
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">File Format Guidelines:</h3>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• <strong>CSV (Single Question):</strong> Use a column named "response", "text", or "feedback"</li>
                        <li>• <strong>CSV (Multi-Question):</strong> Multiple columns with question headers, one row per participant (Stack Overflow style)</li>
                        <li>• <strong>Two-File Survey:</strong> Separate schema file (questions) + responses file (participant answers)</li>
                        <li>• <strong>TXT:</strong> One response per line</li>
                        <li>• <strong>JSON:</strong> Array of strings or objects with response fields</li>
                    </ul>
                    <div className="mt-3 p-3 bg-white rounded border border-blue-300">
                        <p className="text-xs font-semibold text-blue-800 mb-1">✨ New: Multi-Question & Two-File Surveys</p>
                        <p className="text-xs text-blue-700 mb-2">
                            <strong>Single file:</strong> Upload CSV files with multiple columns to analyze surveys with multiple questions.
                            Each column header becomes a question, and each row represents one participant's responses.
                        </p>
                        <p className="text-xs text-blue-700">
                            <strong>Two files:</strong> Upload separate schema (questions definitions) and responses files.
                            Common for Google Forms exports, Qualtrics, SurveyMonkey, and other professional survey platforms.
                        </p>
                    </div>
                    <div className="mt-3 p-3 bg-green-50 rounded border border-green-300">
                        <p className="text-xs font-semibold text-green-800 mb-1">📦 Sample Data Available</p>
                        <p className="text-xs text-green-700">
                            Try the two-file upload with: <code className="bg-green-100 px-1">survey-schema.csv</code> + <code className="bg-green-100 px-1">two-file-responses.csv</code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
