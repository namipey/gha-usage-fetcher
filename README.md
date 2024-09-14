# gha-usage-fetcher

GitHub Action for fetching GitHub Action's usage.

## Usage

In order to use this action, you need to:

1. [Register new GitHub App](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/registering-a-github-app) and add permission(`admin:org=read`)
2. [Store the App's ID in your repository environment variables (example: APP_ID)](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/store-information-in-variables#defining-configuration-variables-for-multiple-workflows)
3. [Store the App's private key in your repository secrets (example: PRIVATE_KEY)](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions?tool=webui#creating-encrypted-secrets-for-a-repository)

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v4

  - uses: actions/create-github-app-token@v1
    id: app-token
    with:
      app-id: ${{ secrets.APP_ID }}
      private-key: ${{ secrets.PRIVATE_KEY }}
      owner: ${{ github.repository_owner }}

  - name: Fetch GHA Usage
    id: gha-usage-fetcher
    uses: namipey/gha-usage-fetcher@v1
    with:
      github_token: ${{ steps.app-token.outputs.token }}
      org_name: ${{ github.repository_owner }}

  - name: Print Output
    run: echo "${{ steps.gha-usage-fetcher.outputs.total_cost }}"
```
