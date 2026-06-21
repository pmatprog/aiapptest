const storageKey = "signalstack-draft";
const issueDataUrl = "data/issue.json";

const fallbackStories = [
  {
    title: "Open models push smaller teams closer to custom assistants",
    category: "Builder Brief",
    impact: "High",
    source: "Research roundup",
    note: "Focus on what changed for product teams, not benchmark trivia."
  },
  {
    title: "AI coding tools settle into review and maintenance workflows",
    category: "Workflow",
    impact: "Medium",
    source: "Developer survey",
    note: "Call out practical adoption patterns and where human review still matters."
  },
  {
    title: "Enterprise buyers ask harder questions about evals",
    category: "Market Signal",
    impact: "High",
    source: "Procurement notes",
    note: "Translate evals into budget and risk language."
  }
];

const fields = {
  title: document.querySelector("#issueTitle"),
  subtitle: document.querySelector("#subtitle"),
  audience: document.querySelector("#audience"),
  voice: document.querySelector("#voice"),
  subscribers: document.querySelector("#subscribers"),
  rate: document.querySelector("#rate"),
  sponsor: document.querySelector("#sponsor"),
  storyList: document.querySelector("#storyList"),
  preview: document.querySelector("#previewMarkdown"),
  saveStatus: document.querySelector("#saveStatus")
};

const publicView = {
  title: document.querySelector("#publicTitle"),
  subtitle: document.querySelector("#publicSubtitle"),
  subscribers: document.querySelector("#subscriberCount"),
  rate: document.querySelector("#openRate"),
  audience: document.querySelector("#audienceCard"),
  phoneTitle: document.querySelector("#phoneTitle"),
  phoneCategory: document.querySelector("#phoneCategory"),
  phoneHeadline: document.querySelector("#phoneHeadline"),
  phoneNote: document.querySelector("#phoneNote"),
  storyStrip: document.querySelector("#storyStrip")
};

const viewLinks = document.querySelectorAll("[data-view-link]");

const state = {
  stories: []
};

function cloneStories() {
  return fallbackStories.map((story) => ({ ...story }));
}

function applyDraft(draft) {
  fields.title.value = draft.title || fields.title.value;
  fields.subtitle.value = draft.subtitle || fields.subtitle.value;
  fields.audience.value = draft.audience || fields.audience.value;
  fields.voice.value = draft.voice || fields.voice.value;
  fields.subscribers.value = draft.subscribers || fields.subscribers.value;
  fields.rate.value = draft.rate || fields.rate.value;
  fields.sponsor.value = draft.sponsor || "";
  state.stories = Array.isArray(draft.stories) && draft.stories.length ? draft.stories : cloneStories();
}

async function loadRepoIssue() {
  const response = await fetch(`${issueDataUrl}?v=${Date.now()}`);
  if (!response.ok) {
    throw new Error(`Could not load ${issueDataUrl}`);
  }
  return response.json();
}

async function loadDraft() {
  const rawDraft = localStorage.getItem(storageKey);
  if (!rawDraft) {
    try {
      applyDraft(await loadRepoIssue());
    } catch {
      state.stories = cloneStories();
    }
    return;
  }

  try {
    applyDraft(JSON.parse(rawDraft));
  } catch {
    state.stories = cloneStories();
  }
}

function collectDraft() {
  return {
    title: fields.title.value.trim(),
    subtitle: fields.subtitle.value.trim(),
    audience: fields.audience.value,
    voice: fields.voice.value,
    subscribers: fields.subscribers.value.trim(),
    rate: fields.rate.value.trim(),
    sponsor: fields.sponsor.value.trim(),
    stories: state.stories
  };
}

