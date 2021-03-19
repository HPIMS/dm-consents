# hpims consent sources

### Deployment procedure

1. Create feature branch, e.g. `user123/rename-xyz-to-abc`
1. Create and merge pull request to merge this feature branch to `dev` (should be the default). Feature branch should be
   deleted afterwards.
1. Create and merge pull request to merge `dev` to `sandbox`
1. Create and merge pull request to merge `sandbox` to `main`

Reasoning behind this:

1. Branches are all aligned after a successful change deployment
1. No subordinate branch ever has a state higher than a superior branch
1. Pull requests for transparency and source control

### About consentIds

- Each consentId has the structure `hpims-<name>` and the consent contents have to be put in a directory in this
  repository called `<name>`.
- ConsentIds are not designed to be renamed since they are already identified by this in the database.
- `hpims` is a static prefix that can not be changed.