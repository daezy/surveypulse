# Visual Summary Dashboard - Developer Guide

## 🛠️ Implementation Details

### Component Structure

```jsx
AnalysisResults Component
├── Summary Stats Card (existing)
├── Visual Summary Dashboard (NEW)
│   ├── Header with icon and description
│   ├── Charts Grid (3 columns, responsive)
│   │   ├── Sentiment Distribution Chart
│   │   ├── Top Topics Chart
│   │   └── Problems by Priority Chart
│   └── Key Metrics Row (4 metric cards)
├── Cross-Question Insights (structured surveys)
├── Per-Question Analysis (structured surveys)
└── Detailed Analysis Sections (simple surveys)
```

## 📦 Dependencies

### Required Packages (Already Installed)

```json
{
  "recharts": "^2.12.0", // Charting library
  "lucide-react": "^0.323.0", // Icons
  "tailwindcss": "^3.x" // Styling
}
```

### New Chart Components Used

```jsx
import {
  PieChart,
  Pie,
  Cell, // For sentiment and problems
  BarChart,
  Bar, // For topics
  XAxis,
  YAxis, // Axes
  CartesianGrid,
  Tooltip, // Chart utilities
  ResponsiveContainer, // Responsive wrapper
} from "recharts";
```

## 🔧 Key Functions

### 1. Data Aggregation Function

```javascript
const aggregateStructuredData = () => {
  if (!isStructuredSurvey) return null;

  const allTopics = {};
  const allProblems = [];
  let totalPositive = 0,
    totalNegative = 0,
    totalNeutral = 0;

  results.question_analyses?.forEach((qa) => {
    // Aggregate sentiment
    if (qa.sentiment?.distribution) {
      totalPositive += qa.sentiment.distribution.positive || 0;
      totalNegative += qa.sentiment.distribution.negative || 0;
      totalNeutral += qa.sentiment.distribution.neutral || 0;
    }

    // Aggregate topics (count occurrences)
    qa.topics?.forEach((topic) => {
      if (allTopics[topic.topic]) {
        allTopics[topic.topic].count++;
      } else {
        allTopics[topic.topic] = {
          name: topic.topic,
          count: 1,
          keywords: topic.keywords || [],
        };
      }
    });

    // Collect all problems
    qa.open_problems?.forEach((problem) => {
      allProblems.push({
        ...problem,
        question: qa.question_text,
      });
    });
  });

  return {
    sentiment: {
      positive: totalPositive,
      negative: totalNegative,
      neutral: totalNeutral,
    },
    topics: Object.values(allTopics)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7),
    problems: allProblems,
  };
};
```

**Purpose**: Combines data from multiple questions into single aggregated view  
**Returns**: Object with aggregated sentiment, topics, and problems  
**Performance**: O(n) where n = number of questions

### 2. Data Preparation

#### Sentiment Data

```javascript
const sentimentData = isStructuredSurvey && aggregatedData ? [
  { name: 'Positive', value: aggregatedData.sentiment.positive, color: COLORS[0] },
  { name: 'Negative', value: aggregatedData.sentiment.negative, color: COLORS[1] },
  { name: 'Neutral', value: aggregatedData.sentiment.neutral, color: COLORS[2] },
] : results.sentiment_distribution ? [...] : []
```

#### Topics Data

```javascript
const topicsData = isStructuredSurvey && aggregatedData
  ? aggregatedData.topics.map((topic, idx) => ({
      name: topic.name.length > 20 ? topic.name.substring(0, 20) + '...' : topic.name,
      fullName: topic.name,  // For tooltip
      count: topic.count,
      fill: TOPIC_COLORS[idx % TOPIC_COLORS.length]
    }))
  : results.topics?.slice(0, 7).map(...) || []
```

#### Problems Data

