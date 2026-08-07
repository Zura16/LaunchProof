export interface StudentProfileData {
  fullName: string
  university: string
  degree: string
  major: string
  graduationDate: string
  academicYear: string
  preferredJobTypes: string[]
  preferredLocations: string[]
  remotePreference: string
  workAuthorization: string
  sponsorshipRequired: boolean
  targetRoleCategories: string[]
  isPublicProfile: boolean
  publicSlug: string
}

export interface SkillEvidenceData {
  id: string
  skillName: string
  category: 'LANGUAGE' | 'FRAMEWORK' | 'DATABASE' | 'CLOUD' | 'DEVOPS' | 'TESTING' | 'CONCEPT' | 'TOOL'
  strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'SELF_REPORTED' | 'MISSING'
  sourceName: string
  sourceType: 'GITHUB_REPOSITORY' | 'RESUME_PROJECT' | 'WORK_EXPERIENCE' | 'COURSEWORK'
  description: string
  citations: string[]
}

export interface MarketInsightData {
  skillName: string
  category: string
  frequencyCount: number
  totalJobs: number
  frequencyPercent: number
  requiredCount: number
  preferredCount: number
  studentEvidence: 'STRONG' | 'MODERATE' | 'WEAK' | 'SELF_REPORTED' | 'MISSING'
  priority: 'CRITICAL_GAP' | 'HIGH_GAP' | 'STRENGTH' | 'SECONDARY'
}

export interface SavedJobData {
  id: string
  company: string
  title: string
  location: string
  url: string
  description: string
  dateSaved: string
  requirements: {
    skillName: string
    type: 'REQUIRED' | 'PREFERRED'
    importance: 'HIGH' | 'MEDIUM' | 'LOW'
    matchingEvidence: 'STRONG' | 'MODERATE' | 'WEAK' | 'MISSING'
  }[]
  eligibility: {
    graduationWindow: string // e.g. "Graduation Dec 2026 - June 2027" -> PASS
    degreeRequired: string
    workAuthorization: string
    sponsorship: string
    status: 'PASS' | 'UNKNOWN' | 'CONFLICT'
  }
  fitRecommendation: 'STRONG_CANDIDATE' | 'APPLY_WHILE_IMPROVING' | 'IMPROVE_FIRST'
  fitReasoning: string
}

export interface RecommendationData {
  id: string
  title: string
  actionType: 'UPGRADE_EXISTING_PROJECT' | 'ADD_TESTS' | 'DEPLOY_APP' | 'NEW_PROJECT'
  targetProject: string
  whyTitle: string
  explanation: string
  gapsSolved: string[]
  impactScore: number
}

export interface ProjectPlanData {
  id: string
  title: string
  targetRepoName: string
  difficulty: 'SMALL' | 'MEDIUM' | 'LARGE'
  objective: string
  whyItMatters: string
  skillsTargeted: string[]
  definitionOfDone: string[]
  expectedEvidence: string[]
  milestones: {
    order: number
    title: string
    description: string
    tasks: { text: string; completed: boolean }[]
  }[]
}

export interface ApplicationTrackerData {
  id: string
  company: string
  title: string
  status: 'SAVED' | 'PREPARING' | 'APPLIED' | 'ONLINE_ASSESSMENT' | 'RECRUITER_SCREEN' | 'TECHNICAL_INTERVIEW' | 'FINAL_INTERVIEW' | 'OFFER' | 'REJECTED'
  appliedDate?: string
  resumeVersion: string
  referralContact?: string
  notes?: string
}

