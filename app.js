"use strict";

/* ---------- storage helpers ---------- */

const LS = {
  exercises: "wt_exercises",
  lastUsed: "wt_lastused",
  logs: "wt_logs",
  settings: "wt_settings",
};

const DEFAULT_EXERCISES = [
  { id: "bench_press", name: "벤치프레스", cat: "가슴" },
  { id: "incline_bench", name: "인클라인 벤치프레스", cat: "가슴" },
  { id: "dumbbell_press", name: "덤벨 프레스", cat: "가슴" },
  { id: "dips", name: "딥스", cat: "가슴" },
  { id: "deadlift", name: "데드리프트", cat: "등" },
  { id: "barbell_row", name: "바벨로우", cat: "등" },
  { id: "lat_pulldown", name: "랫풀다운", cat: "등" },
  { id: "pullup", name: "풀업", cat: "등" },
  { id: "squat", name: "스쿼트", cat: "하체" },
  { id: "leg_press", name: "레그프레스", cat: "하체" },
  { id: "lunge", name: "런지", cat: "하체" },
  { id: "leg_curl", name: "레그컬", cat: "하체" },
  { id: "overhead_press", name: "오버헤드프레스", cat: "어깨" },
  { id: "lateral_raise", name: "사이드레터럴레이즈", cat: "어깨" },
  { id: "face_pull", name: "페이스풀", cat: "어깨" },
  { id: "barbell_curl", name: "바벨컬", cat: "팔" },
  { id: "triceps_ext", name: "트라이셉스 익스텐션", cat: "팔" },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}
function saveJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

function getExercises() {
  return loadJSON(LS.exercises, DEFAULT_EXERCISES);
}
function saveExercises(list) {
  saveJSON(LS.exercises, list);
}
function getLastUsed() {
  return loadJSON(LS.lastUsed, {});
}
function saveLastUsed(obj) {
  saveJSON(LS.lastUsed, obj);
}
function getLogs() {
  return loadJSON(LS.logs, {});
}
function saveLogs(obj) {
  saveJSON(LS.logs, obj);
}
function getSettings() {
  return loadJSON(LS.settings, {
    token: "",
    owner: "taeminPark",
    repo: "workout-data",
    path: "log.json",
    lastSync: null,
    lastSyncOk: null,
  });
}
function saveSettings(s) {
  saveJSON(LS.settings, s);
}

function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/* ---------- app state ---------- */

let S = {
  screen: "home",
  currentExercise: null,
  targetSets: 0,
  sets: [],
  flowIndex: 0,
  flowMode: "append", // 'append' | 'edit'
  phase: "weight", // 'weight' | 'reps'
  draftWeight: 20,
  draftReps: 8,
};

const WEIGHT_STEP = 2.5;
const REPS_STEP = 1;

function resetSession() {
  S.currentExercise = null;
  S.targetSets = 0;
  S.sets = [];
  S.flowIndex = 0;
  S.flowMode = "append";
  S.phase = "weight";
}

function commitExercise() {
  if (!S.currentExercise || S.sets.length === 0) return;
  const logs = getLogs();
  const key = todayKey();
  if (!logs[key]) logs[key] = [];
  logs[key].push({
    exerciseId: S.currentExercise.id,
    exerciseName: S.currentExercise.name,
    sets: S.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    ts: Date.now(),
  });
  saveLogs(logs);

  const lastUsed = getLastUsed();
  const last = S.sets[S.sets.length - 1];
  lastUsed[S.currentExercise.id] = { weight: last.weight, reps: last.reps };
  saveLastUsed(lastUsed);

  syncToGitHub();
}

/* ---------- flow control ---------- */

function goHome() {
  resetSession();
  S.screen = "home";
  render();
}

function pickExercise(ex) {
  resetSession();
  S.currentExercise = ex;
  S.screen = "setcount";
  render();
}

function pickSetCount(n) {
  S.targetSets = n;
  startSet(0, "append");
}

function defaultsForIndex(index) {
  if (index > 0 && S.sets[index - 1]) {
    return { weight: S.sets[index - 1].weight, reps: S.sets[index - 1].reps };
  }
  const lastUsed = getLastUsed();
  const remembered = lastUsed[S.currentExercise.id];
  if (remembered) return { weight: remembered.weight, reps: remembered.reps };
  return { weight: 20, reps: 8 };
}

