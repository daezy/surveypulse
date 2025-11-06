import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Loader2, X, Brain } from 'lucide-react'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
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
        tags: '',
        responses: ''
    })
    const [fileMetadata, setFileMetadata] = useState({
        title: '',
        description: '',
        tags: ''
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
            console.log('📤 Uploading file with metadata:', fileMetadata)
            const result = await uploadSurveyFile(uploadedFile, fileMetadata)
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
            const result = await uploadTwoFileSurvey(schemaFile, responsesFile, fileMetadata)
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
            // Parse tags
            const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : []

            const result = await uploadSurvey({
                title: formData.title,
                description: formData.description,
                tags,
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
        <div className="min-h-screen py-8 sm:py-12 md:py-16 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3 sm:space-y-4"
                >
                    <div className="flex justify-center mb-3 sm:mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 blur-xl opacity-40" />
                            <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                                <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2} />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Upload Survey Data
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                        Upload your survey responses for AI-powered analysis
                    </p>
                </motion.div>

                {/* Toggle Mode */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center gap-2 flex-wrap"
                >
                    <Button
                        variant={!manualMode && !twoFileMode ? 'default' : 'outline'}
                        onClick={() => {
                            setManualMode(false)
                            setTwoFileMode(false)
                        }}
                        className="border-2"
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
                        className="border-2"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Two Files
                    </Button>
                    <Button
                        variant={manualMode ? 'default' : 'outline'}
                        onClick={() => {
                            setManualMode(true)
                            setTwoFileMode(false)
                        }}
                        className="border-2"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Manual Entry
                    </Button>
                </motion.div>

                {/* Single File Upload Mode */}
                {!manualMode && !twoFileMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Upload Survey File</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
                                    Supported formats: CSV, TXT, JSON (max 10MB)
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 sm:space-y-6">
                                <div
                                    {...getRootProps()}
                                    className={`
                border-2 border-dashed p-8 sm:p-10 md:p-12 text-center cursor-pointer transition-all
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}
                ${uploadedFile ? 'bg-green-50/50 dark:bg-green-950/30 border-green-500' : ''}
              `}
                                >
                                    <input {...getInputProps()} />
                                    <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                                    {uploadedFile ? (
                                        <div className="space-y-2">
                                            <p className="text-base sm:text-lg font-black text-green-600 dark:text-green-400">File Selected</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <FileText className="w-4 h-4" />
                                                <span className="text-sm sm:text-base">{uploadedFile.name}</span>
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

                                {/* Metadata Fields */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <label htmlFor="file-title" className="text-sm font-medium">
                                            Survey Title (Optional)
                                        </label>
                                        <Input
                                            id="file-title"
                                            placeholder="e.g., Customer Feedback Q4 2024"
                                            value={fileMetadata.title}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, title: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            If not provided, filename will be used
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="file-description" className="text-sm font-medium">
                                            Description (Optional)
                                        </label>
                                        <Input
                                            id="file-description"
                                            placeholder="e.g., Quarterly customer satisfaction survey"
                                            value={fileMetadata.description}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="file-tags" className="text-sm font-medium">
                                            Tags (Optional)
                                        </label>
                                        <Input
                                            id="file-tags"
                                            placeholder="e.g., customer, feedback, Q4, 2024"
                                            value={fileMetadata.tags}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, tags: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Comma-separated tags for organization
                                        </p>
                                    </div>
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
                    </motion.div>
                )}

                {/* Two-File Upload Mode */}
                {twoFileMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Upload Schema & Responses Files</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
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

                                {/* Metadata Fields */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="space-y-2">
                                        <label htmlFor="two-file-title" className="text-sm font-medium">
                                            Survey Title (Optional)
                                        </label>
                                        <Input
                                            id="two-file-title"
                                            placeholder="e.g., Employee Engagement Survey 2024"
                                            value={fileMetadata.title}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, title: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            If not provided, filenames will be used
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="two-file-description" className="text-sm font-medium">
                                            Description (Optional)
                                        </label>
                                        <Input
                                            id="two-file-description"
                                            placeholder="e.g., Annual employee engagement and satisfaction survey"
                                            value={fileMetadata.description}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="two-file-tags" className="text-sm font-medium">
                                            Tags (Optional)
                                        </label>
                                        <Input
                                            id="two-file-tags"
                                            placeholder="e.g., employee, engagement, annual, HR"
                                            value={fileMetadata.tags}
                                            onChange={(e) => setFileMetadata({ ...fileMetadata, tags: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Comma-separated tags for organization
                                        </p>
                                    </div>
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
                    </motion.div>
                )}

                {/* Manual Entry Mode */}
                {manualMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="border-2 bg-background/80 backdrop-blur-sm">
                            <CardHeader className="space-y-2">
                                <CardTitle className="text-xl sm:text-2xl font-black">Manual Entry</CardTitle>
                                <CardDescription className="text-sm sm:text-base">
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
                                            Tags (optional)
                                        </label>
                                        <Input
                                            placeholder="e.g., developer, experience, feedback"
                                            value={formData.tags}
                                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Comma-separated tags for organization
                                        </p>
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
                    </motion.div>
                )}

                {/* Info Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card className="border-2 border-blue-200 dark:border-blue-800/50 bg-background/80 backdrop-blur-sm">
                        <CardContent className="p-6 sm:p-7 md:p-8">
                            <h3 className="font-black text-base sm:text-lg mb-3 sm:mb-4 text-foreground">File Format Guidelines:</h3>
                            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                                <li>• <strong className="text-foreground">CSV (Single Question):</strong> Use a column named "response", "text", or "feedback"</li>
                                <li>• <strong className="text-foreground">CSV (Multi-Question):</strong> Multiple columns with question headers, one row per participant</li>
                                <li>• <strong className="text-foreground">Two-File Survey:</strong> Separate schema file (questions) + responses file (participant answers)</li>
                                <li>• <strong className="text-foreground">TXT:</strong> One response per line</li>
                                <li>• <strong className="text-foreground">JSON:</strong> Array of strings or objects with response fields</li>
                            </ul>
                            <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-white/80 dark:bg-gray-800/80 border-2 border-blue-300 dark:border-blue-600">
                                <p className="text-xs sm:text-sm font-black text-blue-800 dark:text-blue-300 mb-2">✨ Multi-Question & Two-File Surveys</p>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200 mb-2">
                                    <strong>Single file:</strong> Upload CSV files with multiple columns to analyze surveys with multiple questions.
                                </p>
                                <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-200">
                                    <strong>Two files:</strong> Upload separate schema and responses files for professional survey platforms.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    )
}
