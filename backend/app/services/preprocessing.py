import re
import string
from typing import List
import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import logging

logger = logging.getLogger(__name__)

# Download required NLTK data
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", quiet=True)

try:
    nltk.data.find("corpora/stopwords")
except LookupError:
    nltk.download("stopwords", quiet=True)


class DataPreprocessor:
    """Handles data cleaning and preprocessing for survey responses"""

    def __init__(self):
        self.stop_words = set(stopwords.words("english"))

    def clean_text(self, text: str) -> str:
        """Clean a single text response"""
        if not text or not isinstance(text, str):
            return ""

        # Convert to lowercase
        text = text.lower()

        # Remove URLs
        text = re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)

        # Remove HTML tags
        text = re.sub(r"<.*?>", "", text)

        # Remove special characters but keep basic punctuation
        text = re.sub(r"[^\w\s.,!?-]", "", text)

        # Remove extra whitespace
        text = " ".join(text.split())

        return text.strip()

    def remove_duplicates(self, responses: List[str]) -> List[str]:
        """Remove duplicate responses"""
        seen = set()
        unique_responses = []

        for response in responses:
            cleaned = self.clean_text(response)
            if cleaned and cleaned not in seen:
                seen.add(cleaned)
                unique_responses.append(response)

        return unique_responses

    def filter_short_responses(
        self, responses: List[str], min_words: int = 3
    ) -> List[str]:
        """Filter out very short responses"""
        filtered = []

        for response in responses:
            words = response.split()
            if len(words) >= min_words:
                filtered.append(response)

        return filtered

    def tokenize(self, text: str) -> List[str]:
        """Tokenize text into words"""
        return word_tokenize(text)

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """Remove stopwords from tokens"""
        return [token for token in tokens if token.lower() not in self.stop_words]

    def preprocess_batch(self, responses: List[str]) -> List[str]:
        """Preprocess a batch of survey responses"""
        logger.info(f"Preprocessing {len(responses)} responses")

        # Clean each response
        cleaned = [self.clean_text(r) for r in responses]

        # Remove empty responses
        cleaned = [r for r in cleaned if r]

        # Remove duplicates
        cleaned = self.remove_duplicates(cleaned)

        # Filter short responses
        cleaned = self.filter_short_responses(cleaned)

        logger.info(f"After preprocessing: {len(cleaned)} responses")

        return cleaned

    def prepare_for_llm(self, responses: List[str], max_length: int = 4000) -> str:
        """
        Prepare responses for LLM input by concatenating with proper formatting
        Ensures total length doesn't exceed max_length
        """
        formatted_responses = []
        current_length = 0

        for i, response in enumerate(responses, 1):
            formatted = f"{i}. {response}\n"
            response_length = len(formatted)

            if current_length + response_length > max_length:
                break

            formatted_responses.append(formatted)
            current_length += response_length

        return "\n".join(formatted_responses)

    def extract_keywords(self, text: str, top_n: int = 10) -> List[str]:
        """Extract top keywords from text"""
        # Tokenize and clean
        tokens = self.tokenize(text.lower())
        tokens = self.remove_stopwords(tokens)

        # Remove punctuation
        tokens = [t for t in tokens if t not in string.punctuation]

        # Count frequency
        from collections import Counter

        word_freq = Counter(tokens)

        # Get top N keywords
        keywords = [word for word, _ in word_freq.most_common(top_n)]

        return keywords
