import { Octokit } from '@octokit/core'
import { API_VERSION } from './config'
import type { BillingData } from './types'

export class GithubService {
  private octokit: Octokit

  constructor(ghToken: string) {
    this.octokit = new Octokit({ auth: ghToken })
  }

  async getBillingData(orgName: string): Promise<BillingData> {
    const { data } = await this.octokit.request(
      'GET /orgs/{org}/settings/billing/actions',
      {
        org: orgName,
        headers: {
          'X-GitHub-Api-Version': API_VERSION
        }
      }
    )
    return data as BillingData
  }
}
