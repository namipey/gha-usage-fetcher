import * as core from '@actions/core'
import { RequestError } from '@octokit/request-error'
import { CostCalculator } from '../src/calc'
import { GithubService } from '../src/github'
import { run } from '../src/main'

jest.mock('@actions/core')
jest.mock('../src/github')
jest.mock('../src/calc')

describe('run()', () => {
  let mockGetInput: jest.MockedFunction<typeof core.getInput>
  let mockSetOutput: jest.MockedFunction<typeof core.setOutput>
  let mockInfo: jest.MockedFunction<typeof core.info>
  let mockSetFailed: jest.MockedFunction<typeof core.setFailed>

  beforeEach(() => {
    jest.resetAllMocks()
    mockGetInput = core.getInput as jest.MockedFunction<typeof core.getInput>
    mockSetOutput = core.setOutput as jest.MockedFunction<typeof core.setOutput>
    mockInfo = core.info as jest.MockedFunction<typeof core.info>
    mockSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>
  })

  it('should calculate and set outputs correctly', async () => {
    const mockBillingData = {
      included_minutes: 2000,
      minutes_used_breakdown: {
        UBUNTU: 5000,
        MACOS: 0,
        WINDOWS: 0,
        ubuntu_4_core: 1000,
        ubuntu_8_core: 1000,
        ubuntu_16_core: 1000,
        ubuntu_32_core: 1000,
        ubuntu_64_core: 1000
      }
    }
    const mockCostBreakdown = {
      ubuntu_2_core: { usage: 5000, cost: 24 },
      ubuntu_4_core: { usage: 1000, cost: 16 },
      ubuntu_8_core: { usage: 1000, cost: 32 },
      ubuntu_16_core: { usage: 1000, cost: 64 },
      ubuntu_32_core: { usage: 1000, cost: 128 },
      ubuntu_64_core: { usage: 1000, cost: 256 }
    }
    const mockTotalCost = 520

    mockGetInput.mockImplementation((name: string) => {
      if (name === 'github_token') return 'mock_token'
      if (name === 'org_name') return 'mock_org'
      return ''
    })

    // set mock response
    ;(GithubService.prototype.getBillingData as jest.Mock).mockResolvedValue(
      mockBillingData
    )
    ;(CostCalculator.prototype.calculateCosts as jest.Mock).mockReturnValue(
      mockCostBreakdown
    )
    ;(CostCalculator.prototype.calculateTotalCost as jest.Mock).mockReturnValue(
      mockTotalCost
    )

    await run()

    expect(mockGetInput).toHaveBeenCalledWith('github_token')
    expect(mockGetInput).toHaveBeenCalledWith('org_name')
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_2_core_usage', 5000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_2_core_cost', 24)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_4_core_usage', 1000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_4_core_cost', 16)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_8_core_usage', 1000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_8_core_cost', 32)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_16_core_usage', 1000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_16_core_cost', 64)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_32_core_usage', 1000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_32_core_cost', 128)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_64_core_usage', 1000)
    expect(mockSetOutput).toHaveBeenCalledWith('ubuntu_64_core_cost', 256)
    expect(mockSetOutput).toHaveBeenCalledWith('total_cost', 520)
  })

  it('should handle RequestError and set failed status with JSON error', async () => {
    const mockRequestError = new RequestError('Test request error', 400, {
      response: {
        url: 'https://api.github.com/orgs/mock_org/billing/actions',
        headers: {
          'x-accepted-github-permissions': 'admin:org=read'
        },
        status: 403,
        data: {
          message: 'Test request error',
          documentation_url:
            'https://docs.github.com/ja/rest/billing/billing#get-github-actions-billing-for-an-organization'
        }
      },
      request: {
        method: 'GET',
        url: 'https://api.github.com/orgs/mock_org/billing/actions',
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      }
    })
    mockGetInput.mockImplementation(() => {
      throw mockRequestError
    })

    await run()

    expect(mockSetFailed).toHaveBeenCalledWith(
      `error: ${JSON.stringify(mockRequestError.message)}`
    )
    expect(mockInfo).toHaveBeenCalledWith(
      `You need to set permission: [${mockRequestError.response?.headers['x-accepted-github-permissions']}] for the provided token.`
    )
  })
})
