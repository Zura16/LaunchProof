import { ProjectPlanData } from './seed-data.service'

export function generateProjectPlan(targetGaps: string[], targetRepoName: string = 'CampusConnect'): ProjectPlanData {
  const gapsJoined = targetGaps.join(', ') || 'Docker, Redis, CI/CD'

  return {
    id: `plan-${Date.now()}`,
    title: `Upgrade ${targetRepoName}: Production Readiness & Gap Closing`,
    targetRepoName,
    difficulty: 'MEDIUM',
    objective: `Upgrade ${targetRepoName} repository by containerizing services with Docker, adding Redis caching for API optimization, and establishing GitHub Actions CI/CD pipelines to close high-demand evidence gaps.`,
    whyItMatters: `75% of your saved target jobs (including Stripe, Meta, and Databricks) demand ${gapsJoined}. Upgrading an existing project provides stronger proof than starting a toy app from scratch.`,
    skillsTargeted: targetGaps.length > 0 ? targetGaps : ['Docker', 'Redis', 'CI/CD', 'Jest'],
    definitionOfDone: [
      'Multi-stage Dockerfile and docker-compose.yml configuration working locally',
      'Redis cache integration with key invalidation on API write endpoints',
      'GitHub Actions workflow running unit & integration tests automatically on PR',
      'README.md updated with architecture diagram and setup commands',
    ],
    milestones: [
      {
        order: 1,
        title: 'Milestone 1: Containerization & Local Environment',
        description: 'Create multi-stage Dockerfile and docker-compose orchestration for API and database.',
        tasks: [
          { text: 'Write multi-stage Dockerfile for Node.js API service', completed: true },
          { text: 'Create docker-compose.yml linking PostgreSQL & API container', completed: true },
          { text: 'Verify local environment startup with docker-compose up', completed: false },
        ],
      },
      {
        order: 2,
        title: 'Milestone 2: High-Performance Caching Layer',
        description: 'Integrate Redis cache for high-frequency database read queries.',
        tasks: [
          { text: 'Add redis service container to docker-compose.yml', completed: false },
          { text: 'Implement Redis caching middleware for GET /events and GET /user endpoints', completed: false },
          { text: 'Implement cache invalidation logic on write operations', completed: false },
        ],
      },
      {
        order: 3,
        title: 'Milestone 3: Automated Testing & CI/CD Pipeline',
        description: 'Set up GitHub Actions workflow to run test suite on every pull request.',
        tasks: [
          { text: 'Write automated API endpoint tests using Jest & Supertest', completed: false },
          { text: 'Create .github/workflows/ci.yml pipeline for automated test execution', completed: false },
          { text: 'Verify PR status checks pass automatically on GitHub', completed: false },
        ],
      },
      {
        order: 4,
        title: 'Milestone 4: Verification & Résumé Proof Citation',
        description: 'Verify evidence graph update and add concrete citations to résumé.',
        tasks: [
          { text: 'Push clean commits with descriptive commit messages to GitHub', completed: false },
          { text: 'Update LaunchProof evidence graph to verify Docker & Redis citations', completed: false },
        ],
      },
    ],
    expectedEvidence: [
      'Dockerfile & docker-compose.yml in root repository',
      '.github/workflows/ci.yml pipeline file',
      'Redis container connection logic in src/lib/redis.ts',
    ],
  }
}
