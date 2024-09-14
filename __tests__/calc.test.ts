// calc.test.ts
import { CostCalculator } from '../src/calc'
import { RunnerCosts } from '../src/config'
import type { BillingData, CostBreakdown } from '../src/types'

describe('CostCalculator', () => {
  let billingData: BillingData
  let calculator: CostCalculator

  beforeEach(() => {
    billingData = {
      included_minutes: 3000,
      minutes_used_breakdown: {
        UBUNTU: 5000,
        ubuntu_4_core: 1000,
        ubuntu_8_core: 1000,
        ubuntu_16_core: 1000,
        ubuntu_32_core: 1000,
        ubuntu_64_core: 1000
      }
    }
    calculator = new CostCalculator(billingData)
  })

  describe('calculateCosts', () => {
    it('should calculate costs correctly for all runner types', () => {
      const result = calculator.calculateCosts()

      expect(result).toEqual({
        ubuntu_2_core: {
          usage: 5000,
          cost: (5000 - 3000) * RunnerCosts.X64Linux2Core
        },
        ubuntu_4_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux4Core },
        ubuntu_8_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux8Core },
        ubuntu_16_core: {
          usage: 1000,
          cost: 1000 * RunnerCosts.X64Linux16Core
        },
        ubuntu_32_core: {
          usage: 1000,
          cost: 1000 * RunnerCosts.X64Linux32Core
        },
        ubuntu_64_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux64Core }
      })
    })

    it('should handle missing usage data', () => {
      billingData.minutes_used_breakdown = { UBUNTU: 4000 }
      calculator = new CostCalculator(billingData)
      const result = calculator.calculateCosts()

      expect(result).toEqual({
        ubuntu_2_core: {
          usage: 4000,
          cost: (4000 - 3000) * RunnerCosts.X64Linux2Core
        },
        ubuntu_4_core: { usage: 0, cost: 0 },
        ubuntu_8_core: { usage: 0, cost: 0 },
        ubuntu_16_core: { usage: 0, cost: 0 },
        ubuntu_32_core: { usage: 0, cost: 0 },
        ubuntu_64_core: { usage: 0, cost: 0 }
      })
    })

    it('should handle usage less than included minutes', () => {
      billingData.minutes_used_breakdown = { UBUNTU: 2000 }
      calculator = new CostCalculator(billingData)
      const result = calculator.calculateCosts()

      expect(result.ubuntu_2_core).toEqual({ usage: 2000, cost: 0 })
    })
  })

  describe('calculateTotalCost', () => {
    it('should calculate total cost correctly', () => {
      const breakdown: CostBreakdown = {
        ubuntu_2_core: {
          usage: 5000,
          cost: (5000 - 3000) * RunnerCosts.X64Linux2Core
        },
        ubuntu_4_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux4Core },
        ubuntu_8_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux8Core },
        ubuntu_16_core: {
          usage: 1000,
          cost: 1000 * RunnerCosts.X64Linux16Core
        },
        ubuntu_32_core: {
          usage: 1000,
          cost: 1000 * RunnerCosts.X64Linux32Core
        },
        ubuntu_64_core: { usage: 1000, cost: 1000 * RunnerCosts.X64Linux64Core }
      }

      const totalCost = calculator.calculateTotalCost(breakdown)
      expect(totalCost).toBe(512)
    })

    it('should return 0 for empty breakdown', () => {
      const totalCost = calculator.calculateTotalCost({})
      expect(totalCost).toBe(0)
    })
  })
})