function escapeAttribute(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeText(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function storyTemplate(story, index) {
  const wrapper = document.createElement("article");
  wrapper.className = "story";
  wrapper.innerHTML = `
    <div class="story-row">
      <label>
        Headline
        <input data-field="title" data-index="${index}" type="text" value="${escapeAttribute(story.title)}">
      </label>
      <label>
        Impact
        <select data-field="impact" data-index="${index}">
          ${["High", "Medium", "Low"].map((level) => `<option ${level === story.impact ? "selected" : ""}>${level}</option>`).join("")}
        </select>
      </label>
    </div>
    <div class="story-meta">
      <label>
        Category
        <input data-field="category" data-index="${index}" type="text" value="${escapeAttribute(story.category)}">
      </label>
      <label>
        Source
        <input data-field="source" data-index="${index}" type="text" value="${escapeAttribute(story.source)}">
      </label>
      <button class="delete-story" data-delete="${index}" type="button" title="Delete story" aria-label="Delete story">X</button>
    </div>
    <label>
      Angle
      <textarea data-field="note" data-index="${index}" rows="3">${escapeText(story.note)}</textarea>
    </label>
  `;
  return wrapper;
}

function renderStories() {
  fields.storyList.replaceChildren(...state.stories.map(storyTemplate));
}

function renderPublicView() {
  const draft = collectDraft();
  const mainStory = draft.stories[0] || fallbackStories[0];
  publicView.title.textContent = draft.title || "A sharper weekly brief for people building with AI.";
  publicView.subtitle.textContent = draft.subtitle || "Curate the signal, package the story, and ship a polished issue from one calm control room.";
  publicView.subscribers.textContent = draft.subscribers || "12.8k";
  publicView.rate.textContent = draft.rate || "48%";
  publicView.audience.textContent = draft.audience;
  publicView.phoneTitle.textContent = draft.title || "This Week in Practical AI";
  publicView.phoneCategory.textContent = mainStory.category || "Builder Brief";
  publicView.phoneHeadline.textContent = mainStory.title || "Untitled AI story";
  publicView.phoneNote.textContent = mainStory.note || "Add the angle for this story.";

  const miniStories = draft.stories.slice(1, 4).map((story, index) => {
    const item = document.createElement("div");
    item.className = "mini-story";
    item.innerHTML = `
      <span class="mini-thumb" aria-hidden="true"></span>
      <span>
        <span>${escapeText(story.category || `Signal ${index + 1}`)}</span>
        <strong>${escapeText(story.title || "Untitled story")}</strong>
      </span>
    `;
    return item;
  });
  publicView.storyStrip.replaceChildren(...miniStories);
}

function buildMarkdown() {
  const draft = collectDraft();
  const intro = `For ${draft.audience.toLowerCase()}, here is the ${draft.voice.toLowerCase()} read on the AI stories worth carrying into next week.`;
  const stories = draft.stories.map((story, index) => {
    const title = story.title.trim() || `Untitled story ${index + 1}`;
    const category = story.category.trim() || "Signal";
    const source = story.source.trim() || "Source TBD";
    const note = story.note.trim() || "Add the angle for this story.";
    return `### ${index + 1}. ${title}\n\n**${category} | ${story.impact} impact**\n\n${note}\n\nSource: ${source}`;
  }).join("\n\n");
  const sponsor = draft.sponsor ? `\n\n---\n\n**Sponsor**\n\n${draft.sponsor}` : "";

  return `# ${draft.title || "Untitled AI Newsletter"}\n\n${draft.subtitle || intro}\n\nAudience: ${draft.audience}\nVoice: ${draft.voice}\n\n## Top Stories\n\n${stories}${sponsor}\n\n## Closing Thought\n\nThe useful question is not whether AI is moving quickly. It is which changes are now stable enough to build around.`;
}

function renderPreview() {
  fields.preview.textContent = buildMarkdown();
  renderPublicView();
}

function activeViewFromHash() {
  const hash = window.location.hash.replace("#", "");
  if (hash === "editor" || hash === "crm") return "editor";
  return "reader";
}

function syncActiveView() {
  const activeView = activeViewFromHash();
  document.body.dataset.activeView = activeView;
  viewLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.viewLink === activeView);
  });
}

function saveDraft(showStatus = true) {
  localStorage.setItem(storageKey, JSON.stringify(collectDraft()));
  if (!showStatus) return;
  fields.saveStatus.textContent = "Saved";
  window.setTimeout(() => {
    fields.saveStatus.textContent = "";
  }, 1600);
}

function addStory() {
  state.stories.push({
    title: "New AI story",
    category: "Signal",
    impact: "Medium",
    source: "Source TBD",
    note: "Describe why this matters and who should pay attention."
  });
  renderStories();
  renderPreview();
  saveDraft(false);
}

function downloadMarkdown() {
  const blob = new Blob([buildMarkdown()], { type: "text/markdown" });
  const link = document.createElement("a");
  const safeTitle = (fields.title.value || "ai-newsletter").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  link.href = URL.createObjectURL(blob);
  link.download = `${safeTitle || "ai-newsletter"}.md`;
  link.click();
  URL.revokeObjectURL(link.href);
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(collectDraft(), null, 2)], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "issue.json";
  link.click();
  URL.revokeObjectURL(link.href);
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(buildMarkdown());
  fields.saveStatus.textContent = "Copied";
  window.setTimeout(() => {
    fields.saveStatus.textContent = "";
  }, 1600);
}

async function reloadRepoData() {
  try {
    applyDraft(await loadRepoIssue());
    renderStories();
    renderPreview();
    saveDraft(false);
    fields.saveStatus.textContent = "Loaded";
  } catch {
    fields.saveStatus.textContent = "Load failed";
  }
  window.setTimeout(() => {
    fields.saveStatus.textContent = "";
  }, 1600);
}

fields.storyList.addEventListener("input", (event) => {
  const target = event.target;
  const index = Number(target.dataset.index);
  const field = target.dataset.field;
  if (!Number.isInteger(index) || !field) return;
  state.stories[index][field] = target.value;
  renderPreview();
  saveDraft(false);
});

fields.storyList.addEventListener("click", (event) => {
  const deleteIndex = event.target.dataset.delete;
  if (deleteIndex === undefined) return;
  state.stories.splice(Number(deleteIndex), 1);
  renderStories();
  renderPreview();
  saveDraft(false);
});

document.querySelectorAll("input, select, textarea").forEach((control) => {
  control.addEventListener("input", () => {
    renderPreview();
    saveDraft(false);
  });
});

document.querySelector("#addStory").addEventListener("click", addStory);
document.querySelector("#saveDraft").addEventListener("click", () => saveDraft(true));
document.querySelector("#downloadMarkdown").addEventListener("click", downloadMarkdown);
document.querySelector("#downloadJson").addEventListener("click", downloadJson);
document.querySelector("#copyMarkdown").addEventListener("click", copyMarkdown);
document.querySelector("#loadRepoData").addEventListener("click", reloadRepoData);
document.querySelector("#signupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.querySelector("button").textContent = "You're in";
});

window.addEventListener("hashchange", syncActiveView);

async function initializeApp() {
  await loadDraft();
  renderStories();
  renderPreview();
  syncActiveView();
}

initializeApp();
