# Move Void Wake to GitHub and Codex — beginner guide

Prepared October 2, 2026. Start on your Windows PC: extracting a ZIP and uploading folders is easier there than on a phone.

GitHub holds your project files and their saved versions. Codex Cloud works on a copy of that repository and can propose code changes. You do not need GitHub Copilot or GitHub Codespaces for this workflow. You can still play the downloaded HTML offline.

## 1. Extract the project

Download `void-wake-codex.zip`. In Windows File Explorer, right-click it, choose **Extract All**, and open the extracted `void-wake-codex` folder. Open `game.html` to confirm that v2.3.1 runs.

The ZIP includes the complete game, six real earlier snapshots, relevant history, instructions for Codex, and portable regression tests. `game.html` is already the final playable file; you do not need to compile it.

## 2. Create a GitHub repository

1. Sign in at https://github.com or create an account.
2. Open https://github.com/new.
3. Name the repository `void-wake`. I recommend **Private** for your working project.
4. Leave automatic README, .gitignore, and license additions off; the package already supplies project files.
5. Select **Create repository**.

A repository, or repo, is the project's online folder with version history. A private repo can still be connected to Codex when you grant it access.

## 3. Upload the extracted contents

On an empty repository, use **uploading an existing file**. On an initialized repository, use **Add file → Upload files**.

Drag the CONTENTS of the extracted `void-wake-codex` folder into the upload area, including its `tests` and `history` folders. Do not upload just the ZIP or put an extra `void-wake-codex` folder around everything in the repository. Include `.gitignore` and `.gitattributes`; you can use the file chooser for them if needed.

Enter a message such as `Import Void Wake v2.3.1 and Codex handoff`, then save using **Commit changes** or **Propose changes**, whichever GitHub presents. If GitHub creates a branch/pull request for this initial upload, merge it before selecting the repo in Codex.

Check the repository's top level: `game.html`, `AGENTS.md`, `README.md`, `PROJECT_HISTORY.md`, `CODEX_START_HERE.md`, `VALIDATION.md`, `package.json`, `tests/`, and `history/` should be directly visible. Open `game.html` on GitHub and search for `v2.3.1`. That confirms you uploaded the current file.

The first commit contains the current source and archived files; earlier chat edits do not automatically become individual Git commits. The written history preserves the relevant decisions.

## 4. Connect the repo to Codex Cloud

Open https://chatgpt.com/codex and sign in with your ChatGPT account. Current official instructions also support starting a new task in ChatGPT with **Work in → Cloud → Select environment → Create environment**. Interface labels can differ as features roll out.

Connect GitHub when prompted, grant access to `void-wake`, select that repository, and start environment setup. Use its `main` branch for the initial baseline if a branch selector appears. Let Codex inspect the project and prepare its development tools.

For this project, ask setup to use a Node version allowed by `package.json` and run:

```sh
npm install
npm test
```

These packages are for testing only. Players do not need them. Commit the generated `package-lock.json` after a successful install; use `npm ci` for future clean installs. A supported Node version is 22.22.2+ on 22.x, 24.15.0+ on 24.x, or 26+.

If the setup interface asks what to install, paste:

> This is a static, single-file vanilla HTML/Canvas game. Use Node satisfying package.json's engines, run npm install and npm test, and preserve game.html as the complete offline deliverable. No API key, backend, or game build step is needed.

Review setup results and publish the environment if that control appears. Publishing an environment saves the reusable development setup; it does not publish the game as a public website. Then start a task.

If `void-wake` is missing, check that you connected the GitHub account that owns it and that the GitHub integration has permission to that specific repository.

## 5. First task to paste into Codex

```text
Continue this existing Void Wake project; do not rebuild it from scratch.

Read AGENTS.md, README.md, PROJECT_HISTORY.md, and VALIDATION.md.
The active game is root game.html, currently v2.3.1. Older files in
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
If you make code changes, prepare a pull request for review.
```

`AGENTS.md` carries the standing instructions. The history file carries the relevant chat decisions. Codex does not automatically inherit this conversation's full context just because the GitHub repository is connected.

## 6. Your normal change-and-play loop

1. Describe one concrete change in Codex, with a screenshot when useful.
2. Let it implement and check the change. Ask for the full HTML and a summary.
3. Review the changed files and any pull request. Download the proposed `game.html` and play it before merging.
4. Merge the accepted pull request on GitHub. A merge incorporates the proposed branch into `main`.
5. Download the updated game using **Code → Download ZIP** on the repo, extract it, and open root `game.html`.
6. Start the next task from the updated main branch.

A pull request is a proposed set of changes you can review before accepting. A commit is a saved revision. A branch is a separate line of work. A diff shows what changed.

If Codex only ran checks and made no changes, there is nothing to merge. If a task changes files but has not committed or opened a pull request, ask it to save the changes into a reviewable branch/PR.

## Optional later: work on the same repo locally

You can clone the repo on your PC with GitHub Desktop and open that folder in your local Codex tool. Local files and GitHub are synchronized through commits and push/pull, not automatically by switching tools. Pull the latest merged changes before local editing; commit and push local changes before beginning cloud work on them. Initially, the web/cloud workflow above avoids needing command-line Git.

## Playing, publishing, and saved progress

- Uploading source to GitHub is not the same as hosting a playable site. A hosted URL can be added as a separate task later.
- High score, sound preference, and World 2 unlock live in the browser. A different browser profile or hosted origin uses separate storage. This game currently has no full-run continue save.
- The HTML requires no OpenAI API key. Sign-in for Codex is separate from playing the game.

## Official references checked for this handoff

- Codex Cloud: https://learn.chatgpt.com/docs/cloud
- Cloud environments: https://learn.chatgpt.com/docs/environments/cloud-environments
- AGENTS.md: https://learn.chatgpt.com/docs/agent-configuration/agents-md
- Create a GitHub repository: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- Upload files: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository

The cloud walkthrough follows the current official setup flow, with project-specific recommendations. Your account may show different labels or have features at a different rollout stage.
