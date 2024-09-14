export interface RunnerUsage {
  [key: string]: number
}

export interface BillingData {
  included_minutes: number
  minutes_used_breakdown: RunnerUsage
}

export interface RunnerCost {
  usage: number
  cost: number
}

export interface CostBreakdown {
  [key: string]: RunnerCost
}