function startSet(index, mode) {
  S.flowIndex = index;
  S.flowMode = mode;
  if (mode === "edit" && S.sets[index]) {
    S.draftWeight = S.sets[index].weight;
    S.draftReps = S.sets[index].reps;
  } else {
    const d = defaultsForIndex(index);
    S.draftWeight = d.weight;
    S.draftReps = d.reps;
  }
  S.phase = "weight";
  S.screen = "flow";
  render();
}

function confirmWeightStep() {
  S.phase = "reps";
  render();
}

function confirmRepsStep() {
  const value = { weight: S.draftWeight, reps: S.draftReps };
  if (S.flowMode === "edit") {
    S.sets[S.flowIndex] = value;
    S.screen = "summary";
    render();
    return;
  }
  S.sets.push(value);
  if (S.sets.length < S.targetSets) {
    startSet(S.sets.length, "append");
  } else {
    S.screen = "summary";
    render();
  }
}

function addExtraSet() {
  S.targetSets = S.sets.length + 1;
  startSet(S.sets.length, "append");
}

function editSet(index) {
  startSet(index, "edit");
}

function finishExercise() {
  commitExercise();
  goHome();
}

/* ---------- GitHub sync ---------- */

function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

async function syncToGitHub() {
  const s = getSettings();
  if (!s.token || !s.owner || !s.repo) return;

  const path = s.path || "data/log.json";
  const url = `https://api.github.com/repos/${s.owner}/${s.repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${s.token}`,
    Accept: "application/vnd.github+json",
  };

  try {
    let sha = null;
    const getRes = await fetch(url, { headers });
    if (getRes.status === 200) {
      const data = await getRes.json();
      sha = data.sha;
    } else if (getRes.status !== 404) {
      throw new Error(`조회 실패 (${getRes.status})`);
    }

    const content = JSON.stringify(getLogs(), null, 2);
    const body = {
      message: `운동 기록 업데이트 ${todayKey()}`,
      content: utf8ToB64(content),
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!putRes.ok) {
      const errBody = await putRes.text();
      throw new Error(`저장 실패 (${putRes.status}) ${errBody.slice(0, 120)}`);
    }

    s.lastSync = Date.now();
    s.lastSyncOk = true;
    s.lastSyncError = null;
  } catch (e) {
    s.lastSyncOk = false;
    s.lastSyncError = String(e.message || e);
  }
  saveSettings(s);
  if (S.screen === "settings" || S.screen === "home") render();
}

/* ---------- rendering ---------- */

const app = document.getElementById("app");

function h(strings, ...values) {
  return strings.reduce((acc, s, i) => acc + s + (values[i] ?? ""), "");
}

function esc(str) {
  const d = document.createElement("div");
  d.textContent = str;
  return d.innerHTML;
}

function render() {
  if (S.screen === "home") return renderHome();
  if (S.screen === "setcount") return renderSetCount();
  if (S.screen === "flow") return renderFlow();
  if (S.screen === "summary") return renderSummary();
  if (S.screen === "manage") return renderManage();
  if (S.screen === "settings") return renderSettings();
}

function renderTopbar(title, opts) {
  opts = opts || {};
  return h`
    <div class="topbar">
      ${
        opts.onBack
          ? `<button class="iconbtn" data-action="back">‹</button>`
          : `<button class="iconbtn" data-action="settings">⚙</button>`
      }
      <h1>${esc(title)}</h1>
      ${
        opts.onManage
          ? `<button class="iconbtn" data-action="manage">✎</button>`
          : `<div style="width:44px"></div>`
      }
    </div>
  `;
}

function summarizeEntry(entry) {
  return entry.sets.map((s) => `${s.weight}×${s.reps}`).join(", ");
}

