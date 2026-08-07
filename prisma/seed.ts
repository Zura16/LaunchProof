import { PrismaClient, SkillCategory, EvidenceStrength, EvidenceSourceType, RequirementType, RequirementImportance, ProjectDifficulty } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting LaunchProof seed...')

  // 1. Create or update Seed User (Alex Chen)
  const alex = await prisma.user.upsert({
    where: { email: 'alex.chen@example.edu' },
    update: {},
    create: {
      email: 'alex.chen@example.edu',
      name: 'Alex Chen',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  })

  // 2. Create Student Profile
  await prisma.studentProfile.upsert({
    where: { userId: alex.id },
    update: {},
    create: {
      userId: alex.id,
      fullName: 'Alex Chen',
      university: 'UC Berkeley',
      degree: 'Bachelor of Science',
      major: 'Computer Science',
      graduationDate: new Date('2027-05-15'),
      academicYear: 'SENIOR',
      preferredJobTypes: ['INTERNSHIP', 'NEW_GRAD'],
      preferredLocations: ['San Francisco, CA', 'New York, NY', 'Remote'],
      remotePreference: 'HYBRID',
      workAuthorization: 'US_CITIZEN',
      sponsorshipRequired: false,
      targetRoleCategories: ['SWE', 'BACKEND', 'FULLSTACK'],
      isPublicProfile: true,
      publicSlug: 'alex-chen',
    },
  })

  // 3. Create Canonical Skills & Aliases
  const skillsData = [
    { name: 'JavaScript', slug: 'javascript', category: SkillCategory.LANGUAGE, aliases: ['JS', 'ES6', 'ECMAScript'] },
    { name: 'TypeScript', slug: 'typescript', category: SkillCategory.LANGUAGE, aliases: ['TS'] },
    { name: 'Python', slug: 'python', category: SkillCategory.LANGUAGE, aliases: ['Py', 'Python3'] },
    { name: 'Java', slug: 'java', category: SkillCategory.LANGUAGE, aliases: ['Java 17', 'Java 21'] },
    { name: 'React', slug: 'react', category: SkillCategory.FRAMEWORK, aliases: ['React.js', 'ReactJS'] },
    { name: 'Node.js', slug: 'nodejs', category: SkillCategory.FRAMEWORK, aliases: ['Node', 'NodeJS', 'Express'] },
    { name: 'REST APIs', slug: 'rest-apis', category: SkillCategory.CONCEPT, aliases: ['REST', 'RESTful APIs', 'RESTful Web Services'] },
    { name: 'SQL', slug: 'sql', category: SkillCategory.DATABASE, aliases: ['Relational DB', 'Structured Query Language'] },
    { name: 'PostgreSQL', slug: 'postgresql', category: SkillCategory.DATABASE, aliases: ['Postgres', 'PG'] },
    { name: 'Automated Testing', slug: 'automated-testing', category: SkillCategory.TESTING, aliases: ['Testing', 'Unit Testing', 'Jest', 'Integration Testing'] },
    { name: 'AWS', slug: 'aws', category: SkillCategory.CLOUD, aliases: ['Amazon Web Services', 'Cloud'] },
    { name: 'Docker', slug: 'docker', category: SkillCategory.DEVOPS, aliases: ['Containers', 'Containerization'] },
    { name: 'Git', slug: 'git', category: SkillCategory.TOOL, aliases: ['GitHub', 'Version Control'] },
    { name: 'CI/CD', slug: 'cicd', category: SkillCategory.DEVOPS, aliases: ['GitHub Actions', 'Continuous Integration'] },
  ]

  const createdSkills: Record<string, string> = {}

  for (const s of skillsData) {
    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        name: s.name,
        slug: s.slug,
        category: s.category,
        aliases: {
          create: s.aliases.map((a) => ({ alias: a })),
        },
      },
    })
    createdSkills[s.slug] = skill.id
  }

  // 4. Create Resume Data
  const resume = await prisma.resume.create({
    data: {
      userId: alex.id,
      fileName: 'Alex_Chen_SWE_Resume.pdf',
      fileUrl: '/uploads/resumes/alex_chen.pdf',
      rawText: 'Alex Chen | UC Berkeley CS Senior | Full-Stack Developer | React, Node.js, Express, REST APIs',
      parsedContent: {
        skills: ['React', 'JavaScript', 'TypeScript', 'Node.js', 'Express', 'REST APIs', 'SQL', 'Git'],
      },
      experiences: {
        create: [
          {
            company: 'TechCorp Solutions',
            role: 'Software Engineering Intern',
            startDate: 'Jun 2025',
            endDate: 'Aug 2025',
            description: 'Developed internal tools and backend microservices using Node.js and REST APIs.',
            bullets: [
              'Built 12 high-throughput REST API endpoints in Express serving 10k daily requests.',
              'Collaborated with senior engineers to optimize PostgreSQL query performance by 25%.',
            ],
            skillsUsed: ['Node.js', 'REST APIs', 'SQL', 'Git'],
          },
        ],
      },
      projects: {
        create: [
          {
            title: 'CampusConnect',
            role: 'Creator & Lead Developer',
            description: 'A full-stack campus student event and discussion platform built with React, Node.js, and PostgreSQL.',
            bullets: [
              'Architected full-stack React frontend and Express backend connected to a relational database.',
              'Designed authentication using JWT tokens and implemented real-time event updates.',
            ],
            technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
            repoUrl: 'https://github.com/alexchen/CampusConnect',
          },
          {
            title: 'ExpenseTracker',
            role: 'Developer',
            description: 'Personal finance tracking web application.',
            bullets: [
              'Created interactive spending dashboards using React and Express.',
              'Integrated SQLite local storage with structured schema design.',
            ],
            technologies: ['React', 'JavaScript', 'Node.js', 'SQL'],
            repoUrl: 'https://github.com/alexchen/ExpenseTracker',
          },
        ],
      },
    },
  })

  // 5. Create GitHub Account & Repositories
  const ghAccount = await prisma.gitHubAccount.upsert({
    where: { userId: alex.id },
    update: {},
    create: {
      userId: alex.id,
      username: 'alexchen',
      avatarUrl: 'https://avatars.githubusercontent.com/u/10101010?v=4',
      profileUrl: 'https://github.com/alexchen',
    },
  })

  const repo1 = await prisma.gitHubRepository.create({
    data: {
      githubAccountId: ghAccount.id,
      name: 'CampusConnect',
      fullName: 'alexchen/CampusConnect',
      description: 'Campus student event and discussion platform',
      stars: 18,
      forks: 4,
      languages: { TypeScript: 24500, CSS: 4200, HTML: 1800 },
      primaryLanguage: 'TypeScript',
      topics: ['react', 'express', 'postgresql', 'rest-api'],
      repoUrl: 'https://github.com/alexchen/CampusConnect',
      analysisResult: {
        hasTests: false,
        hasDocker: false,
        hasCI: false,
        detectedDependencies: ['react', 'express', 'pg', 'typescript'],
      },
    },
  })

  const repo2 = await prisma.gitHubRepository.create({
    data: {
      githubAccountId: ghAccount.id,
      name: 'ExpenseTracker',
      fullName: 'alexchen/ExpenseTracker',
      description: 'Personal expense tracking dashboard',
      stars: 9,
      forks: 1,
      languages: { JavaScript: 12000, CSS: 3100 },
      primaryLanguage: 'JavaScript',
      topics: ['react', 'nodejs', 'sqlite'],
      repoUrl: 'https://github.com/alexchen/ExpenseTracker',
      analysisResult: {
        hasTests: false,
        hasDocker: false,
        hasCI: false,
        detectedDependencies: ['react', 'express', 'sqlite3'],
      },
    },
  })

  const repo3 = await prisma.gitHubRepository.create({
    data: {
      githubAccountId: ghAccount.id,
      name: 'StudyBuddy',
      fullName: 'alexchen/StudyBuddy',
      description: 'Real-time collaborative study session matching app',
      stars: 5,
      forks: 0,
      languages: { TypeScript: 8900 },
      primaryLanguage: 'TypeScript',
      topics: ['react', 'firebase'],
      repoUrl: 'https://github.com/alexchen/StudyBuddy',
      analysisResult: {
        hasTests: false,
        hasDocker: false,
        hasCI: false,
        detectedDependencies: ['react', 'firebase'],
      },
    },
  })

  // 6. Create Student Evidence Graph
  const evidences = [
    {
      skillSlug: 'react',
      strength: EvidenceStrength.STRONG,
      sourceType: EvidenceSourceType.GITHUB_REPOSITORY,
      sourceId: repo1.id,
      description: 'Multiple active repositories (CampusConnect, ExpenseTracker) using React components and hooks.',
      metadata: { citations: ['CampusConnect/src/App.tsx', 'package.json: "react": "^18.2.0"'] },
    },
    {
      skillSlug: 'javascript',
      strength: EvidenceStrength.STRONG,
      sourceType: EvidenceSourceType.GITHUB_REPOSITORY,
      sourceId: repo2.id,
      description: 'Extensive codebase in ExpenseTracker and CampusConnect.',
      metadata: { citations: ['ExpenseTracker/src/index.js'] },
    },
    {
      skillSlug: 'typescript',
      strength: EvidenceStrength.STRONG,
      sourceType: EvidenceSourceType.GITHUB_REPOSITORY,
      sourceId: repo1.id,
      description: 'Primary language across CampusConnect repository with typed interfaces.',
      metadata: { citations: ['CampusConnect/src/types/api.ts'] },
    },
    {
      skillSlug: 'rest-apis',
      strength: EvidenceStrength.STRONG,
      sourceType: EvidenceSourceType.RESUME_PROJECT,
      sourceId: resume.id,
      description: 'Built 12 Express REST endpoints during internship and implemented REST handlers in CampusConnect.',
      metadata: { citations: ['TechCorp Internship Bullet 1', 'CampusConnect/src/api/events.ts'] },
    },
    {
      skillSlug: 'sql',
      strength: EvidenceStrength.MODERATE,
      sourceType: EvidenceSourceType.GITHUB_REPOSITORY,
      sourceId: repo2.id,
      description: 'Used SQLite queries in ExpenseTracker, but schema lacks complex relations and migrations.',
      metadata: { citations: ['ExpenseTracker/db/init.sql'] },
    },
    {
      skillSlug: 'postgresql',
      strength: EvidenceStrength.WEAK,
      sourceType: EvidenceSourceType.RESUME_PROJECT,
      sourceId: resume.id,
      description: 'Claimed in CampusConnect description, but database schema files and migrations are missing in repo.',
      metadata: { citations: ['Resume Project description'] },
    },
  ]

  for (const ev of evidences) {
    const skillId = createdSkills[ev.skillSlug]
    if (skillId) {
      await prisma.evidence.create({
        data: {
          userId: alex.id,
          skillId,
          sourceType: ev.sourceType,
          sourceId: ev.sourceId,
          strength: ev.strength,
          description: ev.description,
          metadata: ev.metadata,
        },
      })

      await prisma.studentSkill.upsert({
        where: { userId_skillId: { userId: alex.id, skillId } },
        update: { highestStrength: ev.strength },
        create: {
          userId: alex.id,
          skillId,
          highestStrength: ev.strength,
        },
      })
    }
  }

  // 7. Seed 12 Target Saved Jobs
  const jobPostingsData = [
    {
      company: 'TechCorp',
      title: 'Software Engineering Intern - Summer 2027',
      location: 'San Francisco, CA (Hybrid)',
      url: 'https://techcorp.jobs/swe-intern',
      description: 'We are seeking a Software Engineering Intern with experience in REST APIs, SQL databases, React, and automated unit testing.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'react', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'CloudScale',
      title: 'Backend Engineering Intern',
      location: 'New York, NY (In-Person)',
      url: 'https://cloudscale.com/careers/backend-intern',
      description: 'Join CloudScale to build robust backend microservices using Node.js/Python, PostgreSQL, REST APIs, and Docker containers.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'postgresql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'docker', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'DataFlow Systems',
      title: 'Full-Stack Engineering Intern',
      location: 'Remote',
      url: 'https://dataflow.io/jobs/fullstack-intern',
      description: 'Looking for a full-stack student developer skilled in TypeScript, React, RESTful web services, and automated integration testing.',
      reqs: [
        { slug: 'typescript', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'react', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'NextGen Apps',
      title: 'Software Engineer - New Grad 2027',
      location: 'San Jose, CA',
      url: 'https://nextgen.com/careers/new-grad-swe',
      description: 'Building modern cloud-native web apps. Requirements: REST APIs, SQL, AWS, automated testing, and CI/CD pipelines.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'cicd', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'FinTech Solutions',
      title: 'Backend Systems Intern',
      location: 'New York, NY',
      url: 'https://fintechsol.com/internships/backend',
      description: 'Focus on transactional security, database reliability, and automated Jest test suites. Relational DB experience required.',
      reqs: [
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'postgresql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'Apex Labs',
      title: 'Full Stack SWE Intern',
      location: 'San Francisco, CA',
      url: 'https://apexlabs.ai/careers/intern',
      description: 'Work across the stack with React, Node.js, REST APIs, and Cloud Infrastructure on AWS.',
      reqs: [
        { slug: 'react', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'docker', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'WebPulse',
      title: 'Frontend / Fullstack Developer Intern',
      location: 'Remote',
      url: 'https://webpulse.dev/jobs/frontend-intern',
      description: 'Craft beautiful responsive UIs in React/TypeScript connected to REST APIs with automated Jest unit testing.',
      reqs: [
        { slug: 'react', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'typescript', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
      ],
    },
    {
      company: 'MicroSystems',
      title: 'Software Engineering Intern',
      location: 'Austin, TX',
      url: 'https://microsystems.com/careers/intern-swe',
      description: 'Develop server backend APIs and relational database models. Required: SQL, REST APIs, Docker.',
      reqs: [
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'docker', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'DevStream',
      title: 'Backend Engineering Intern',
      location: 'Remote',
      url: 'https://devstream.io/jobs/backend-intern',
      description: 'Build robust event-driven backend architectures with Node.js, SQL, AWS, and unit test suites.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'aws', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
      ],
    },
    {
      company: 'CyberShield',
      title: 'Software Engineering Intern',
      location: 'Seattle, WA',
      url: 'https://cybershield.sec/careers/swe-intern',
      description: 'Focus on secure API development and containerized services using Docker and automated integration tests.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'docker', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'ScaleAI',
      title: 'Infrastructure & Software Intern',
      location: 'San Francisco, CA',
      url: 'https://scale.com/careers/infra-intern',
      description: 'Deploying high-availability systems on AWS cloud with Terraform, Docker, and SQL databases.',
      reqs: [
        { slug: 'aws', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'docker', type: RequirementType.PREFERRED, importance: RequirementImportance.MEDIUM },
      ],
    },
    {
      company: 'Platform.io',
      title: 'Backend Engineering Intern',
      location: 'Remote',
      url: 'https://platform.io/jobs/backend-intern',
      description: 'Designing RESTful web services and PostgreSQL schemas with Jest integration tests.',
      reqs: [
        { slug: 'rest-apis', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'postgresql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'sql', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
        { slug: 'automated-testing', type: RequirementType.REQUIRED, importance: RequirementImportance.HIGH },
      ],
    },
  ]

  for (const job of jobPostingsData) {
    const posting = await prisma.jobPosting.create({
      data: {
        company: job.company,
        title: job.title,
        location: job.location,
        url: job.url,
        description: job.description,
        requirements: {
          create: job.reqs.map((r) => ({
            skillId: createdSkills[r.slug],
            type: r.type,
            importance: r.importance,
            rawMention: r.slug,
          })),
        },
      },
    })

    await prisma.savedJob.create({
      data: {
        userId: alex.id,
        jobPostingId: posting.id,
      },
    })
  }

  // 8. Create Flagship Recommended Project Plan (Upgrade CampusConnect)
  await prisma.projectPlan.create({
    data: {
      userId: alex.id,
      title: 'Upgrade CampusConnect with PostgreSQL, Testing, Docker & AWS',
      targetRepoName: 'CampusConnect',
      difficulty: ProjectDifficulty.MEDIUM,
      objective:
        'Transform CampusConnect from an unverified prototype into an enterprise-grade backend service backed by PostgreSQL schema migrations, comprehensive Jest unit/API tests, Docker containerization, and AWS deployment.',
      whyItMatters:
        'Automated Testing appears in 7 of your 12 saved jobs (58%), PostgreSQL appears in 3 jobs, AWS in 6 jobs, and Docker in 4 jobs. This single project upgrade addresses your three highest-priority evidence gaps without starting from scratch.',
      skillsTargeted: ['Automated Testing', 'PostgreSQL', 'AWS', 'Docker', 'CI/CD'],
      definitionOfDone: [
        'PostgreSQL schema defined with Prisma migrations & seeds',
        'Jest unit tests covering >80% of core business logic',
        'Supertest API integration tests covering all 12 REST endpoints',
        'Dockerfile and docker-compose setup for local development',
        'GitHub Actions CI pipeline running automated tests on pull request',
        'Application deployed to AWS (App Runner or EC2) with live health check endpoint',
      ],
      expectedEvidence: [
        'Automated Testing: STRONG (Jest & Supertest test suite in repo)',
        'PostgreSQL: STRONG (Prisma migrations & schema in repo)',
        'AWS: STRONG (Live deployed application URL)',
        'Docker: MODERATE (Dockerfile & docker-compose.yml)',
        'CI/CD: STRONG (GitHub Actions workflow file)',
      ],
      status: 'PLANNED',
      milestones: {
        create: [
          {
            order: 1,
            title: 'Database Schema & PostgreSQL Integration',
            description: 'Replace mock memory/inconsistent storage with PostgreSQL and Prisma schema migrations.',
            tasks: [
              'Setup PostgreSQL instance (local or Supabase/RDS)',
              'Write Prisma schema with 6 relational models (Users, Events, RSVP, Comments, Topics)',
              'Run initial migration and write seed data script',
            ],
          },
          {
            order: 2,
            title: 'Automated Testing Suite (Jest & Supertest)',
            description: 'Add automated unit and integration tests to verify API correctness.',
            tasks: [
              'Configure Jest and ts-jest for TypeScript backend testing',
              'Write unit tests for authentication logic and permission checks',
              'Write API integration tests using Supertest for all REST routes',
            ],
          },
          {
            order: 3,
            title: 'Docker Containerization & CI/CD Pipeline',
            description: 'Create multi-stage Docker build and automate testing on push.',
            tasks: [
              'Write production multi-stage Dockerfile and docker-compose.yml',
              'Create .github/workflows/test.yml to run Jest on every PR',
            ],
          },
          {
            order: 4,
            title: 'AWS Cloud Deployment & Evidence Proof',
            description: 'Deploy application to cloud provider and publish evidence URL.',
            tasks: [
              'Deploy containerized service to AWS App Runner / AWS ECS',
              'Configure environment variables and database connection pooling',
              'Verify live health endpoint and update GitHub repository README',
            ],
          },
        ],
      },
    },
  })

  console.log('✅ LaunchProof seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
