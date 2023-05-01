# Release Process

## Tracking MAAS core

When MAAS core releases an initial release candidate (e.g. `2.8.0-rc1`), a corresponding branch of maas-ui named after the MAAS
version should be created.

### Note

No new dependencies (unless in the case of a CVE), or features should land in
the release branch once created. Bugfixes should be made on main and backported to release branches where needed.

## Creating a release

### Semver

Please try to adhere to semantic versioning when creating a release. Although release drafter will just increment the patch, you should consider if the release contains new features, in which case the minor version should be incremented. For more details, refer to the [semantic versioning spec](https://semver.org/).

### Process

#### Create the branch

Create a new branch from main using the MAAS version as the name (e.g. `git checkout -b 3.2 main`).

Push the branch to the repo at `canonical/maas-ui`.

#### Update the version

Create a new local branch e.g. release-0.1.2.

Run `yarn release [version]` where version is in the form `0.1.2`. This will bump the version in `package.json` and create a tag with a 'v' prefix.

The workflows in `.github/workflows` need to be updated to only run against the version
branch. This might look something like the following:

```yaml
on:
  push:
    branches:
      - 3.5
  pull_request:
    branches:
      - 3.5
```

Update the workflows to set the snap channel for the `maas` and
`maas-test-db` snaps (e.g. `--channel=3.5/edge`).

Propose this against the appropriate version branch and merge once approved.

#### Send version email

Email the MAAS & Design list with a link to the new branch in GitHub and include
the latest hash to include for ui Git submodule.

#### Update main version to the next expected version

Create a new branch of main and update the version in all package.jsons to the next expected version.

#### Add branch protection

Create new branch protection rules for the new version branch, copying the rules from the previous branch: https://github.com/canonical/maas-ui/settings/branches.

#### Update Usabilla ID

Usabilla button IDs can be found in the Usabilla dashboard.

Update the `REACT_APP_USABILLA_ID` on the new release branch with a Usabilla button ID that matches the new version (e.g. "MAAS 3.4").

Update the `REACT_APP_USABILLA_ID` on the main branch with a Usabilla button ID that matches the next expected version, e.g. "MAAS 3.5" button id.

You may need to create new buttons in Usabilla if they don't yet exist.
