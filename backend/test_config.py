"""Test script to verify configuration is loaded correctly"""

import sys

sys.path.insert(0, "/Users/admin/Projects/Personal/Final year project/backend")

from app.core.config import settings

print("=" * 60)
print("Configuration Test")
print("=" * 60)
print(f"OpenAI Model: {settings.OPENAI_MODEL}")
print(f"OpenAI Max Tokens: {settings.OPENAI_MAX_TOKENS}")
print(f"OpenAI Temperature: {settings.OPENAI_TEMPERATURE}")
print(f"Max Upload Size: {settings.MAX_UPLOAD_SIZE / (1024*1024):.0f}MB")
print(f"Database: {settings.DATABASE_NAME}")
print("=" * 60)

# Verify max_tokens is reasonable
if settings.OPENAI_MAX_TOKENS > 4096:
    print("⚠️  WARNING: OPENAI_MAX_TOKENS is too high!")
    print(f"   Current value: {settings.OPENAI_MAX_TOKENS}")
    print(f"   gpt-3.5-turbo max: 4096")
    print(f"   gpt-4 max: 8192")
else:
    print(f"✅ OPENAI_MAX_TOKENS is valid: {settings.OPENAI_MAX_TOKENS}")

print("=" * 60)
