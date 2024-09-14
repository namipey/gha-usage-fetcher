import * as core from '@actions/core'
import { RequestError } from '@octokit/request-error'
import { CostCalculator } from './calc'
import { GithubService } from './github'

export async function run(): Promise<void> {
  try {
    const ghToken: string = core.getInput('github_token')
    const orgName: string = core.getInput('org_name')

    const githubService = new GithubService(ghToken)
    const billingData = await githubService.getBillingData(orgName)

    core.info(`billingData: ${JSON.stringify(billingData)}`)

    const calculator = new CostCalculator(billingData)
    const costBreakdown = calculator.calculateCosts()
    core.info(`costBreakdown: ${JSON.stringify(costBreakdown)}`)
    const totalCost = calculator.calculateTotalCost(costBreakdown)
    core.info(`totalCost: ${totalCost}`)

    for (const [key, { usage, cost }] of Object.entries(costBreakdown)) {
      core.setOutput(`${key}_usage`, usage)
      core.setOutput(`${key}_cost`, cost)
    }

    core.setOutput('total_cost', totalCost)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
    if (error instanceof RequestError) {
      core.info(
        `You need to set permission: [${error.response?.headers['x-accepted-github-permissions']}] for the provided token.`
      )
      core.setFailed(`error: ${JSON.stringify(error.message)}`)
    }
  }
}