```javascript
const problemsByPriority = {
  high: allProblems.filter((p) => p.priority === "high").length,
  medium: allProblems.filter((p) => p.priority === "medium").length,
  low: allProblems.filter((p) => p.priority === "low").length,
};

const problemsData = [
  {
    name: "High Priority",
    value: problemsByPriority.high,
    color: PRIORITY_COLORS.high,
  },
  {
    name: "Medium Priority",
    value: problemsByPriority.medium,
    color: PRIORITY_COLORS.medium,
  },
  {
    name: "Low Priority",
    value: problemsByPriority.low,
    color: PRIORITY_COLORS.low,
  },
].filter((d) => d.value > 0); // Only show non-zero priorities
```

## 🎨 Styling Approach

### Tailwind Classes Used

```css
/* Card Styling */
.border-2 border-primary/20 shadow-xl
.bg-gradient-to-r from-primary/10 to-primary/5

/* Grid Layouts */
.grid md:grid-cols-2 lg:grid-cols-3 gap-6
.grid grid-cols-2 md:grid-cols-4 gap-4

/* Chart Containers */
.bg-accent/50 rounded-lg p-4 h-full

/* Metric Cards */
.bg-gradient-to-br from-green-50 to-green-100
.dark:from-green-950 dark:to-green-900
```

### Dark Mode Support

All colors use HSL variables that adapt to theme:

```jsx
backgroundColor: "hsl(var(--card))";
border: "1px solid hsl(var(--border))";
```

## 📊 Chart Configurations

### 1. Sentiment Donut Chart

```jsx
<PieChart>
  <Pie
    data={sentimentData}
    cx="50%" // Center X
    cy="50%" // Center Y
    innerRadius={60} // Creates donut effect
    outerRadius={90} // Outer size
    paddingAngle={2} // Gap between segments
    dataKey="value"
    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
  >
    {sentimentData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index]} />
    ))}
  </Pie>
  <Tooltip formatter={(value) => formatNumber(value)} />
</PieChart>
```

**Customization Points**:

- `innerRadius`: Adjust donut thickness (0 = full pie)
- `paddingAngle`: Gap between segments
- `label`: Format of percentage labels

### 2. Topics Horizontal Bar Chart

```jsx
<BarChart data={topicsData} layout="vertical">
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis type="number" />
  <YAxis
    type="category"
    dataKey="name"
    width={100} // Reserved space for labels
    tick={{ fontSize: 11 }}
  />
  <Tooltip content={CustomTooltip} />
  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
    {topicsData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.fill} />
    ))}
  </Bar>
</BarChart>
```

**Features**:

- Horizontal layout for better label readability
- Custom tooltip showing full topic name
- Rounded bar ends
- Individual bar colors

### 3. Problems Priority Pie Chart

```jsx
<PieChart>
  <Pie
    data={problemsData}
    outerRadius={90}
    paddingAngle={2}
    dataKey="value"
    label={({ value }) => `${value}`} // Show count
  >
    {problemsData.map((entry, index) => (
      <Cell key={`cell-${index}`} fill={entry.color} />
    ))}
  </Pie>
  <Tooltip formatter={(value) => [`${value} problems`, "Count"]} />
</PieChart>
```

**Features**:

- Shows count labels
- Priority-based colors
- Filters out zero-value priorities

## 🎯 Custom Tooltip Implementation

```jsx
<Tooltip
  content={({ payload }) => {
    if (payload && payload[0]) {
      return (
        <div className="bg-card border border-border rounded-lg p-2 shadow-lg">
          <p className="font-semibold text-sm">{payload[0].payload.fullName}</p>
          <p className="text-xs text-muted-foreground">
            Mentioned in {payload[0].value} questions
          </p>
        </div>
      );
    }
    return null;
  }}
/>
```

**Benefits**:

- Shows full topic names (truncated in chart)
- Contextual information
- Styled to match theme

## 📈 Performance Optimizations

### Current Optimizations

