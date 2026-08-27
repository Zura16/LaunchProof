import { PrismaClient, SkillCategory, EvidenceStrength, EvidenceSourceType, RequirementType, RequirementImportance } from '@prisma/client'
import { recomputeSkillGaps } from '@/lib/services/gap-analysis.service'
import { analyzeRepoSnapshot } from '@/lib/services/repo-evidence.service'
import { persistRepoAnalysis } from '@/lib/services/github-sync.service'
import { persistResumeEvidence } from '@/lib/services/resume-analysis.service'
import { syncStudentSkills } from '@/lib/services/evidence-sync.service'
import { regenerateRecommendations } from '@/lib/services/recommendation-engine.service'
import { generateProjectPlanFromRecommendation } from '@/lib/services/project-plan-generator.service'
import { JOB_SOURCES } from '@/lib/jobfeed/sources'
import type { RepoSnapshot } from '@/lib/github/types'

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
      onboardingCompletedAt: new Date(),
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
  // parsedContent mirrors the structure the résumé analysis service produces,
  // so the demo account shows a fully parsed résumé without needing an API key.
  const alexResumeParsed = {
    education: [
      {
        institution: 'UC Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationDate: 'May 2027',
        gpa: '3.7',
      },
    ],
    experiences: [
      {
        company: 'TechCorp Solutions',
        role: 'Software Engineering Intern',
        startDate: 'Jun 2025',
        endDate: 'Aug 2025',
        bullets: [
          'Built 12 high-throughput REST API endpoints in Express serving 10k daily requests.',
          'Collaborated with senior engineers to optimize PostgreSQL query performance by 25%.',
        ],
        skillsUsed: ['Node.js', 'REST APIs', 'SQL', 'Git'],
      },
    ],
    projects: [
      {
        title: 'CampusConnect',
        role: 'Creator & Lead Developer',
        description:
          'A full-stack campus student event and discussion platform built with React, Node.js, and PostgreSQL.',
        bullets: [
          'Architected full-stack React frontend and Express backend connected to a relational database.',
          'Designed authentication using JWT tokens and implemented real-time event updates.',
        ],
        technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'REST APIs'],
        repoUrl: 'https://github.com/alexchen/CampusConnect',
        liveUrl: '',
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
        liveUrl: '',
      },
    ],
    listedSkills: ['Git', 'Express'],
    certifications: [],
  }

  const resume = await prisma.resume.create({
    data: {
      userId: alex.id,
      fileName: 'Alex_Chen_SWE_Resume.pdf',
      fileUrl: '/uploads/resumes/alex_chen.pdf',
      rawText: 'Alex Chen | UC Berkeley CS Senior | Full-Stack Developer | React, Node.js, Express, REST APIs',
      parsedContent: alexResumeParsed,
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

  // Realistic repository snapshots for the demo account. These are run
  // through the SAME deterministic analyzer as a live GitHub sync, so the
  // demo's evidence is genuinely derived rather than asserted. The shape of
  // these fixtures is what produces the flagship "Upgrade CampusConnect"
  // story: strong frontend/API evidence, thin database evidence, and no
  // testing, container, CI, or cloud evidence anywhere.
  const repoSnapshots: RepoSnapshot[] = [
    {
      name: 'CampusConnect',
      fullName: 'alexchen/CampusConnect',
      description: 'Campus student event and discussion platform',
      isFork: false,
      stars: 18,
      forks: 4,
      topics: ['react', 'express', 'postgresql'],
      repoUrl: 'https://github.com/alexchen/CampusConnect',
      defaultBranch: 'main',
      primaryLanguage: 'TypeScript',
      languages: { TypeScript: 24500, CSS: 4200, HTML: 1800 },
      filePaths: [
        'package.json',
        'src/App.tsx',
        'src/components/EventCard.tsx',
        'src/components/DiscussionThread.tsx',
        'src/types/api.ts',
        'src/api/events.ts',
        'server/index.ts',
        'server/routes/events.ts',
        'server/routes/auth.ts',
        'README.md',
      ],
      manifests: {
        'package.json': JSON.stringify({
          name: 'campusconnect',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            express: '^4.18.2',
            pg: '^8.11.0',
            jsonwebtoken: '^9.0.0',
          },
          devDependencies: { typescript: '^5.2.0' },
        }),
      },
      readme: '# CampusConnect\n\nA full-stack campus events platform built with React, Express, and PostgreSQL.',
    },
    {
      name: 'ExpenseTracker',
      fullName: 'alexchen/ExpenseTracker',
      description: 'Personal expense tracking dashboard',
      isFork: false,
      stars: 9,
      forks: 1,
      topics: ['react', 'nodejs'],
      repoUrl: 'https://github.com/alexchen/ExpenseTracker',
      defaultBranch: 'main',
      primaryLanguage: 'JavaScript',
      languages: { JavaScript: 22000, CSS: 3100 },
      filePaths: [
        'package.json',
        'src/index.js',
        'src/App.jsx',
        'src/components/SpendingChart.jsx',
        'server/api.js',
        'README.md',
      ],
      manifests: {
        'package.json': JSON.stringify({
          name: 'expensetracker',
          dependencies: {
            react: '^18.2.0',
            'react-dom': '^18.2.0',
            express: '^4.18.2',
            sqlite3: '^5.1.6',
          },
        }),
      },
      readme: '# ExpenseTracker\n\nPersonal finance dashboard.',
    },
    {
      name: 'StudyBuddy',
      fullName: 'alexchen/StudyBuddy',
      description: 'Real-time collaborative study session matching app',
      isFork: false,
      stars: 5,
      forks: 0,
      topics: ['react'],
      repoUrl: 'https://github.com/alexchen/StudyBuddy',
      defaultBranch: 'main',
      primaryLanguage: 'TypeScript',
      languages: { TypeScript: 8900 },
      filePaths: ['package.json', 'src/App.tsx', 'src/match.ts', 'README.md'],
      manifests: {
        'package.json': JSON.stringify({
          name: 'studybuddy',
          dependencies: { react: '^18.2.0', firebase: '^10.1.0' },
          devDependencies: { typescript: '^5.2.0' },
        }),
      },
      readme: '# StudyBuddy',
    },
  ]

  let detectedTotal = 0
  for (const snapshot of repoSnapshots) {
    const analysis = analyzeRepoSnapshot(snapshot)
    await persistRepoAnalysis(alex.id, ghAccount.id, snapshot, analysis)
    detectedTotal += analysis.detected.length
  }
  console.log(`   Derived ${detectedTotal} evidence items from ${repoSnapshots.length} repositories.`)

  // 6. Derive résumé evidence through the same path the live analyzer uses.
  await persistResumeEvidence(alex.id, resume.id, alexResumeParsed)


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

  const savedJobsByCompany: Record<string, string> = {}

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

    const savedJob = await prisma.savedJob.create({
      data: {
        userId: alex.id,
        jobPostingId: posting.id,
      },
    })

    savedJobsByCompany[job.company] = savedJob.id
  }

  // 7b. Seed Applications across the funnel, including a closed one, so the
  // tracker's filters and outcome fields all have something to show.
  const applicationsData = [
    {
      company: 'TechCorp',
      status: 'APPLIED' as const,
      appliedDate: new Date('2026-08-10'),
      referralContact: 'Priya N. (family friend)',
    },
    {
      company: 'Apex Labs',
      status: 'TECHNICAL_INTERVIEW' as const,
      appliedDate: new Date('2026-08-05'),
      nextInterviewDate: new Date('2026-09-02'),
      recruiterContact: 'jordan.lee@apexlabs.ai',
      notes: 'Round 2 is a systems design conversation. Review REST pagination and indexing.',
    },
    {
      company: 'WebPulse',
      status: 'RECRUITER_SCREEN' as const,
      appliedDate: new Date('2026-08-15'),
      nextInterviewDate: new Date('2026-08-30'),
    },
    { company: 'ScaleAI', status: 'PREPARING' as const },
    {
      company: 'CyberShield',
      status: 'REJECTED' as const,
      appliedDate: new Date('2026-07-20'),
      closedAt: new Date('2026-08-08'),
      rejectionStage: 'Online assessment',
      outcomeNote: 'Timed out on the testing question — reinforces automated testing as the top gap to close.',
    },
  ]

  for (const appData of applicationsData) {
    const savedJobId = savedJobsByCompany[appData.company]
    if (savedJobId) {
      await prisma.application.create({
        data: {
          userId: alex.id,
          savedJobId,
          status: appData.status,
          appliedDate: appData.appliedDate ?? null,
          nextInterviewDate: appData.nextInterviewDate ?? null,
          closedAt: appData.closedAt ?? null,
          referralContact: appData.referralContact ?? null,
          recruiterContact: appData.recruiterContact ?? null,
          notes: appData.notes ?? null,
          outcomeNote: appData.outcomeNote ?? null,
          rejectionStage: appData.rejectionStage ?? null,
          resumeId: resume.id,
        },
      })
    }
  }

  // 8. Roll evidence up into StudentSkill, then derive gaps and
  // recommendations through the real engines. Nothing below is asserted —
  // the demo's recommendations are computed from the seeded jobs, repos,
  // and résumé exactly as they would be for a real user.
  await syncStudentSkills(alex.id)
  const gaps = await recomputeSkillGaps(alex.id)
  console.log(`   Computed ${gaps.length} skill gaps from seeded data.`)

  const recommendations = await regenerateRecommendations(alex.id)
  console.log(`   Generated ${recommendations.length} recommendations.`)
  for (const r of recommendations) {
    console.log(`     - [${r.impact}] ${r.title}`)
  }

  // 9. Turn the top recommendation into a project plan so the demo shows a
  // complete flow from gap to actionable, checkable work.
  const top = await prisma.recommendation.findFirst({
    where: { userId: alex.id, status: 'ACTIVE', type: { not: 'APPLY_NOW' } },
    orderBy: { priorityScore: 'desc' },
  })
  if (top) {
    const plan = await generateProjectPlanFromRecommendation(top.id, alex.id)
    console.log(`   Created project plan: ${plan.title}`)
  }

  // 10. Seed the job-feed sources (see lib/jobfeed/sources.ts).
  for (const src of JOB_SOURCES) {
    await prisma.jobSource.upsert({
      where: { provider_boardToken: { provider: src.provider, boardToken: src.boardToken } },
      update: { companyName: src.companyName, isActive: true },
      create: src,
    })
  }
  console.log(`   Seeded ${JOB_SOURCES.length} job-feed sources.`)

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
