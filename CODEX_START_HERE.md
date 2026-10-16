# Continue Void Wake with GitHub and Codex — beginner guide

Originally prepared October 2, 2026; updated October 16, 2026 for v2.5.0. Start on your Windows PC: extracting a ZIP and uploading folders is easier there than on a phone.

GitHub holds your project files and their saved versions. Codex Cloud works on a copy of that repository and can propose code changes. You do not need GitHub Copilot or GitHub Codespaces for this workflow. You can still play the downloaded HTML offline.

## Start with the existing repository

The project is already uploaded at https://github.com/understandingothers789-pixel/spaceship_game. To play the latest release, use **Code → Download ZIP**, extract it, and open root `game.html`. To continue development, skip the initial-import steps below and go to section 4. The original `void-wake-codex.zip` was the v2.3.1 handoff and is not the latest release.

The campaign currently includes World 1 and Chloris. The project is designed to grow into more worlds. Current behavior and controls are summarized in `README.md`; the development log is in `PROJECT_HISTORY.md`.

## 1. Extract the project (only for an initial import)

For a separate initial import, download the current repository using **Code → Download ZIP**. In Windows File Explorer, right-click the ZIP, choose **Extract All**, and open the extracted `spaceship_game-main` folder. Open `game.html` to confirm that v2.5.0 runs.

The repository includes the complete game, six real earlier snapshots, relevant history, instructions for Codex, portable regression tests, and a seeded balance runner. `game.html` is already the final playable file; you do not need to compile it.

## 2. Create a GitHub repository

1. Sign in at https://github.com or create an account.
2. Open https://github.com/new.
3. Name the repository `spaceship_game`. Public and private repositories both work with Codex when you grant access. The existing project repository is public.
4. Leave automatic README, .gitignore, and license additions off; the package already supplies project files.
5. Select **Create repository**.

A repository, or repo, is the project's online folder with version history. A private repo can still be connected to Codex when you grant it access.

## 3. Upload the extracted contents

On an empty repository, use **uploading an existing file**. On an initialized repository, use **Add file → Upload files**.

Drag the CONTENTS of the extracted project folder into the upload area, including its `tests` and `history` folders. Do not upload just the ZIP or put an extra wrapper folder around everything in the repository. Include `.gitignore` and `package-lock.json`.

Enter a message such as `Import Void Wake v2.5.0 and Codex handoff`, then save using **Commit changes** or **Propose changes**, whichever GitHub presents. If GitHub creates a branch/pull request for this initial upload, merge it before selecting the repo in Codex.

Check the repository's top level: `game.html`, `AGENTS.md`, `README.md`, `PROJECT_HISTORY.md`, `CODEX_START_HERE.md`, `VALIDATION.md`, `package.json`, `package-lock.json`, `tests/`, and `history/` should be directly visible. Open `game.html` on GitHub and search for `v2.5.0`. That confirms you uploaded the current file.

The first commit contains the current source and archived files; earlier chat edits do not automatically become individual Git commits. The written history preserves the relevant decisions.

## 4. Connect the repo to Codex Cloud

Open https://chatgpt.com/codex and sign in with your ChatGPT account. Start a new task in ChatGPT with **Work in → Cloud → Select environment → Create environment** if an environment is needed. If you already have a published environment for this repository, select it instead. Interface labels can differ as features roll out.

Connect GitHub when prompted, grant access to `spaceship_game`, select that repository, and start environment setup. Use its `main` branch for the initial baseline if a branch selector appears. Let Codex inspect the project and prepare its development tools.

For this project, ask setup to use a Node version allowed by `package.json` and run:

```sh
npm ci
npm test
npm run balance
```

These packages are for testing only. Players do not need them. The repository already contains `package-lock.json`; `npm ci` installs those locked versions. Use `npm install` only when intentionally updating dependencies, and commit the resulting lockfile changes. `npm test` checks regressions; `npm run balance` prints seeded balance comparisons and requires interpretation. A supported Node version is 22.22.2+ on 22.x, 24.15.0+ on 24.x, or 26+.