// Global In-Memory Seed Store for Instant Dev Testing
export const ALEX_CHEN_SEED = {
  profile: {
    fullName: 'Alex Chen',
    university: 'UC Berkeley',
    degree: 'Bachelor of Science',
    major: 'Computer Science',
    graduationDate: '2027-05-15',
    academicYear: 'SENIOR',
    preferredJobTypes: ['INTERNSHIP', 'NEW_GRAD'],
    preferredLocations: ['San Francisco, CA', 'New York, NY', 'Remote'],
    remotePreference: 'HYBRID',
    workAuthorization: 'US_CITIZEN',
    sponsorshipRequired: false,
    targetRoleCategories: ['SWE', 'BACKEND', 'FULLSTACK'],
    isPublicProfile: true,
    publicSlug: 'alex-chen',
  } as StudentProfileData,

  evidences: [
    {
      id: 'ev-1',
      skillName: 'REST APIs',
      category: 'CONCEPT',
      strength: 'STRONG',
      sourceName: 'CampusConnect & TechCorp Internship',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'Built 12 production REST endpoints serving 10k daily requests in Express.',
      citations: ['CampusConnect/src/api/events.ts', 'TechCorp Internship Resume Bullet 1'],
    },
    {
      id: 'ev-2',
      skillName: 'React',
      category: 'FRAMEWORK',
      strength: 'STRONG',
      sourceName: 'CampusConnect & ExpenseTracker',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'Multiple active frontend repos using React hooks, state management, and Tailwind.',
      citations: ['CampusConnect/src/App.tsx', 'package.json: "react": "^18.2.0"'],
    },
    {
      id: 'ev-3',
      skillName: 'JavaScript / TypeScript',
      category: 'LANGUAGE',
      strength: 'STRONG',
      sourceName: 'CampusConnect Repository',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'Primary language across 3 GitHub repositories with typed interfaces.',
      citations: ['CampusConnect/src/types/api.ts', 'ExpenseTracker/src/index.js'],
    },
    {
      id: 'ev-4',
      skillName: 'SQL',
      category: 'DATABASE',
      strength: 'MODERATE',
      sourceName: 'ExpenseTracker Repository',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'Used SQLite queries in ExpenseTracker, but schema lacks complex relations and migrations.',
      citations: ['ExpenseTracker/db/init.sql'],
    },
    {
      id: 'ev-5',
      skillName: 'PostgreSQL',
      category: 'DATABASE',
      strength: 'WEAK',
      sourceName: 'CampusConnect Résumé Bullet',
      sourceType: 'RESUME_PROJECT',
      description: 'Claimed in résumé, but database migrations and connection logic are missing in public repository.',
      citations: ['Resume Project Description'],
    },
    {
      id: 'ev-6',
      skillName: 'Automated Testing',
      category: 'TESTING',
      strength: 'MISSING',
      sourceName: 'All Analyzed Repositories',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'No detected test suites (Jest, Mocha, Vitest, PyTest) found across any analyzed repository.',
      citations: ['CampusConnect: zero test files', 'ExpenseTracker: zero test files'],
    },
    {
      id: 'ev-7',
      skillName: 'AWS',
      category: 'CLOUD',
      strength: 'MISSING',
      sourceName: 'All Analyzed Repositories',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'No deployment configurations or cloud infrastructure files detected.',
      citations: ['No serverless.yml, CDK, or AWS config detected'],
    },
    {
      id: 'ev-8',
      skillName: 'Docker',
      category: 'DEVOPS',
      strength: 'MISSING',
      sourceName: 'All Analyzed Repositories',
      sourceType: 'GITHUB_REPOSITORY',
      description: 'No Dockerfile or docker-compose.yml configuration present in any project.',
      citations: ['No Dockerfile found'],
    },
  ] as SkillEvidenceData[],

  marketInsights: [
    {
      skillName: 'REST APIs',
      category: 'CONCEPT',
      frequencyCount: 9,
      totalJobs: 12,
      frequencyPercent: 75,
      requiredCount: 8,
      preferredCount: 1,
      studentEvidence: 'STRONG',
      priority: 'STRENGTH',
    },
    {
      skillName: 'SQL',
      category: 'DATABASE',
      frequencyCount: 8,
      totalJobs: 12,
      frequencyPercent: 67,
      requiredCount: 7,
      preferredCount: 1,
      studentEvidence: 'MODERATE',
      priority: 'SECONDARY',
    },
    {
      skillName: 'Automated Testing',
      category: 'TESTING',
      frequencyCount: 7,
      totalJobs: 12,
      frequencyPercent: 58,
      requiredCount: 7,
      preferredCount: 0,
      studentEvidence: 'MISSING',
      priority: 'CRITICAL_GAP',
    },
    {
      skillName: 'AWS',
      category: 'CLOUD',
      frequencyCount: 6,
      totalJobs: 12,
      frequencyPercent: 50,
      requiredCount: 4,
      preferredCount: 2,
      studentEvidence: 'MISSING',
      priority: 'HIGH_GAP',
    },
    {
      skillName: 'React',
      category: 'FRAMEWORK',
      frequencyCount: 5,
      totalJobs: 12,
      frequencyPercent: 42,
      requiredCount: 4,
      preferredCount: 1,
      studentEvidence: 'STRONG',
      priority: 'STRENGTH',
    },
    {
      skillName: 'Docker',
      category: 'DEVOPS',
      frequencyCount: 4,
      totalJobs: 12,
      frequencyPercent: 33,
      requiredCount: 3,
      preferredCount: 1,
      studentEvidence: 'MISSING',
      priority: 'HIGH_GAP',
    },
  ] as MarketInsightData[],

  savedJobs: [
    {
      id: 'job-1',
      company: 'TechCorp',
      title: 'Software Engineering Intern - Summer 2027',
      location: 'San Francisco, CA (Hybrid)',
      url: 'https://techcorp.jobs/swe-intern',
      description: 'We are seeking a Software Engineering Intern with experience in REST APIs, SQL databases, React, and automated unit testing.',
      dateSaved: '2 days ago',
      requirements: [
        { skillName: 'REST APIs', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'STRONG' },
        { skillName: 'SQL', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'MODERATE' },
        { skillName: 'Automated Testing', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'MISSING' },
        { skillName: 'React', type: 'PREFERRED', importance: 'MEDIUM', matchingEvidence: 'STRONG' },
      ],
      eligibility: {
        graduationWindow: 'Graduating Dec 2026 - May 2028',
        degreeRequired: 'BS Computer Science or related',
        workAuthorization: 'US Work Authorization required',
        sponsorship: 'No sponsorship provided',
        status: 'PASS',
      },
      fitRecommendation: 'APPLY_WHILE_IMPROVING',
      fitReasoning: 'Strong match on REST APIs & React. Automated testing is explicitly required — adding Jest tests to your backend repo will significantly increase your callback rate.',
    },
    {
      id: 'job-2',
      company: 'CloudScale',
      title: 'Backend Engineering Intern',
      location: 'New York, NY (In-Person)',
      url: 'https://cloudscale.com/careers/backend-intern',
      description: 'Join CloudScale to build robust backend microservices using Node.js/Python, PostgreSQL, REST APIs, and Docker containers.',
      dateSaved: '3 days ago',
      requirements: [
        { skillName: 'REST APIs', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'STRONG' },
        { skillName: 'SQL', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'MODERATE' },
        { skillName: 'PostgreSQL', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'WEAK' },
        { skillName: 'Docker', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'MISSING' },
        { skillName: 'AWS', type: 'PREFERRED', importance: 'MEDIUM', matchingEvidence: 'MISSING' },
      ],
      eligibility: {
        graduationWindow: 'Graduation May 2027',
        degreeRequired: 'BS CS',
        workAuthorization: 'US Citizen / Green Card',
        sponsorship: 'Not supported',
        status: 'PASS',
      },
      fitRecommendation: 'IMPROVE_FIRST',
      fitReasoning: 'Requires explicit proof of PostgreSQL migrations and Docker containers. Upgrade CampusConnect before applying.',
    },
    {
      id: 'job-3',
      company: 'DataFlow Systems',
      title: 'Full-Stack Engineering Intern',
      location: 'Remote',
      url: 'https://dataflow.io/jobs/fullstack-intern',
      description: 'Looking for a full-stack student developer skilled in TypeScript, React, RESTful web services, and automated integration testing.',
      dateSaved: '4 days ago',
      requirements: [
        { skillName: 'TypeScript', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'STRONG' },
        { skillName: 'React', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'STRONG' },
        { skillName: 'REST APIs', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'STRONG' },
        { skillName: 'Automated Testing', type: 'REQUIRED', importance: 'HIGH', matchingEvidence: 'MISSING' },
      ],
      eligibility: {
        graduationWindow: '2026-2027 Graduates',
        degreeRequired: 'Computer Science',
        workAuthorization: 'Any US status',
        sponsorship: 'Flexible',
        status: 'PASS',
      },
      fitRecommendation: 'STRONG_CANDIDATE',
      fitReasoning: '3 of 4 core requirements have strong verified evidence in your GitHub repos (TypeScript, React, REST APIs). Apply now!',
    },
  ] as SavedJobData[],

  recommendations: [
    {
      id: 'rec-1',
      title: 'Upgrade CampusConnect with PostgreSQL, Testing, Docker & AWS',
      actionType: 'UPGRADE_EXISTING_PROJECT',
      targetProject: 'CampusConnect',
      whyTitle: 'Closes 3 Highest-Priority Gaps',
      explanation: 'Automated Testing appears in 58% of your saved jobs (7/12) and AWS appears in 50% (6/12). Neither currently exists in your code. Upgrading CampusConnect closes testing, database, and cloud deployment gaps without creating a new repo from scratch.',
      gapsSolved: ['Automated Testing', 'PostgreSQL', 'AWS Cloud Deployment', 'Docker'],
      impactScore: 94,
    },
    {
      id: 'rec-2',
      title: 'Add Jest Unit & Supertest Integration Tests to ExpenseTracker',
      actionType: 'ADD_TESTS',
      targetProject: 'ExpenseTracker',
      whyTitle: 'Rapid 1-Day Evidence Boost',
      explanation: 'Testing is explicitly required in 7 of your 12 target jobs. Adding 5 Jest unit tests and 3 Supertest API route tests will immediately grant STRONG testing evidence.',
      gapsSolved: ['Automated Testing', 'Jest'],
      impactScore: 82,
    },
    {
      id: 'rec-3',
      title: 'Deploy CampusConnect to AWS App Runner / Vercel',
      actionType: 'DEPLOY_APP',
      targetProject: 'CampusConnect',
      whyTitle: 'Cloud Deployment Evidence',
      explanation: 'AWS appears in 6 of your 12 target jobs. Adding live host deployment with health checks creates verifiable proof of production hosting.',
      gapsSolved: ['AWS', 'Cloud Deployment'],
      impactScore: 78,
    },
  ] as RecommendationData[],

  projectPlan: {
    id: 'plan-1',
    title: 'Upgrade CampusConnect with PostgreSQL, Testing, Docker & AWS',
    targetRepoName: 'CampusConnect',
    difficulty: 'MEDIUM',
    objective:
      'Transform CampusConnect from an unverified prototype into an enterprise-grade backend service backed by PostgreSQL schema migrations, comprehensive Jest unit/API tests, Docker containerization, and AWS deployment.',
    whyItMatters:
      'Automated Testing appears in 7 of your 12 saved jobs (58%), PostgreSQL in 3 jobs, AWS in 6 jobs, and Docker in 4 jobs. This single project upgrade addresses your three highest-priority evidence gaps without starting from scratch.',
    skillsTargeted: ['Automated Testing', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
    definitionOfDone: [
      'PostgreSQL schema defined with Prisma migrations & seeds',
      'Jest unit tests covering >80% of core business logic',
      'Supertest API integration tests covering all 12 REST endpoints',
      'Dockerfile and docker-compose setup for local development',
      'GitHub Actions CI pipeline running automated tests on pull request',
      'Application deployed to AWS (App Runner / ECS) with live health check endpoint',
    ],
    expectedEvidence: [
      'Automated Testing: STRONG (Jest & Supertest test suite in repo)',
      'PostgreSQL: STRONG (Prisma migrations & schema in repo)',
      'AWS: STRONG (Live deployed application URL)',
      'Docker: MODERATE (Dockerfile & docker-compose.yml)',
      'CI/CD: STRONG (GitHub Actions workflow file)',
    ],
    milestones: [
      {
        order: 1,
        title: 'Database Schema & PostgreSQL Integration',
        description: 'Replace mock memory/inconsistent storage with PostgreSQL and Prisma schema migrations.',
        tasks: [
          { text: 'Setup PostgreSQL instance (local or Supabase/RDS)', completed: true },
          { text: 'Write Prisma schema with 6 relational models (Users, Events, RSVP, Comments, Topics)', completed: true },
          { text: 'Run initial migration and write seed data script', completed: false },
        ],
      },
      {
        order: 2,
        title: 'Automated Testing Suite (Jest & Supertest)',
        description: 'Add automated unit and integration tests to verify API correctness.',
        tasks: [
          { text: 'Configure Jest and ts-jest for TypeScript backend testing', completed: false },
          { text: 'Write unit tests for authentication logic and permission checks', completed: false },
          { text: 'Write API integration tests using Supertest for all REST routes', completed: false },
        ],
      },
      {
        order: 3,
        title: 'Docker Containerization & CI/CD Pipeline',
        description: 'Create multi-stage Docker build and automate testing on push.',
        tasks: [
          { text: 'Write production multi-stage Dockerfile and docker-compose.yml', completed: false },
          { text: 'Create .github/workflows/test.yml to run Jest on every PR', completed: false },
        ],
      },
      {
        order: 4,
        title: 'AWS Cloud Deployment & Evidence Proof',
        description: 'Deploy application to cloud provider and publish evidence URL.',
        tasks: [
          { text: 'Deploy containerized service to AWS App Runner / AWS ECS', completed: false },
          { text: 'Configure environment variables and database connection pooling', completed: false },
          { text: 'Verify live health endpoint and update GitHub repository README', completed: false },
        ],
      },
    ],
  } as ProjectPlanData,

  applications: [
    {
      id: 'app-1',
      company: 'TechCorp',
      title: 'Software Engineering Intern',
      status: 'PREPARING',
      appliedDate: '2026-08-01',
      resumeVersion: 'Alex_Chen_Backend_v2.pdf',
      notes: 'Adding Jest tests to CampusConnect before submitting application.',
    },
    {
      id: 'app-2',
      company: 'DataFlow Systems',
      title: 'Full-Stack Engineering Intern',
      status: 'APPLIED',
      appliedDate: '2026-08-03',
      resumeVersion: 'Alex_Chen_Fullstack_v1.pdf',
      notes: 'Submitted application via company portal.',
    },
    {
      id: 'app-3',
      company: 'CloudScale',
      title: 'Backend Engineering Intern',
      status: 'SAVED',
      resumeVersion: 'Alex_Chen_Backend_v2.pdf',
      notes: 'Targeting mid-August submission after Docker milestone.',
    },
    {
      id: 'app-4',
      company: 'Apex Labs',
      title: 'Full Stack SWE Intern',
      status: 'RECRUITER_SCREEN',
      appliedDate: '2026-07-28',
      resumeVersion: 'Alex_Chen_Fullstack_v1.pdf',
      referralContact: 'Sarah Jenkins (SWE Lead)',
      notes: 'Recruiter call scheduled for Friday at 2pm.',
    },
  ] as ApplicationTrackerData[],
}
