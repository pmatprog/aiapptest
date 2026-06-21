# AI Newsletter App

A lightweight browser app for planning, drafting, and exporting an AI-focused newsletter issue.

## Open Online

After GitHub Pages finishes deploying, open:

```text
https://pmatprog.github.io/aiapptest/
```

Direct views:

```text
https://pmatprog.github.io/aiapptest/#reader
https://pmatprog.github.io/aiapptest/#editor
```

## Run Locally

Open `index.html` directly, or run a local static server:

```bash
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

Direct local views:

```text
http://localhost:8000/#reader
http://localhost:8000/#editor
```

If Node and npm are available, you can also run:

```bash
npm start
```

Then open:

```text
http://localhost:5173
```

## Features

- Issue planning with audience, voice, sponsor, and publish date fields
- Separate reader and editor views with direct links
- Story queue with category, impact, and source metadata
- Live generated newsletter preview
- Browser-saved drafts
- Markdown export and clipboard copy
- GitHub-backed starter content through `data/issue.json`

## GitHub As A Free Backend

This app can use the repository itself as a simple free backend.

The reader/editor loads starter content from:

```text
data/issue.json
```

To update the published content:

1. Open the editor view.
2. Change the issue and stories.
3. Click `Export JSON`.
4. Replace `data/issue.json` with the downloaded `issue.json`.
5. Commit and push the change.

This is free and simple, but it is still a file-based workflow. It does not provide multi-user editing, login, or automatic saves to GitHub from the browser.

## Publish With GitHub Pages

1. Push this project to the repository.
2. In GitHub, go to `Settings` > `Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Choose the `main` branch and `/root`, then save.

GitHub will provide a public URL after the first deploy finishes.