1. **Single Pass Aggregation**: Data aggregated once, not per render
2. **Conditional Rendering**: Charts only render if data exists
3. **Filter Empty Data**: Removes zero-value entries before charting
4. **Limited Data Sets**: Shows top 7 topics (prevents overcrowding)

### Potential Optimizations

```javascript
// 1. Memoize aggregation function
const aggregatedData = useMemo(
  () => (isStructuredSurvey ? aggregateStructuredData() : null),
  [results]
);

// 2. Memoize chart data
const sentimentData = useMemo(() => {
  // ... data preparation
}, [aggregatedData, results]);

// 3. Lazy load charts
const ChartsGrid = lazy(() => import("./ChartsGrid"));
```

## 🧪 Testing Guidelines

### Unit Tests

```javascript
describe('Visual Summary Dashboard', () => {
  test('aggregates sentiment correctly', () => {
    const mockData = { question_analyses: [...] }
    const result = aggregateStructuredData(mockData)
    expect(result.sentiment.positive).toBe(expectedValue)
  })

  test('limits topics to 7', () => {
    const topics = generateTopicsData(mockTopics)
    expect(topics.length).toBeLessThanOrEqual(7)
  })

  test('filters zero-value problems', () => {
    const problems = generateProblemsData(mockProblems)
    expect(problems.every(p => p.value > 0)).toBe(true)
  })
})
```

### Integration Tests

```javascript
test("renders all charts with valid data", () => {
  render(<AnalysisResults results={mockResults} />);

  expect(screen.getByText("Visual Summary Dashboard")).toBeInTheDocument();
  expect(screen.getByText("Sentiment Distribution")).toBeInTheDocument();
  expect(screen.getByText("Top Topics")).toBeInTheDocument();
  expect(screen.getByText("Problems by Priority")).toBeInTheDocument();
});

test("handles empty data gracefully", () => {
  render(<AnalysisResults results={emptyResults} />);

  expect(
    screen.queryByText("Visual Summary Dashboard")
  ).not.toBeInTheDocument();
});
```

## 🐛 Common Issues & Solutions

### Issue 1: Charts Not Rendering

**Symptom**: Empty space where charts should be  
**Cause**: Invalid or empty data  
**Solution**: Check data format and add fallbacks

```javascript
{
  sentimentData.length > 0 && totalSentimentResponses > 0 && <ChartComponent />;
}
```

### Issue 2: Tooltip Not Showing Full Names

**Symptom**: Truncated names in tooltip  
**Cause**: Not passing `fullName` in data  
**Solution**: Include full name in data object

```javascript
{ name: truncated, fullName: original }
```

### Issue 3: Colors Not Consistent

**Symptom**: Colors change between renders  
**Cause**: Random color assignment  
**Solution**: Use indexed color arrays

```javascript
fill={TOPIC_COLORS[idx % TOPIC_COLORS.length]}
```

### Issue 4: Responsive Layout Breaks

**Symptom**: Charts overflow on mobile  
**Cause**: Fixed widths or missing responsive classes  
**Solution**: Use ResponsiveContainer and responsive grid

```javascript
<ResponsiveContainer width="100%" height={250}>
```

## 🔄 Update Process

### Adding New Chart Type

1. Import chart components from recharts
2. Prepare data in correct format
3. Add to charts grid
4. Test responsiveness
5. Update documentation

### Modifying Existing Chart

1. Locate chart configuration
2. Update data preparation if needed
3. Modify chart props
4. Test with sample data
5. Verify tooltips still work

## 📚 Resources

### Recharts Documentation

- [Official Docs](https://recharts.org/)
- [API Reference](https://recharts.org/en-US/api)
- [Examples](https://recharts.org/en-US/examples)

### Tailwind CSS

- [Utility Classes](https://tailwindcss.com/docs)
- [Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Dark Mode](https://tailwindcss.com/docs/dark-mode)

---

**Last Updated**: November 4, 2025  
**Maintainer**: Development Team  
**Questions?**: Check component comments or create issue
