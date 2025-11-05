# Contributing Guide

Thank you for your interest in contributing to the LLM Survey Analysis System!

## 🤝 How to Contribute

### Reporting Bugs

1. Check existing issues first
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details

### Suggesting Features

1. Open an issue with the "feature" label
2. Describe the feature and its benefits
3. Provide use cases
4. Suggest implementation approach

### Code Contributions

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Write/update tests
5. Update documentation
6. Commit with clear messages
7. Push and create a Pull Request

## 📝 Coding Standards

### Python (Backend)

```python
# Follow PEP 8 style guide
# Use type hints
def analyze_sentiment(text: str) -> Dict[str, Any]:
    """Analyze sentiment of text.

    Args:
        text: Input text to analyze

    Returns:
        Dictionary with sentiment results
    """
    # Implementation
    pass

# Use docstrings for all functions/classes
# Keep functions focused and small
# Handle errors appropriately
```

### JavaScript/React (Frontend)

```javascript
// Use functional components with hooks
// Name components in PascalCase
const AnalysisCard = ({ data, onAction }) => {
  // Use descriptive variable names
  const [isLoading, setIsLoading] = useState(false);

  // Extract complex logic to custom hooks
  const { analysis, error } = useAnalysis(data.id);

  // Return JSX
  return <div>...</div>;
};

// Export at bottom
export default AnalysisCard;
```

### General Guidelines

- **DRY**: Don't Repeat Yourself
- **KISS**: Keep It Simple, Stupid
- **YAGNI**: You Aren't Gonna Need It
- Write self-documenting code
- Comment complex logic only
- Use meaningful variable names

## 🧪 Testing

### Before Submitting

- [ ] Run all existing tests
- [ ] Add tests for new features
- [ ] Test manually in browser
- [ ] Check console for errors
- [ ] Verify API endpoints work
- [ ] Test on different screen sizes

### Running Tests

```bash
# Backend tests (when added)
cd backend
pytest

# Frontend tests (when added)
cd frontend
npm run test

# Linting
cd backend
pylint app/

cd frontend
npm run lint
```

## 📚 Documentation

### What to Document

- New features
- API changes
- Configuration options
- Breaking changes
- Migration guides

### Where to Document

- Code comments (for complex logic)
- Docstrings (for functions/classes)
- README.md (for overview)
- Separate .md files (for detailed guides)
- API docs (auto-generated)

## 🔄 Development Workflow

### 1. Set Up Development Environment

```bash
# Clone repo
git clone <repo-url>
cd "Final year project"

# Install dependencies
cd backend && pip install -r requirements.txt
cd ../frontend && npm install

# Create environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Edit with your values
```

### 2. Create Feature Branch

```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
```

### 3. Make Changes

- Write code
- Test locally
- Commit frequently with clear messages

### 4. Commit Messages

Follow conventional commits:

```bash
# Format: type(scope): description

# Examples:
git commit -m "feat(analysis): add topic clustering"
git commit -m "fix(upload): handle large files"
git commit -m "docs(readme): update setup instructions"
git commit -m "style(ui): improve button spacing"
git commit -m "refactor(preprocessing): optimize text cleaning"
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 5. Push and Create PR

```bash
git push origin feature/amazing-feature
```

Then create a Pull Request on GitHub with:

- Clear title
- Description of changes
- Related issues
- Screenshots (for UI changes)
- Testing notes

## 🏗️ Project Structure

### Adding New Features

#### Backend Endpoint

1. Create route in `backend/app/api/routes/`
2. Add business logic in `backend/app/services/`
3. Update models in `backend/app/models/schemas.py`
4. Test endpoint via Swagger UI

#### Frontend Component

1. Create component in `frontend/src/components/`
2. Add to appropriate page
3. Update routes if needed
4. Style with Tailwind CSS
5. Test responsiveness

#### New Analysis Type

1. Add to `AnalysisType` enum in `schemas.py`
2. Implement in `llm_service.py`
3. Update frontend to support selection
4. Add result visualization

## 🎨 UI/UX Guidelines

### Design Principles

- **Consistency**: Use existing components
- **Clarity**: Clear labels and instructions
- **Feedback**: Show loading states
- **Accessibility**: Support keyboard navigation
- **Responsiveness**: Test on mobile

### Component Usage

```jsx
// Use existing UI components
import { Button, Card, Badge } from "@/components/ui";

// Follow Tailwind utility pattern
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-sm">
  <Button variant="primary" size="lg">
    Action
  </Button>
</div>;
```

## 🔍 Code Review Process

### For Contributors

- Respond to feedback promptly
- Make requested changes
- Re-request review after updates

### For Reviewers

Check for:

- [ ] Code quality and style
- [ ] Tests included
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Security considerations
- [ ] Performance impact

## 🚀 Release Process

### Version Numbering

Follow Semantic Versioning (semver):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `1.2.3`

### Creating a Release

1. Update version in `package.json` and `pyproject.toml`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.2.3`
4. Push tag: `git push origin v1.2.3`
5. Create GitHub release with notes

## 🐛 Debugging Tips

### Backend Issues

```bash
# Enable debug logging
DEBUG=True python -m uvicorn main:app --reload

# Check MongoDB connection
mongo
use survey_analysis
db.surveys.find()

# Test API endpoints
curl -X GET http://localhost:8000/api/v1/health
```

### Frontend Issues

```bash
# Check browser console
# Use React DevTools
# Check network tab for API calls

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📋 Checklist Before Submitting

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] PR description is complete
- [ ] Screenshots included (if UI change)

## 💬 Community

### Communication Channels

- GitHub Issues: Bug reports and features
- Pull Requests: Code contributions
- Discussions: General questions

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers
- Provide constructive feedback
- Focus on the issue, not the person

## 🙏 Recognition

Contributors will be:

- Listed in CONTRIBUTORS.md
- Credited in release notes
- Acknowledged in documentation

## 📧 Questions?

If you have questions:

1. Check existing documentation
2. Search closed issues
3. Open a new issue with "question" label

---

Thank you for contributing to the LLM Survey Analysis System! 🎉
