# LLM Prompt Optimization Summary

## Overview

All LLM prompts in the application have been optimized for better results, following best practices in prompt engineering for qualitative data analysis and software engineering research.

## Optimizations Made

### 1. Summary & Key Findings Prompt

**Location**: `backend/app/services/llm_service.py` - `summarize_responses()`

**Improvements**:

- ✅ Enhanced system message with specific expertise context
- ✅ Added detailed task breakdown with clear expectations
- ✅ Structured instructions with numbered lists and clear criteria
- ✅ Added examples of what makes good findings (specific, actionable, evidence-based)
- ✅ Specified ordering by significance
- ✅ Clear output format with stricter JSON requirements
- ✅ Added note about returning ONLY JSON (prevents text before/after)

**Key Changes**:

- System message now emphasizes qualitative data analysis expertise
- Instructions specify 2-3 well-structured paragraphs with specific requirements
- Key findings must be ordered by significance (most important first)
- Each finding should be concise but meaningful (1-2 sentences)

### 2. Sentiment Analysis Prompt

**Location**: `backend/app/services/llm_service.py` - `analyze_sentiment()`

**Improvements**:

- ✅ Added domain-specific context about technical communication
- ✅ Defined clear sentiment classification guide
- ✅ Explained nuances in developer feedback (constructive criticism, mixed sentiments)
- ✅ Required detailed explanation with specific examples
- ✅ Added validation note about distribution counts
- ✅ Clearer scoring system (0.0 to 1.0 scale explained)

**Key Changes**:

- Context section explains developer communication patterns
- Classification guide clearly defines positive/negative/neutral
- Considers technical language nuances
- Expects distribution counts to sum correctly

### 3. Topic Detection Prompt

**Location**: `backend/app/services/llm_service.py` - `detect_topics()`

**Improvements**:

- ✅ Added thematic analysis expertise to system message
- ✅ Provided context about common software development topics
- ✅ Added quality criteria for topics (distinct, specific, actionable)
- ✅ Specified frequency assessment guidelines (percentages)
- ✅ Required ordering by significance
- ✅ Added example topic structure in output format
- ✅ Emphasized that sample responses must be actual quotes

**Key Changes**:

- Context lists potential topic categories to guide analysis
- Quality criteria ensure topics are distinct and meaningful
- Frequency levels have specific percentage ranges
- Sample responses must be direct quotes from data

### 4. Open Problems Extraction Prompt

**Location**: `backend/app/services/llm_service.py` - `extract_open_problems()`

**Improvements**:

- ✅ Enhanced expertise description (research gaps, innovation opportunities)
- ✅ Added clear definition of what constitutes an "open research problem"
- ✅ Provided comprehensive category list with examples
- ✅ Detailed priority assessment criteria
- ✅ Required 2-3 sentence problem descriptions
- ✅ Specified ordering by priority
- ✅ Distinguished research problems from simple feature requests

**Key Changes**:

- Context explains what makes a problem "open" or research-worthy
- Category list covers all major software engineering domains
- Priority levels have explicit criteria (frequency + impact)
- Focus on research opportunities, not just complaints

### 5. Cross-Question Insights Prompt

**Location**: `backend/app/services/llm_service.py` - `_generate_cross_question_insights()`

**Improvements**:

- ✅ Enhanced system message with mixed-methods research expertise
- ✅ Added clear context about multi-dimensional analysis
- ✅ Structured task into 4 clear sections with guidelines
- ✅ Specified minimum thresholds (themes in 3+ questions)
- ✅ Required 2-3 paragraph narrative with specific guidance
- ✅ Added examples of what to look for in each section
- ✅ Emphasized evidence-based insights

**Key Changes**:

- Each output field has clear expectations and examples
- Overall insights requires cohesive narrative (2-3 paragraphs)
- Cross-question findings focus on relationships and contradictions
- Guidance on what makes good cross-question analysis

## Prompt Engineering Best Practices Applied

### 1. **Clear Role Definition**

Every system message defines the AI's expertise and perspective:

- "Expert analyst specializing in software engineering research"
- "Expert in sentiment analysis and natural language processing"
- "Expert at topic modeling and thematic analysis"

### 2. **Context Provision**

All prompts provide relevant context:

- Domain knowledge (software development, developer communication)
- Data characteristics (survey responses, technical language)
- Expected content types

### 3. **Structured Instructions**

Tasks are broken down into clear, numbered steps:

- What to analyze
- How to analyze it
- What makes a good output

### 4. **Output Format Specification**

JSON schemas are detailed with:

- Example structures
- Field descriptions
- Data type expectations
- Comments in examples

### 5. **Quality Criteria**

Each prompt includes criteria for good outputs:

- "Specific, actionable, evidence-based"
- "Distinct topics with minimal overlap"
- "Ordered by significance/priority"

### 6. **Constraints and Guidelines**

Clear boundaries prevent issues:

- "Return ONLY valid JSON"
- "Must be actual quotes from responses"
- "Focus on research opportunities, not feature requests"

### 7. **Domain-Specific Guidance**

Industry-specific considerations:

- Technical language nuances
- Common developer topics/challenges
- Software engineering problem categories

## Expected Impact

### Improved Accuracy

- More precise sentiment classification
- Better topic clustering
- More relevant problem identification

### Better Structure

- Consistent JSON formatting
- Properly ordered results
- Complete and valid responses

### Higher Quality Insights

- Evidence-based findings
- Actionable recommendations
- Research-worthy problem identification

### Reduced Errors

- Fewer JSON parsing failures
- Better handling of edge cases
- More reliable outputs

## Testing Recommendations

1. **Test with sample data**: Run analysis on `sample-data/` files
2. **Verify JSON parsing**: Ensure all responses parse correctly
3. **Check output quality**: Review if findings are meaningful and specific
4. **Validate counts**: Ensure sentiment distributions sum correctly
5. **Test edge cases**: Very short/long responses, empty data, etc.

## Future Optimizations

### Potential Enhancements

- [ ] Add few-shot examples for complex analyses
- [ ] Implement chain-of-thought prompting for multi-step reasoning
- [ ] Add self-consistency checks (run multiple times, vote)
- [ ] Implement retrieval-augmented generation for domain knowledge
- [ ] Add prompt versioning and A/B testing

### Model-Specific Tuning

- [ ] Optimize token usage for different model sizes
- [ ] Adjust temperature based on analysis type
- [ ] Fine-tune prompts for specific models (GPT-4, Claude, etc.)

## Notes

- All prompts now follow consistent formatting and structure
- System messages establish expertise and context
- User prompts provide clear, structured instructions
- Output formats are strictly defined with examples
- Quality criteria ensure meaningful results

Last Updated: November 4, 2025
