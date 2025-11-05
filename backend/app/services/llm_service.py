from openai import OpenAI
from typing import List, Dict, Any
import logging
import json
import random
from app.core.config import settings
from app.models.schemas import SentimentResult, TopicResult, OpenProblem, AnalysisType

logger = logging.getLogger(__name__)


class LLMService:
    """Service for interacting with OpenAI LLM"""

    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
        self.max_tokens = settings.OPENAI_MAX_TOKENS
        self.temperature = settings.OPENAI_TEMPERATURE
        # Maximum responses to analyze at once (to avoid context length issues)
        self.max_responses_per_analysis = 500
        # For very large datasets, use stratified sampling
        self.sample_size_large_dataset = 1000

    def _sample_responses(
        self, responses: List[str], max_samples: int = None
    ) -> List[str]:
        """Intelligently sample responses for analysis to avoid context length issues"""
        if max_samples is None:
            max_samples = self.max_responses_per_analysis

        if len(responses) <= max_samples:
            return responses

        # For large datasets, use stratified sampling
        logger.info(f"Sampling {max_samples} responses from {len(responses)} total")

        # Remove empty responses first
        valid_responses = [r for r in responses if r and len(r.strip()) > 0]

        if len(valid_responses) <= max_samples:
            return valid_responses

        # Random sampling with seed for reproducibility
        random.seed(42)
        sampled = random.sample(valid_responses, max_samples)

        logger.info(f"Sampled {len(sampled)} representative responses for analysis")
        return sampled

    def _extract_json_from_response(self, response: str) -> str:
        """Extract JSON from LLM response, handling markdown code blocks and extra text"""
        # Remove leading/trailing whitespace
        response = response.strip()

        # Try to extract JSON from markdown code blocks
        if "```json" in response:
            # Extract content between ```json and ```
            start = response.find("```json") + 7
            end = response.find("```", start)
            if end != -1:
                response = response[start:end].strip()
        elif "```" in response:
            # Extract content between ``` and ```
            start = response.find("```") + 3
            end = response.find("```", start)
            if end != -1:
                response = response[start:end].strip()

        # Check if it's an array or object
        array_start = response.find("[")
        object_start = response.find("{")

        # Determine which comes first (if both exist)
        if array_start != -1 and (object_start == -1 or array_start < object_start):
            # Extract array
            json_end = response.rfind("]") + 1
            if json_end > array_start:
                response = response[array_start:json_end]
        elif object_start != -1:
            # Extract object
            json_end = response.rfind("}") + 1
            if json_end > object_start:
                response = response[object_start:json_end]

        return response

    async def generate_completion(self, prompt: str, system_message: str = None) -> str:
        """Generate completion from OpenAI API"""
        try:
            messages = []

            if system_message:
                messages.append({"role": "system", "content": system_message})

            messages.append({"role": "user", "content": prompt})

            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            raise Exception(f"Failed to generate completion: {str(e)}")

    async def summarize_responses(self, responses: List[str]) -> Dict[str, Any]:
        """Generate summary and key findings from survey responses"""

        # Sample responses if dataset is too large
        original_count = len(responses)
        sampled_responses = self._sample_responses(responses, max_samples=200)

        responses_text = "\n".join(
            [f"{i+1}. {r}" for i, r in enumerate(sampled_responses)]
        )

        system_message = """You are an expert analyst specializing in software engineering research and qualitative data analysis. 
You have deep knowledge of software development practices, tools, methodologies, and common challenges developers face.
Your task is to analyze survey responses from software developers and provide insightful, evidence-based summaries that identify patterns, trends, and meaningful insights."""

        analysis_note = (
            f" (analyzed {len(sampled_responses)} sampled responses from {original_count} total)"
            if original_count > len(sampled_responses)
            else ""
        )

        prompt = f"""Analyze the following survey responses from software developers{analysis_note}.

TASK:
1. Write a comprehensive summary (2-3 well-structured paragraphs) that:
   - Identifies the main themes and patterns in the responses
   - Highlights the most significant insights
   - Provides context and interpretation of what these responses reveal about developer experiences
   - Uses specific examples or quotes from responses when relevant

2. Extract 5-7 key findings or themes that:
   - Are specific, actionable, and evidence-based
   - Represent the most important patterns in the data
   - Are ordered by significance (most important first)
   - Each finding should be concise (1-2 sentences) but meaningful

SURVEY RESPONSES:
{responses_text}

OUTPUT FORMAT (strict JSON):
{{
    "summary": "Your comprehensive 2-3 paragraph summary here. Make it insightful and data-driven.",
    "key_findings": [
        "First key finding - most significant pattern or theme",
        "Second key finding - another important insight",
        "Third key finding...",
        "Continue for 5-7 total findings"
    ]
}}

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object, nothing else
- Do NOT include markdown code blocks or backticks
- Do NOT include explanatory text before or after the JSON
- Do NOT include the word "json" or any labels
- Start your response with {{ and end with }}"""

        result = await self.generate_completion(prompt, system_message)

        try:
            # Extract and clean JSON from response
            cleaned_result = self._extract_json_from_response(result)
            parsed = json.loads(cleaned_result)

            # Validate that we have the correct structure
            if isinstance(parsed, dict) and "summary" in parsed:
                # Ensure summary is a string, not nested JSON
                if isinstance(parsed["summary"], str):
                    # Check if summary field accidentally contains JSON
                    summary_text = parsed["summary"].strip()
                    if summary_text.startswith("{") and '"summary"' in summary_text:
                        logger.warning(
                            "Summary field contains nested JSON, extracting..."
                        )
                        try:
                            nested = json.loads(summary_text)
                            if isinstance(nested, dict) and "summary" in nested:
                                parsed["summary"] = nested["summary"]
                                if "key_findings" in nested:
                                    parsed["key_findings"] = nested["key_findings"]
                        except:
                            pass
                return parsed
            else:
                logger.warning(f"Unexpected summary structure: {type(parsed)}")
                return {"summary": result, "key_findings": []}

        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse summary JSON: {str(e)}\nResponse: {result[:200]}..."
            )
            # Fallback parsing
            return {"summary": result, "key_findings": []}

    async def analyze_sentiment(self, responses: List[str]) -> Dict[str, Any]:
        """Analyze sentiment of survey responses"""

        # Sample responses for sentiment analysis
        sampled_responses = self._sample_responses(responses, max_samples=200)

        responses_text = "\n".join(
            [f"{i+1}. {r}" for i, r in enumerate(sampled_responses)]
        )

        system_message = """You are an expert in sentiment analysis and natural language processing, specializing in developer feedback and software engineering discourse.
You understand the nuances of technical communication, including constructive criticism, neutral reporting of issues, and positive feedback about tools and practices.
Analyze sentiment with precision, considering context and domain-specific language."""

        prompt = f"""Perform sentiment analysis on these software developer survey responses.

CONTEXT: These responses come from a software development survey. Be aware that:
- Technical language may sound neutral even when expressing frustration
- Developers often mix positive and negative sentiments (e.g., "tool X is great but has issues")
- Constructive criticism is common and should be distinguished from purely negative sentiment

TASK:
Analyze each response and provide:
1. **Overall Sentiment**: Aggregate sentiment across all responses with a confidence score
2. **Sentiment Distribution**: Count how many responses are positive, negative, or neutral
3. **Detailed Explanation**: Explain what drives the sentiment, with specific examples

SURVEY RESPONSES:
{responses_text}

SENTIMENT CLASSIFICATION GUIDE:
- **Positive**: Expresses satisfaction, success, appreciation, or enthusiasm
- **Negative**: Expresses frustration, dissatisfaction, problems, or criticism
- **Neutral**: Factual statements, balanced views, or mixed sentiments without clear lean

OUTPUT FORMAT (strict JSON):
{{
    "overall_sentiment": {{
        "label": "positive",  // One of: "positive", "negative", or "neutral"
        "score": 0.75,  // 0.0 (very negative) to 1.0 (very positive), 0.5 is neutral
        "confidence": 0.85  // 0.0 (uncertain) to 1.0 (very confident)
    }},
    "distribution": {{
        "positive": 45,  // Count of positive responses
        "negative": 12,  // Count of negative responses
        "neutral": 23   // Count of neutral responses
    }},
    "explanation": "Detailed explanation of sentiment patterns. What themes drive positive/negative sentiment? Include specific examples or quotes."
}}

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object, nothing else
- Do NOT include markdown code blocks or backticks
- Do NOT include explanatory text before or after the JSON
- Start your response with {{ and end with }}
- Ensure distribution counts sum to approximately {len(sampled_responses)} responses"""

        result = await self.generate_completion(prompt, system_message)

        try:
            # Extract and clean JSON from response
            cleaned_result = self._extract_json_from_response(result)
            return json.loads(cleaned_result)
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse sentiment JSON: {str(e)}\nResponse: {result[:200]}..."
            )
            return {
                "overall_sentiment": {
                    "label": "neutral",
                    "score": 0.5,
                    "confidence": 0.5,
                },
                "distribution": {
                    "positive": 0,
                    "negative": 0,
                    "neutral": len(responses),
                },
                "explanation": result,
            }

    async def detect_topics(self, responses: List[str]) -> List[Dict[str, Any]]:
        """Detect main topics and themes in survey responses"""

        # Sample responses for topic detection
        sampled_responses = self._sample_responses(responses, max_samples=150)

        responses_text = "\n".join(
            [f"{i+1}. {r}" for i, r in enumerate(sampled_responses)]
        )

        system_message = """You are an expert at topic modeling and thematic analysis in software engineering research.
You excel at identifying latent themes, clustering related concepts, and extracting meaningful patterns from developer feedback.
You understand software development domains including tools, practices, challenges, and workflows."""

        prompt = f"""Identify the main topics and themes in these developer survey responses using thematic analysis.

CONTEXT: These are responses from software developers. Topics may include:
- Development tools and technologies
- Workflows and methodologies
- Challenges and pain points
- Team collaboration and communication
- Code quality and testing
- Learning and skill development
- Specific technical domains (e.g., DevOps, frontend, backend)

TASK:
Identify 5-7 distinct, meaningful topics that emerge from the data. For each topic:
1. **Topic Name**: Clear, descriptive name (2-4 words)
2. **Keywords**: 3-5 key terms that represent this topic
3. **Frequency**: Assess prevalence (high: >40%, medium: 15-40%, low: <15% of responses)
4. **Sample Responses**: 2-3 direct quotes that best exemplify this topic

QUALITY CRITERIA:
- Topics should be distinct (minimal overlap)
- Topics should be specific and actionable
- Focus on substantive themes, not superficial keywords
- Order topics by significance (most prevalent/important first)

SURVEY RESPONSES:
{responses_text}

OUTPUT FORMAT (strict JSON):
[
    {{
        "topic": "Development Tool Integration",
        "keywords": ["integration", "tooling", "workflow", "automation"],
        "frequency": "high",
        "sample_responses": [
            "Quote 1 that exemplifies this topic",
            "Quote 2 that shows this theme"
        ]
    }},
    {{
        "topic": "Next topic name",
        "keywords": ["keyword1", "keyword2", "keyword3"],
        "frequency": "medium",
        "sample_responses": ["example 1", "example 2"]
    }}
    // ... continue for 5-7 topics total
]

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON array, nothing else
- Do NOT include markdown code blocks or backticks
- Do NOT include explanatory text before or after the JSON
- Start your response with [ and end with ]
- Each sample response must be an actual quote from the provided responses"""

        result = await self.generate_completion(prompt, system_message)

        try:
            # Extract and clean JSON from response
            cleaned_result = self._extract_json_from_response(result)
            return json.loads(cleaned_result)
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse topics JSON: {str(e)}\nResponse: {result[:200]}..."
            )
            return []

    async def extract_open_problems(self, responses: List[str]) -> List[Dict[str, Any]]:
        """Extract open research problems and challenges mentioned in responses"""

        # Sample responses for problem extraction
        sampled_responses = self._sample_responses(responses, max_samples=150)

        responses_text = "\n".join(
            [f"{i+1}. {r}" for i, r in enumerate(sampled_responses)]
        )

        system_message = """You are a software engineering researcher specializing in identifying open research problems, research gaps, and areas requiring innovation.
You excel at extracting actionable research questions from practitioner feedback, understanding both technical challenges and socio-technical issues.
You can distinguish between solvable problems and fundamental research questions that advance the field."""

        prompt = f"""Analyze these developer survey responses to identify significant open research problems and challenges.

CONTEXT: Open research problems are:
- Challenges mentioned by developers that lack adequate solutions
- Pain points that indicate gaps in current tools, practices, or knowledge
- Recurring issues that suggest systemic problems
- Areas where developers express need for better approaches

PROBLEM CATEGORIES (use these or create new ones if needed):
- **Tooling & Infrastructure**: IDE features, build systems, deployment tools
- **Code Quality & Testing**: Testing practices, code review, quality assurance
- **Collaboration & Communication**: Team coordination, knowledge sharing
- **Performance & Scalability**: System performance, optimization challenges
- **Security & Privacy**: Security practices, vulnerability management
- **Developer Experience**: Workflow friction, learning curves, productivity
- **AI/ML Integration**: Using AI tools, training models, MLOps

TASK:
Identify 3-8 significant open problems. For each:
1. **Title**: Concise, descriptive problem statement (5-10 words)
2. **Description**: Detailed explanation (2-3 sentences) of the problem, its impact, and why it's challenging
3. **Category**: Best-fit category from above list
4. **Priority**: Assess importance
   - HIGH: Affects many developers, has significant impact, mentioned frequently
   - MEDIUM: Affects specific groups, moderate impact
   - LOW: Niche issue or less severe impact
5. **Supporting Evidence**: 1-2 direct quotes from responses that illustrate this problem

SURVEY RESPONSES:
{responses_text}

OUTPUT FORMAT (strict JSON):
[
    {{
        "title": "Clear Problem Title",
        "description": "Detailed description explaining what the problem is, why it matters, and what makes it challenging to solve. Should be specific and actionable.",
        "category": "Category name",
        "priority": "high",
        "supporting_responses": [
            "Direct quote from responses showing this problem",
            "Another quote illustrating the issue"
        ]
    }}
    // ... continue for 3-8 problems, ordered by priority (high first)
]

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON array, nothing else
- Do NOT include markdown code blocks or backticks
- Do NOT include explanatory text before or after the JSON
- Start your response with [ and end with ]
- Focus on problems that represent research opportunities, not simple feature requests
- Supporting quotes must be actual excerpts from the provided responses
- Order problems by priority (high priority first)"""

        result = await self.generate_completion(prompt, system_message)

        try:
            # Extract and clean JSON from response
            cleaned_result = self._extract_json_from_response(result)
            return json.loads(cleaned_result)
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse problems JSON: {str(e)}\nResponse: {result[:200]}..."
            )
            return []

    async def full_analysis(self, responses: List[str]) -> Dict[str, Any]:
        """Perform complete analysis: summary, sentiment, topics, and open problems"""

        logger.info(f"Starting full analysis of {len(responses)} responses")

        # Run all analyses
        summary_result = await self.summarize_responses(responses)
        sentiment_result = await self.analyze_sentiment(responses)
        topics_result = await self.detect_topics(responses)
        problems_result = await self.extract_open_problems(responses)

        # Ensure summary is clean text, not nested JSON
        summary_text = summary_result.get("summary", "")
        key_findings = summary_result.get("key_findings", [])

        # Validate that summary is not accidentally JSON
        if isinstance(summary_text, str):
            summary_text = summary_text.strip()
            if summary_text.startswith("{") and '"summary"' in summary_text:
                logger.warning("Detected nested JSON in full analysis summary")
                try:
                    nested = json.loads(summary_text)
                    if isinstance(nested, dict):
                        summary_text = nested.get("summary", summary_text)
                        if "key_findings" in nested:
                            key_findings = nested.get("key_findings", key_findings)
                except:
                    logger.error("Failed to parse nested JSON, using as-is")

        return {
            "summary": summary_text,
            "key_findings": key_findings,
            "sentiment": sentiment_result,
            "topics": topics_result,
            "open_problems": problems_result,
        }

    async def analyze_question(
        self, question_text: str, responses: List[str]
    ) -> Dict[str, Any]:
        """Analyze responses for a specific question in a multi-question survey"""

        logger.info(
            f"Analyzing question '{question_text[:50]}...' with {len(responses)} responses"
        )

        # Perform targeted analysis for this specific question
        summary_result = await self.summarize_responses(responses)
        sentiment_result = await self.analyze_sentiment(responses)
        topics_result = await self.detect_topics(responses)
        problems_result = await self.extract_open_problems(responses)

        # Ensure summary is clean text, not nested JSON
        summary_text = summary_result.get("summary", "")
        key_findings = summary_result.get("key_findings", [])

        # Validate that summary is not accidentally JSON
        if isinstance(summary_text, str):
            summary_text = summary_text.strip()
            if summary_text.startswith("{") and '"summary"' in summary_text:
                logger.warning(
                    f"Detected nested JSON in summary for question: {question_text[:50]}"
                )
                try:
                    nested = json.loads(summary_text)
                    if isinstance(nested, dict):
                        summary_text = nested.get("summary", summary_text)
                        if "key_findings" in nested:
                            key_findings = nested.get("key_findings", key_findings)
                except:
                    logger.error(f"Failed to parse nested JSON, using as-is")

        return {
            "question_text": question_text,
            "summary": summary_text,
            "key_findings": key_findings,
            "sentiment": sentiment_result,
            "topics": topics_result,
            "open_problems": problems_result,
            "response_count": len(responses),
        }

    async def analyze_structured_survey(
        self, processed_data: Dict[str, Dict], progress_callback=None
    ) -> Dict[str, Any]:
        """Analyze a structured multi-question survey (like Stack Overflow Developer Survey)"""

        logger.info(
            f"Starting structured survey analysis with {len(processed_data)} questions"
        )

        question_analyses = []
        total_questions = len(processed_data)
        current_question = 0

        # Analyze each question separately
        for question_id, data in processed_data.items():
            current_question += 1
            question_text = data["question_text"]
            responses = data["responses"]

            if len(responses) < 3:
                # Skip questions with too few responses
                logger.info(
                    f"Skipping question '{question_text}' - insufficient responses"
                )
                continue

            # Report progress before analyzing question
            if progress_callback:
                await progress_callback(
                    step="analyzing_questions",
                    message=f"Analyzing question: {question_text[:50]}...",
                    current_question=current_question,
                    total_questions=total_questions,
                )

            analysis = await self.analyze_question(question_text, responses)
            analysis["question_id"] = question_id
            question_analyses.append(analysis)

        # Generate cross-question insights
        if progress_callback:
            await progress_callback(
                step="generating_insights",
                message="Generating cross-question insights...",
                current_question=total_questions,
                total_questions=total_questions,
            )

        cross_insights = await self._generate_cross_question_insights(question_analyses)

        return {
            "question_analyses": question_analyses,
            "cross_question_insights": cross_insights,
            "total_questions_analyzed": len(question_analyses),
        }

    async def _generate_cross_question_insights(
        self, question_analyses: List[Dict]
    ) -> Dict[str, Any]:
        """Generate insights that span across multiple questions"""

        # Compile summaries from all questions
        all_summaries = "\n\n".join(
            [
                f"Question: {q['question_text']}\nSummary: {q['summary']}"
                for q in question_analyses
            ]
        )

        system_message = """You are an expert analyst specializing in multi-dimensional survey data analysis and mixed-methods research.
You excel at synthesizing insights across different data sources, identifying emergent themes, and detecting relationships between different aspects of complex phenomena.
Your analysis goes beyond surface-level observations to uncover meaningful connections and patterns."""

        prompt = f"""Perform cross-question analysis on this multi-question survey to identify overarching insights.

CONTEXT: You are analyzing a software development survey where different questions explore various aspects of developer experiences, tools, practices, and challenges.

TASK:
Analyze the summaries from all questions to identify:

1. **Common Themes** (3-5 themes): Recurring topics, concepts, or concerns that appear across multiple questions
   - Look for themes mentioned in 3+ different questions
   - Focus on substantial themes, not superficial keywords
   
2. **Key Patterns** (3-5 patterns): Observable trends or regularities in how developers respond
   - Examples: correlation between tools and pain points, common workflow sequences, demographic patterns
   - Focus on actionable patterns that reveal insights about developer behavior
   
3. **Overall Insights** (2-3 paragraph narrative): Synthesize what the survey reveals when viewed holistically
   - What is the "big picture" story these responses tell?
   - What are the most important takeaways for researchers or tool builders?
   - Connect disparate findings into a coherent narrative
   
4. **Cross-Question Findings** (3-5 findings): Specific insights that emerge only when comparing multiple questions
   - Contradictions or tensions between different areas
   - Interesting relationships or dependencies
   - Unexpected connections

SURVEY QUESTION SUMMARIES:
{all_summaries}

OUTPUT FORMAT (strict JSON):
{{
    "common_themes": [
        "Theme 1: Description of recurring theme across questions",
        "Theme 2: Another cross-cutting theme",
        "..."
    ],
    "key_patterns": [
        "Pattern 1: Observable trend or regularity",
        "Pattern 2: Another significant pattern",
        "..."
    ],
    "overall_insights": "Your comprehensive 2-3 paragraph synthesis here. This should tell a cohesive story about what the survey reveals about developer experiences, challenges, and needs. Connect the dots between different questions and themes.",
    "cross_question_findings": [
        "Finding 1: Specific insight that emerges from comparing questions",
        "Finding 2: Another cross-question relationship or contradiction",
        "..."
    ]
}}

CRITICAL INSTRUCTIONS:
- Return ONLY the JSON object, nothing else
- Do NOT include markdown code blocks or backticks
- Do NOT include explanatory text before or after the JSON
- Start your response with {{ and end with }}
- Make insights specific and evidence-based, referencing specific questions when relevant"""

        result = await self.generate_completion(prompt, system_message)

        try:
            # Extract and clean JSON from response
            cleaned_result = self._extract_json_from_response(result)
            return json.loads(cleaned_result)
        except json.JSONDecodeError as e:
            logger.error(
                f"Failed to parse cross-question insights JSON: {str(e)}\nResponse: {result[:200]}..."
            )
            return {
                "common_themes": [],
                "key_patterns": [],
                "overall_insights": "Unable to generate cross-question insights",
                "cross_question_findings": [],
            }