If the setup interface asks what to install, paste:

> This is a static, single-file vanilla HTML/Canvas game. Use Node satisfying package.json's engines, run npm ci and npm test, and preserve game.html as the complete offline deliverable. No API key, backend, or game build step is needed.

Review setup results and publish the environment if that control appears. Publishing an environment saves the reusable development setup; it does not publish the game as a public website. Then start a task.

If `spaceship_game` is missing, check that you connected the GitHub account that owns it and that the GitHub integration has permission to that specific repository.

## 5. First task to paste into Codex

```text
Continue this existing Void Wake project; do not rebuild it from scratch.

Read AGENTS.md, README.md, PROJECT_HISTORY.md, and VALIDATION.md.
The active game is root game.html, currently v2.5.0. Older files in
history/snapshots are reference snapshots only.

First inspect the current game and run the existing tests. Install only
the dev test dependencies if needed, using a supported Node version.
Report any real failures and explain the current architecture briefly.
If no issue needs a fix, do not change gameplay just to create a diff.
If you find a genuine bug, fix it and rerun the relevant checks.

Preserve the one-file offline HTML requirement, XP-only upgrades with
no timers, one-time upgrade trees, the moving corner-oriented bot,
best-effort unfocused-tab simulation, the exact 20-warden World 1 finale,
and the distinct World 2. Keep stars less prominent than enemy shots and
the planet horizontally centered above the arena.

Keep the visible version and short changelog current whenever code changes.
Provide the complete updated game.html and a clear summary of checks.
After relevant checks pass, update the supporting descriptions and logs,
commit completed changes, and deliver them to main by default, following
AGENTS.md. Use a pull request when needed and merge completed routine work.
If a repository rule or permission blocks delivery, report the exact blocker.
```

`AGENTS.md` carries the standing instructions. The history file carries the relevant chat decisions. Codex does not automatically inherit this conversation's full context just because the GitHub repository is connected.

## 6. Your normal change-and-play loop

1. Describe one concrete change in Codex, with a screenshot when useful.
2. Let it implement and check the change. Ask for the full HTML and a summary.
3. Codex follows `AGENTS.md`: run relevant checks, update version/history/validation when code changes, and commit and deliver routine completed changes to `main`.
4. Review the summary, changed files, and checks. If you want to approve a proposed change before it reaches `main`, explicitly ask for a review-only pull request at the start of that task.
5. Download the updated game using **Code → Download ZIP** on the repo, extract it, and open root `game.html`.
6. Start the next task from the updated main branch.

A pull request is a proposed set of changes you can review before accepting. A commit is a saved revision. A branch is a separate line of work. A diff shows what changed.

If Codex only ran checks and made no changes, there is nothing to merge. If a task changes files but has not committed or opened a pull request, ask it to complete delivery to `main` under `AGENTS.md`, or explain any permission/check failure preventing that.

## Optional later: work on the same repo locally

You can clone the repo on your PC with GitHub Desktop and open that folder in your local Codex tool. Local files and GitHub are synchronized through commits and push/pull, not automatically by switching tools. Pull the latest merged changes before local editing; commit and push local changes before beginning cloud work on them. Initially, the web/cloud workflow above avoids needing command-line Git.

## Playing, publishing, and saved progress

- Uploading source to GitHub is not the same as hosting a playable site. A hosted URL can be added as a separate task later.
- High score, sound/music preferences, music volume, and World 2 unlock live in the browser. A different browser profile or hosted origin uses separate storage. This game currently has no full-run continue save.
- The HTML requires no OpenAI API key. Sign-in for Codex is separate from playing the game.

## Official references

- Codex Cloud: https://learn.chatgpt.com/docs/cloud
- Cloud environments: https://learn.chatgpt.com/docs/environments/cloud-environments
- AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Create a GitHub repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- Upload files: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

The cloud-environment setup flow was checked against the official OpenAI documentation on October 16, 2026. The other links are reference material from the original handoff. Your account may show different labels or have features at a different rollout stage.
