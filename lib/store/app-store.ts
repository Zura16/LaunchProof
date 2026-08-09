'use client'

import { ALEX_CHEN_SEED, SavedJobData, ProjectPlanData, ApplicationTrackerData, StudentProfileData } from '../services/seed-data.service'

const STORAGE_KEY = 'launchproof_app_data_v1'

export interface AppState {
  savedJobs: SavedJobData[]
  projectPlan: ProjectPlanData
  applications: ApplicationTrackerData[]
  customSkills: string[]
  profile?: StudentProfileData | any
}

export function loadAppState(): AppState {
  if (typeof window === 'undefined') {
    return {
      savedJobs: ALEX_CHEN_SEED.savedJobs,
      projectPlan: ALEX_CHEN_SEED.projectPlan,
      applications: ALEX_CHEN_SEED.applications,
      customSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'Git'],
      profile: ALEX_CHEN_SEED.profile,
    }
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.warn('Failed to load local storage state:', e)
  }

  return {
    savedJobs: ALEX_CHEN_SEED.savedJobs,
    projectPlan: ALEX_CHEN_SEED.projectPlan,
    applications: ALEX_CHEN_SEED.applications,
    customSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Express', 'REST APIs', 'Git'],
    profile: ALEX_CHEN_SEED.profile,
  }
}

export function saveAppState(state: AppState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save state to localStorage:', e)
  }
}