function renderHome() {
  const exercises = getExercises();
  const cats = [...new Set(exercises.map((e) => e.cat))];
  const logs = getLogs();
  const today = logs[todayKey()] || [];
  const settings = getSettings();

  let todayHtml = "";
  if (today.length > 0) {
    todayHtml = h`
      <div class="today-box">
        <h3>오늘 기록</h3>
        ${today
          .map(
            (e) => h`
          <div class="entry"><span>${esc(e.exerciseName)}</span><span>${esc(
              summarizeEntry(e)
            )}</span></div>
        `
          )
          .join("")}
      </div>
    `;
  }

  let gridHtml = "";
  cats.forEach((cat) => {
    gridHtml += `<div class="category-label">${esc(cat)}</div>`;
    exercises
      .filter((e) => e.cat === cat)
      .forEach((e) => {
        gridHtml += `<button class="big-btn" data-action="pick-exercise" data-id="${esc(
          e.id
        )}">${esc(e.name)}</button>`;
      });
  });

  let syncLine = "";
  if (settings.token) {
    if (settings.lastSyncOk === true) {
      syncLine = `<div class="sync-status ok">GitHub 동기화됨 · ${new Date(
        settings.lastSync
      ).toLocaleTimeString("ko-KR")}</div>`;
    } else if (settings.lastSyncOk === false) {
      syncLine = `<div class="sync-status err">동기화 실패: ${esc(
        settings.lastSyncError || ""
      )}</div>`;
    }
  }

  app.innerHTML = h`
    ${renderTopbar("운동 기록", { onManage: true })}
    ${todayHtml}
    <div class="grid">${gridHtml}</div>
    ${syncLine}
  `;
}

function renderSetCount() {
  const nums = [1, 2, 3, 4, 5, 6, 7, 8];
  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    <div class="session-title">몇 세트 하시나요?</div>
    <div class="num-grid" style="margin-top:20px">
      ${nums
        .map((n) => `<button class="big-btn" data-action="pick-setcount" data-n="${n}">${n}</button>`)
        .join("")}
    </div>
  `;
}

function renderFlow() {
  const isReps = S.phase === "reps";
  const label = isReps ? "횟수" : "무게";
  const value = isReps ? S.draftReps : S.draftWeight;
  const unit = isReps ? "회" : "kg";
  const dots = Array.from({ length: S.targetSets }, (_, i) => {
    let cls = "dot";
    if (i < S.flowIndex) cls += " done";
    else if (i === S.flowIndex) cls += " active";
    return `<div class="${cls}"></div>`;
  }).join("");

  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    <div class="session-title">세트 ${S.flowIndex + 1} / ${S.targetSets}</div>
    <div class="progress-dots">${dots}</div>
    <div class="stepper-wrap">
      <div class="stepper-label">${label}</div>
      <div class="stepper-value">${value}<span class="unit">${unit}</span></div>
      <div class="stepper-row">
        <button class="stepper-btn" data-action="step-down">−</button>
        <button class="stepper-btn" data-action="step-up">+</button>
      </div>
      <button class="confirm-btn" data-action="confirm-step">확인 ✓</button>
    </div>
  `;
}

