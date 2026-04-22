---
name: github
description: >
  Repository-specific git and GitHub workflow. Use whenever work in
  this repo involves creating or renaming branches, syncing with origin,
  rebasing, writing commits, opening or updating pull requests, or choosing how
  to merge changes. Follow conventional commits, use contributor-prefixed branch
  names in the form `username/branch-name`, preserve linear history by
  preferring rebase over merge commits, and handle optional co-author trailers
  consistently when a contributor wants them.
user-invocable: true
disable-model-invocation: false
---

# Git And GitHub

Use this skill for everyday git and GitHub work in this repository.

## Canonical references

- Treat `https://www.conventionalcommits.org/en/v1.0.0/` as the canonical guide
  for conventional commit structure and semantics.
- Treat `https://git-scm.com/docs` as the canonical reference for git command
  behavior and flags.

## Repo conventions

- Treat `origin/main` as the primary rebase target.
- Keep history linear. Prefer `git pull --rebase`, `git fetch`, and
  `git rebase origin/main`.
- Do not create merge commits locally unless the user explicitly asks for one.
- Name working branches as `username/branch-name`.
- Derive `username` from the contributor currently working in the repo instead
  of reusing someone else's prefix.
- Write commits in conventional-commit format.
- Use atomic commits when changes span multiple logical groupings or steps.
- Keep the local contributor as the git author. Add an LLM co-author trailer
  only when the contributor wants co-author attribution.
- Match commit scopes to the repo's commitlint rules in
  `commitlint.config.js`.

## Branch naming

Before creating a branch, determine the contributor prefix from local git
identity in this order:

1. `git config --get github.user`
2. `git config --get user.username`
3. `git config --get user.name`

If the value comes from `user.name`, normalize it to a branch-safe slug:

- lowercase
- words separated with `-`
- remove characters that are unsafe in branch names

Then create branches as:

- `username/short-topic`
- `username/fix-api-timeout`
- `username/docs-dispute-flow`

Do not create generic branch names like `feature/foo` or reuse another
contributor's prefix.

## Identity memory

After resolving the local contributor identity for this repo, persist it in
the agent's available memory or local state so later git or GitHub tasks can
reuse it without asking again.

Store:

- repo root
- `git config user.name`
- `git config user.email`
- the branch-prefix source used
- the resolved branch prefix

On later tasks:

1. Check the saved memory first.
2. Reuse it when it still matches current git config.
3. Refresh the memory if git config changed.
4. Ask the user only if neither git config nor saved memory can identify the
   contributor prefix.

## Commit rules

Use conventional commits such as:

- `feat(api): add referral code validation`
- `fix(console): handle empty dispute state`
- `docs(auth): clarify token refresh flow`

This repo extends `@commitlint/config-conventional` and restricts scopes to:

- `api`
- `console`
- `swap`
- `web`
- `mobile`
- `core`
- `eslint`
- `tsconf`
- `docs`
- `deps`
- `devops`

Pick the narrowest valid scope for the change. If the change spans multiple
packages, prefer the dominant affected area or `deps`/`devops` when that is the
real intent.

For commit attribution:

- keep the local contributor as the commit author from local git config
- add a `Co-authored-by:` trailer for the LLM only when co-author attribution
  is requested or already established for the current work
- use the active assistant's known name and email by default for the
  `Co-authored-by:` trailer
- if the repo already shows an established co-author pattern for the active
  assistant, follow that pattern
- do not stop to ask for co-author identity when the assistant already knows
  its own attribution details
- when no co-author attribution is requested or implied, omit the trailer

Example with co-author trailer:

```text
feat(api): add referral code validation

Co-authored-by: Assistant <assistant-email>
```

## Working pattern

### 1. Start from an up-to-date base

- Inspect status before changing branches.
- Fetch remote updates.
- Rebase local `main` onto `origin/main` before branching when needed.

### 2. Create the working branch

- Reuse the saved contributor identity when it matches current git config;
  otherwise derive it from local git config and refresh memory.
- Use a short descriptive suffix.
- Branch from the rebased integration branch.

### 3. Keep the branch current

- Rebase onto `origin/main` instead of merging `main` into the branch.
- Resolve conflicts carefully and continue the rebase.
- Re-run relevant tests after conflict resolution or non-trivial rebases.

### 4. Prepare commits

- Stage only the intended files.
- Split unrelated work into separate commits when practical.
- When a task includes multiple logical groupings or sequential steps, make
  atomic commits so each commit captures one coherent unit of change.
- Use conventional commit messages that will satisfy commitlint.
- Add the LLM `Co-authored-by:` trailer only when co-author attribution is
  requested or already established for the current work.

### 5. Open and maintain the PR

- After making a commit or a series of commits, the usual next step is to push
  the working branch and open or update a pull request.
- Push the branch with the contributor-prefixed name.
- Create or update the PR with `gh pr` commands when GitHub CLI is available.
- Keep the PR branch rebased on `origin/main` while it is under review.
- Prefer squash-or-rebase style merges that preserve linear history.

## Decision rules

- If a command choice is between merge and rebase, choose rebase.
- If a history rewrite would affect unpublished local commits, rebase freely.
- If a history rewrite would affect commits already pushed to a shared branch,
  coordinate before force-pushing.
- If the contributor prefix cannot be determined from git config, ask for the
  intended username before creating the branch.
- If commit scope is ambiguous, check `commitlint.config.js` and pick the
  narrowest allowed scope rather than inventing a new one.
- If the work spans more than one logical change, split it into atomic commits
  instead of bundling unrelated steps together.
- If co-author attribution is requested and the LLM co-author identity is
  genuinely unavailable, ask only then for the preferred co-author name and
  email before creating the commit.
- Do not fast-forward or otherwise advance local `main` immediately after
  making branch commits; push the branch and use a pull request as the next
  action unless the user explicitly asks for a local merge.

## Expected behavior

When helping with git or GitHub work in this repo:

1. Determine the contributor-specific branch prefix from local git config.
   Reuse saved agent memory when available and still current.
2. Keep branch names in `username/branch-name` form.
3. Rebase on `origin/main` to maintain linear history.
4. Use conventional commits with allowed scopes.
5. Use atomic commits when work spans multiple logical groupings or steps.
6. Preserve the local contributor as the commit author and add an optional LLM
   `Co-authored-by:` trailer only when requested or already established.
7. After branch commits, push the branch and open or update a PR instead of
   moving local `main`.
8. Prefer PR and merge flows that keep the repo history clean and linear.
