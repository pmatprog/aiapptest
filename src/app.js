const storageKey = "ai-newsletter-draft";

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
  audience: document.querySelector("#audience"),
  voice: document.querySelector("#voice"),
  publishDate: document.querySelector("#publishDate"),
  sponsor: document.querySelector("#sponsor"),
  storyList: document.querySelector("#storyList"),
  preview: document.querySelector("#preview"),
  saveStatus: document.querySelector("#saveStatus")
};

const state = {
  stories: []
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function loadDraft() {
  const rawDraft = localStorage.getItem(storageKey);
  if (!rawDraft) {
    fields.publishDate.value = today();
    state.stories = structuredClone(fallbackStories);
    return;
  }

  try {
    const draft = JSON.parse(rawDraft);
    fields.title.value = draft.title || fields.title.value;
    fields.audience.value = draft.audience || fields.audience.value;
    fields.voice.value = draft.voice || fields.voice.value;
    fields.publishDate.value = draft.publishDate || today();
    fields.sponsor.value = draft.sponsor || "";
    state.stories = Array.isArray(draft.stories) && draft.stories.length ? draft.stories : structuredClone(fallbackStories);
  } catch {
    fields.publishDate.value = today();
    state.stories = structuredClone(fallbackStories);
  }
}

function collectDraft() {
  return {
    title: fields.title.value.trim(),
    audience: fields.audience.value,
    voice: fields.voice.value,
    publishDate: fields.publishDate.value,
    sponsor: fields.sponsor.value.trim(),
    stories: state.stories
  };
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

function renderStories() {
  fields.storyList.replaceChildren(...state.stories.map(storyTemplate));
}

function buildMarkdown() {
  const draft = collectDraft();
  const dateLine = draft.publishDate ? `_${draft.publishDate}_` : "_Date TBD_";
  const intro = `For ${draft.audience.toLowerCase()}, here is the ${draft.voice.toLowerCase()} read on the AI stories worth carrying into next week.`;
  const stories = draft.stories.map((story, index) => {
    const title = story.title.trim() || `Untitled story ${index + 1}`;
    const category = story.category.trim() || "Signal";
    const source = story.source.trim() || "Source TBD";
    const note = story.note.trim() || "Add the angle for this story.";
    return `### ${index + 1}. ${title}\n\n**${category} | ${story.impact} impact**\n\n${note}\n\nSource: ${source}`;
  }).join("\n\n");
  const sponsor = draft.sponsor ? `\n\n---\n\n**Sponsor**\n\n${draft.sponsor}` : "";

  return `# ${draft.title || "Untitled AI Newsletter"}\n\n${dateLine}\n\n${intro}\n\n## Top Stories\n\n${stories}${sponsor}\n\n## Closing Thought\n\nThe useful question is not whether AI is moving quickly. It is which changes are now stable enough to build around.`;
}

function renderPreview() {
  fields.preview.textContent = buildMarkdown();
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

async function copyMarkdown() {
  await navigator.clipboard.writeText(buildMarkdown());
  fields.saveStatus.textContent = "Copied";
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
document.querySelector("#copyMarkdown").addEventListener("click", copyMarkdown);

loadDraft();
renderStories();
renderPreview();