function renderSummary() {
  const rows = S.sets
    .map(
      (s, i) => h`
    <div class="set-row" data-action="edit-set" data-i="${i}">
      <span class="set-idx">세트 ${i + 1}</span>
      <span class="set-val">${s.weight}kg × ${s.reps}회</span>
    </div>
  `
    )
    .join("");

  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    <div class="session-title">기록 완료 · 세트를 탭하면 수정</div>
    <div class="set-list">${rows}</div>
    <div class="footer-actions">
      <button class="big-btn ghost" data-action="add-set">+ 세트 추가</button>
      <button class="confirm-btn" data-action="finish-exercise">저장하고 홈으로</button>
    </div>
  `;
}

function renderManage() {
  const exercises = getExercises();
  const rows = exercises
    .map(
      (e) => h`
    <div class="manage-row">
      <span>${esc(e.name)} <span style="color:#64748b">· ${esc(e.cat)}</span></span>
      <button class="del-btn" data-action="del-exercise" data-id="${esc(e.id)}">삭제</button>
    </div>
  `
    )
    .join("");

  app.innerHTML = h`
    ${renderTopbar("종목 관리", { onBack: true })}
    <div class="set-list">${rows}</div>
    <div class="form-row">
      <label>새 종목 이름</label>
      <input id="new-ex-name" type="text" placeholder="예: 스미스머신 스쿼트" />
    </div>
    <div class="form-row">
      <label>분류</label>
      <input id="new-ex-cat" type="text" placeholder="예: 하체" value="기타" />
    </div>
    <button class="confirm-btn" data-action="add-exercise">추가</button>
  `;
}

function renderSettings() {
  const s = getSettings();
  app.innerHTML = h`
    ${renderTopbar("설정 · GitHub 백업", { onBack: true })}
    <div class="form-row">
      <label>GitHub Personal Access Token</label>
      <input id="set-token" type="password" placeholder="ghp_..." value="${esc(s.token || "")}" />
    </div>
    <div class="form-row">
      <label>GitHub 사용자명</label>
      <input id="set-owner" type="text" value="${esc(s.owner || "")}" />
    </div>
    <div class="form-row">
      <label>저장소 이름</label>
      <input id="set-repo" type="text" value="${esc(s.repo || "")}" />
    </div>
    <div class="form-row">
      <label>파일 경로</label>
      <input id="set-path" type="text" value="${esc(s.path || "data/log.json")}" />
    </div>
    <button class="confirm-btn" data-action="save-settings">저장</button>
    <button class="big-btn ghost" style="margin-top:10px" data-action="sync-now">지금 동기화</button>
    <div class="sync-status ${s.lastSyncOk === true ? "ok" : s.lastSyncOk === false ? "err" : ""}">
      ${
        s.lastSyncOk === true
          ? `마지막 동기화: ${new Date(s.lastSync).toLocaleString("ko-KR")}`
          : s.lastSyncOk === false
          ? `실패: ${esc(s.lastSyncError || "")}`
          : "아직 동기화 안 됨"
      }
    </div>
  `;
}

/* ---------- event delegation ---------- */

app.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case "back":
      handleBack();
      break;
    case "settings":
      S.screen = "settings";
      render();
      break;
    case "manage":
      S.screen = "manage";
      render();
      break;
    case "pick-exercise": {
      const exercises = getExercises();
      const ex = exercises.find((x) => x.id === el.dataset.id);
      if (ex) pickExercise(ex);
      break;
    }
    case "pick-setcount":
      pickSetCount(Number(el.dataset.n));
      break;
    case "step-down":
      if (S.phase === "weight") S.draftWeight = Math.max(0, roundTo(S.draftWeight - WEIGHT_STEP, 2));
      else S.draftReps = Math.max(0, S.draftReps - REPS_STEP);
      render();
      break;
    case "step-up":
      if (S.phase === "weight") S.draftWeight = roundTo(S.draftWeight + WEIGHT_STEP, 2);
      else S.draftReps = S.draftReps + REPS_STEP;
      render();
      break;
    case "confirm-step":
      if (S.phase === "weight") confirmWeightStep();
      else confirmRepsStep();
      break;
    case "edit-set":
      editSet(Number(el.dataset.i));
      break;
    case "add-set":
      addExtraSet();
      break;
    case "finish-exercise":
      finishExercise();
      break;
    case "del-exercise": {
      const list = getExercises().filter((x) => x.id !== el.dataset.id);
      saveExercises(list);
      render();
      break;
    }
    case "add-exercise": {
      const nameInput = document.getElementById("new-ex-name");
      const catInput = document.getElementById("new-ex-cat");
      const name = nameInput.value.trim();
      const cat = catInput.value.trim() || "기타";
      if (!name) break;
      const id = "custom_" + name.replace(/\s+/g, "_") + "_" + Date.now();
      const list = getExercises();
      list.push({ id, name, cat });
      saveExercises(list);
      render();
      break;
    }
    case "save-settings": {
      const s = getSettings();
      s.token = document.getElementById("set-token").value.trim();
      s.owner = document.getElementById("set-owner").value.trim();
      s.repo = document.getElementById("set-repo").value.trim();
      s.path = document.getElementById("set-path").value.trim() || "data/log.json";
      saveSettings(s);
      render();
      break;
    }
    case "sync-now":
      syncToGitHub();
      break;
  }
});

function roundTo(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function handleBack() {
  if (S.screen === "setcount") {
    goHome();
  } else if (S.screen === "flow") {
    if (S.flowMode === "edit") {
      S.screen = "summary";
      render();
    } else if (S.flowIndex === 0) {
      S.screen = "setcount";
      render();
    } else {
      S.sets.pop();
      startSet(S.flowIndex - 1, "append");
    }
  } else if (S.screen === "summary") {
    S.screen = "setcount";
    S.sets = [];
    render();
  } else if (S.screen === "manage" || S.screen === "settings") {
    S.screen = "home";
    render();
  }
}

/* ---------- service worker ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
