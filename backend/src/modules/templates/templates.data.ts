export interface TemplateQuestion {
    type: string;
    text: string;
    description?: string;
    required?: boolean;
    options?: any;
    validation?: any;
}

export interface SurveyTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    estimatedMinutes: number;
    tags: string[];
    icon: string;
    questions: TemplateQuestion[];
}

export const SURVEY_TEMPLATES: SurveyTemplate[] = [
    {
        id: 'nps',
        title: 'Net Promoter Score (NPS)',
        description: 'Measure customer loyalty with a single question and a follow-up.',
        category: 'Customer Experience',
        estimatedMinutes: 1,
        tags: ['nps', 'loyalty', 'customer'],
        icon: 'TrendingUp',
        questions: [
            {
                type: 'NPS',
                text: 'How likely are you to recommend us to a friend or colleague?',
                required: true,
                options: { scale: 10, leftLabel: 'Not at all likely', rightLabel: 'Extremely likely' },
            },
            {
                type: 'LONG_TEXT',
                text: 'What is the primary reason for your score?',
                required: false,
            },
        ],
    },
    {
        id: 'csat',
        title: 'Customer Satisfaction (CSAT)',
        description: 'Quick 3-question pulse on satisfaction, ease, and recommendation.',
        category: 'Customer Experience',
        estimatedMinutes: 2,
        tags: ['csat', 'satisfaction'],
        icon: 'Smile',
        questions: [
            {
                type: 'SINGLE_CHOICE',
                text: 'Overall, how satisfied are you with our product?',
                required: true,
                options: { choices: ['Very dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very satisfied'] },
            },
            {
                type: 'RATING',
                text: 'How easy was it to accomplish what you needed?',
                required: true,
                options: { scale: 5 },
            },
            {
                type: 'LONG_TEXT',
                text: 'What could we do to improve your experience?',
                required: false,
            },
        ],
    },
    {
        id: 'employee-engagement',
        title: 'Employee Engagement Pulse',
        description: 'Short pulse survey covering motivation, manager support, and growth.',
        category: 'HR / Internal',
        estimatedMinutes: 4,
        tags: ['hr', 'engagement', 'employee'],
        icon: 'Users',
        questions: [
            { type: 'RATING', text: 'I feel motivated to do my best work each day.', required: true, options: { scale: 5 } },
            { type: 'RATING', text: 'My manager provides the support I need.', required: true, options: { scale: 5 } },
            { type: 'RATING', text: 'I see clear opportunities for growth here.', required: true, options: { scale: 5 } },
            { type: 'SINGLE_CHOICE', text: 'How likely are you to be working here a year from now?', required: true, options: { choices: ['Very unlikely', 'Unlikely', 'Unsure', 'Likely', 'Very likely'] } },
            { type: 'LONG_TEXT', text: 'What one change would most improve your experience?', required: false },
        ],
    },
    {
        id: 'product-feedback',
        title: 'Product Feedback',
        description: 'Collect structured feedback on a product or feature.',
        category: 'Product',
        estimatedMinutes: 3,
        tags: ['product', 'feedback'],
        icon: 'MessageSquare',
        questions: [
            { type: 'SHORT_TEXT', text: 'Which feature did you use most?', required: true },
            { type: 'RATING', text: 'How would you rate this feature?', required: true, options: { scale: 5 } },
            { type: 'MULTI_CHOICE', text: 'Which areas need the most improvement?', required: false, options: { choices: ['Speed', 'Reliability', 'Design', 'Documentation', 'Pricing', 'Support'] } },
            { type: 'LONG_TEXT', text: 'Any other suggestions?', required: false },
        ],
    },
    {
        id: 'market-research',
        title: 'Market Research — Brand Awareness',
        description: 'Measure brand recall, perception, and competitive positioning.',
        category: 'Market Research',
        estimatedMinutes: 5,
        tags: ['brand', 'market'],
        icon: 'BarChart3',
        questions: [
            { type: 'SHORT_TEXT', text: 'When you think of [category], which brands come to mind first?', required: true },
            { type: 'SINGLE_CHOICE', text: 'Have you heard of our brand before today?', required: true, options: { choices: ['Yes', 'No', 'Not sure'] } },
            { type: 'MULTI_CHOICE', text: 'Which words best describe our brand?', required: false, options: { choices: ['Innovative', 'Trustworthy', 'Affordable', 'Premium', 'Friendly', 'Professional', 'Outdated', 'Confusing'] } },
            { type: 'NPS', text: 'How likely are you to recommend our brand?', required: true, options: { scale: 10 } },
        ],
    },
    {
        id: 'event-feedback',
        title: 'Event Feedback',
        description: 'Post-event survey covering content, speakers, and logistics.',
        category: 'Events',
        estimatedMinutes: 3,
        tags: ['event', 'conference'],
        icon: 'Calendar',
        questions: [
            { type: 'RATING', text: 'How would you rate the event overall?', required: true, options: { scale: 5 } },
            { type: 'RATING', text: 'Quality of speakers / sessions', required: true, options: { scale: 5 } },
            { type: 'RATING', text: 'Venue and logistics', required: true, options: { scale: 5 } },
            { type: 'SINGLE_CHOICE', text: 'Would you attend again next year?', required: true, options: { choices: ['Definitely', 'Probably', 'Unsure', 'Probably not', 'Definitely not'] } },
            { type: 'LONG_TEXT', text: 'What would make this event better?', required: false },
        ],
    },
    {
        id: 'academic-research',
        title: 'Academic Research — Demographics + Likert',
        description: 'Standard academic format with demographics and 5-point Likert items.',
        category: 'Academic',
        estimatedMinutes: 6,
        tags: ['academic', 'research', 'likert'],
        icon: 'GraduationCap',
        questions: [
            { type: 'SINGLE_CHOICE', text: 'Age group', required: true, options: { choices: ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'] } },
            { type: 'SINGLE_CHOICE', text: 'Gender', required: true, options: { choices: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] } },
            { type: 'SINGLE_CHOICE', text: 'Highest level of education', required: true, options: { choices: ['High school', 'Bachelor\'s', 'Master\'s', 'Doctorate', 'Other'] } },
            { type: 'RATING', text: 'I am comfortable with new technology.', required: true, options: { scale: 5, labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] } },
            { type: 'RATING', text: 'I trust online platforms with my personal data.', required: true, options: { scale: 5, labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] } },
            { type: 'RATING', text: 'I prefer digital services over traditional ones.', required: true, options: { scale: 5, labels: ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'] } },
        ],
    },
    {
        id: 'website-feedback',
        title: 'Website Feedback',
        description: 'Quick exit-intent survey for website visitors.',
        category: 'Web / UX',
        estimatedMinutes: 1,
        tags: ['website', 'ux'],
        icon: 'Globe',
        questions: [
            { type: 'SINGLE_CHOICE', text: 'What brought you to our site today?', required: true, options: { choices: ['Researching a product', 'Comparing options', 'Ready to buy', 'Looking for support', 'Just browsing'] } },
            { type: 'SINGLE_CHOICE', text: 'Did you find what you were looking for?', required: true, options: { choices: ['Yes', 'Partially', 'No'] } },
            { type: 'LONG_TEXT', text: 'What was missing or confusing?', required: false },
        ],
    },
];
