import { RunnerCosts } from './config'
import type { BillingData, CostBreakdown } from './types'

export class CostCalculator {
  private billingData: BillingData

  constructor(billingData: BillingData) {
    this.billingData = billingData
  }

  private getUsage(key: string): number {
    return this.billingData.minutes_used_breakdown[key] || 0
  }

  private calculateRunnerCost(
    key: string,
    rate: number,
    includedMinutes = 0
  ): { usage: number; cost: number } {
    const usage = this.getUsage(key)
    const billableMinutes = Math.max(0, usage - includedMinutes)
    const cost = billableMinutes * rate
    return { usage, cost }
  }

  calculateCosts(): CostBreakdown {
    const breakdown: CostBreakdown = {}

    breakdown.ubuntu_2_core = this.calculateRunnerCost(
      'UBUNTU',
      RunnerCosts.X64Linux2Core,
      this.billingData.included_minutes
    )
    breakdown.ubuntu_4_core = this.calculateRunnerCost(
      'ubuntu_4_core',
      RunnerCosts.X64Linux4Core
    )
    breakdown.ubuntu_8_core = this.calculateRunnerCost(
      'ubuntu_8_core',
      RunnerCosts.X64Linux8Core
    )
    breakdown.ubuntu_16_core = this.calculateRunnerCost(
      'ubuntu_16_core',
      RunnerCosts.X64Linux16Core
    )
    breakdown.ubuntu_32_core = this.calculateRunnerCost(
      'ubuntu_32_core',
      RunnerCosts.X64Linux32Core
    )
    breakdown.ubuntu_64_core = this.calculateRunnerCost(
      'ubuntu_64_core',
      RunnerCosts.X64Linux64Core
    )

    return breakdown
  }

  calculateTotalCost(breakdown: CostBreakdown): number {
    return Object.values(breakdown).reduce((total, { cost }) => total + cost, 0)
  }
}
