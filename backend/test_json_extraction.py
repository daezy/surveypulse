"""
Test JSON extraction from LLM responses
"""

import json


def extract_json_from_response(response: str) -> str:
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


def test_json_extraction():
    """Test the extract_json_from_response function"""

    # Test 1: Clean JSON
    response1 = '{"summary": "Test summary", "key_findings": ["Finding 1"]}'
    result1 = extract_json_from_response(response1)
    print("Test 1 - Clean JSON:")
    print(f"Input: {response1}")
    print(f"Output: {result1}")
    print(f"Valid JSON: {json.loads(result1) is not None}")
    print()

    # Test 2: JSON with markdown code block
    response2 = """Here is the response:
```json
{
    "summary": "Test summary",
    "key_findings": ["Finding 1", "Finding 2"]
}
```
Hope this helps!"""
    result2 = extract_json_from_response(response2)
    print("Test 2 - JSON with markdown:")
    print(f"Input: {response2[:50]}...")
    print(f"Output: {result2}")
    print(f"Valid JSON: {json.loads(result2) is not None}")
    print()

    # Test 3: JSON with plain code block
    response3 = """```
{
    "summary": "Test summary",
    "key_findings": ["Finding 1"]
}
```"""
    result3 = extract_json_from_response(response3)
    print("Test 3 - JSON with plain markdown:")
    print(f"Input: {response3[:50]}...")
    print(f"Output: {result3}")
    print(f"Valid JSON: {json.loads(result3) is not None}")
    print()

    # Test 4: JSON with extra text
    response4 = """Sure! Here is the JSON:
{
    "summary": "Test summary",
    "key_findings": ["Finding 1", "Finding 2"]
}
Let me know if you need anything else."""
    result4 = extract_json_from_response(response4)
    print("Test 4 - JSON with extra text:")
    print(f"Input: {response4[:50]}...")
    print(f"Output: {result4}")
    print(f"Valid JSON: {json.loads(result4) is not None}")
    print()

    # Test 5: Array response
    response5 = """```json
[
    {
        "topic": "Testing",
        "keywords": ["test", "qa"],
        "frequency": "high"
    }
]
```"""
    result5 = extract_json_from_response(response5)
    print("Test 5 - Array response:")
    print(f"Input: {response5[:50]}...")
    print(f"Output: {result5}")
    print(f"Valid JSON: {json.loads(result5) is not None}")
    print()

    # Test 6: The problematic case from user
    response6 = """Summary
{ "summary": "The survey responses reveal...", "key_findings": ["test"] }

Sentiment:
NEUTRAL"""
    result6 = extract_json_from_response(response6)
    print("Test 6 - User's problematic case:")
    print(f"Input: {response6[:50]}...")
    print(f"Output: {result6}")
    print(f"Valid JSON: {json.loads(result6) is not None}")
    print()

    print("✅ All extraction tests completed!")


if __name__ == "__main__":
    test_json_extraction()
