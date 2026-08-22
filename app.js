"use strict";

/* ---------- icons ---------- */

const ICON_DUMBBELL = `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="1" y="9" width="3" height="6" rx="1"/><rect x="4.5" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/><rect x="16.5" y="7" width="3" height="10" rx="1"/><rect x="20" y="9" width="3" height="6" rx="1"/></svg>`;

/* ---------- storage helpers ---------- */

const LS = {
  exercises: "wt_exercises",
  lastUsed: "wt_lastused",
  logs: "wt_logs",
  settings: "wt_settings",
  aiCoach: "wt_ai_coach",
};

const DEFAULT_EXERCISES = [
  { id: "bench_press", name: "벤치프레스", cat: "가슴", startWeight: 20 },
  { id: "incline_bench", name: "인클라인 벤치프레스", cat: "가슴", startWeight: 20 },
  { id: "dumbbell_press", name: "덤벨 프레스", cat: "가슴", startWeight: 20 },
  { id: "dips", name: "딥스", cat: "가슴", startWeight: 20 },
  { id: "deadlift", name: "데드리프트", cat: "등", startWeight: 20 },
  { id: "barbell_row", name: "바벨로우", cat: "등", startWeight: 20 },
  { id: "lat_pulldown", name: "랫풀다운", cat: "등", startWeight: 20 },
  { id: "pullup", name: "풀업", cat: "등", startWeight: 20 },
  { id: "squat", name: "스쿼트", cat: "하체", startWeight: 20 },
  { id: "leg_press", name: "레그프레스", cat: "하체", startWeight: 20 },
  { id: "lunge", name: "런지", cat: "하체", startWeight: 20 },
  { id: "leg_curl", name: "레그컬", cat: "하체", startWeight: 20 },
  { id: "overhead_press", name: "오버헤드프레스", cat: "어깨", startWeight: 20 },
  { id: "lateral_raise", name: "사이드레터럴레이즈", cat: "어깨", startWeight: 20 },
  { id: "face_pull", name: "페이스풀", cat: "어깨", startWeight: 20 },
  { id: "barbell_curl", name: "바벨컬", cat: "팔", startWeight: 20 },
  { id: "triceps_ext", name: "트라이셉스 익스텐션", cat: "팔", startWeight: 20 },
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
    appTitle: "운동 기록",
    token: "",
    owner: "taeminPark",
    repo: "workout-data",
    path: "log.json",
    lastSync: null,
    lastSyncOk: null,
    geminiKey: "",
    geminiModel: "gemini-2.0-flash",
  });
}
function saveSettings(s) {
  saveJSON(LS.settings, s);
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function todayKey() {
  return dateKey(new Date());
}
function daysAgoKey(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
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
  weightStep: 2.5,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelected: null,
  aiLoading: false,
  aiError: null,
  syncing: false,
  logTargetDate: null,
  editingLog: null, // { date, idx } when editing an already-saved log entry
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
  S.editingLog = null;
}

function commitExercise() {
  if (!S.currentExercise || S.sets.length === 0) return;
  const logs = getLogs();

  if (S.editingLog) {
    const { date, idx } = S.editingLog;
    if (logs[date] && logs[date][idx]) {
      logs[date][idx] = {
        ...logs[date][idx],
        sets: S.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
      };
      saveLogs(logs);
      if (date === todayKey()) {
        const lastUsed = getLastUsed();
        const last = S.sets[S.sets.length - 1];
        lastUsed[S.currentExercise.id] = { weight: last.weight, reps: last.reps };
        saveLastUsed(lastUsed);
      }
      syncToGitHub();
    }
    return;
  }

  const key = S.logTargetDate || todayKey();
  if (!logs[key]) logs[key] = [];
  logs[key].push({
    exerciseId: S.currentExercise.id,
    exerciseName: S.currentExercise.name,
    sets: S.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    ts: Date.now(),
  });
  saveLogs(logs);

  if (key === todayKey()) {
    const lastUsed = getLastUsed();
    const last = S.sets[S.sets.length - 1];
    lastUsed[S.currentExercise.id] = { weight: last.weight, reps: last.reps };
    saveLastUsed(lastUsed);
  }

  syncToGitHub();
}

function startEditLogEntry(date, idx) {
  const logs = getLogs();
  const entry = logs[date] && logs[date][idx];
  if (!entry) return;
  const exercises = getExercises();
  const ex = exercises.find((x) => x.id === entry.exerciseId) || {
    id: entry.exerciseId,
    name: entry.exerciseName,
    startWeight: entry.sets[0] ? entry.sets[0].weight : 20,
  };
  resetSession();
  S.currentExercise = ex;
  S.sets = entry.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
  S.targetSets = S.sets.length;
  S.editingLog = { date, idx };
  S.screen = "summary";
  render();
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
  return { weight: S.currentExercise.startWeight ?? 20, reps: 8 };
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
  if (S.editingLog) {
    const date = S.editingLog.date;
    commitExercise();
    resetSession();
    if (date === todayKey()) {
      goHome();
    } else {
      const [y, m] = date.split("-").map(Number);
      S.calYear = y;
      S.calMonth = m - 1;
      S.calSelected = date;
      S.screen = "calendar";
      render();
    }
    return;
  }

  const targetDate = S.logTargetDate;
  commitExercise();
  if (targetDate) {
    resetSession();
    const [y, m] = targetDate.split("-").map(Number);
    S.calYear = y;
    S.calMonth = m - 1;
    S.calSelected = targetDate;
    S.logTargetDate = null;
    S.screen = "calendar";
    render();
  } else {
    goHome();
  }
}

function startBackfill() {
  S.logTargetDate = S.calSelected;
  S.screen = "backfillpick";
  render();
}

/* ---------- calendar ---------- */

function goCalendar() {
  const now = new Date();
  S.calYear = now.getFullYear();
  S.calMonth = now.getMonth();
  S.calSelected = null;
  S.screen = "calendar";
  render();
}

function calShiftMonth(delta) {
  let m = S.calMonth + delta;
  let y = S.calYear;
  if (m < 0) {
    m = 11;
    y -= 1;
  } else if (m > 11) {
    m = 0;
    y += 1;
  }
  S.calMonth = m;
  S.calYear = y;
  S.calSelected = null;
  render();
}

function calPickDay(key) {
  S.calSelected = S.calSelected === key ? null : key;
  render();
}

/* ---------- weekly coaching ---------- */

function estOneRM(weight, reps) {
  return weight * (1 + reps / 30);
}

function collectRange(fromDaysAgo, toDaysAgo) {
  const logs = getLogs();
  const exercises = getExercises();
  const map = {};
  for (let offset = toDaysAgo; offset <= fromDaysAgo; offset++) {
    const key = daysAgoKey(offset);
    const entries = logs[key];
    if (!entries) continue;
    entries.forEach((entry) => {
      if (!map[entry.exerciseId]) {
        const meta = exercises.find((x) => x.id === entry.exerciseId);
        map[entry.exerciseId] = {
          name: entry.exerciseName,
          cat: meta ? meta.cat : null,
          volume: 0,
          bestE1RM: 0,
        };
      }
      entry.sets.forEach((s) => {
        map[entry.exerciseId].volume += s.weight * s.reps;
        const e1 = estOneRM(s.weight, s.reps);
        if (e1 > map[entry.exerciseId].bestE1RM) map[entry.exerciseId].bestE1RM = e1;
      });
    });
  }
  return map;
}

const COACH_ICON = { up: "💪", down: "📉", flat: "➖", missing: "⏸️", new: "🆕" };

function generateCoaching() {
  const thisWeek = collectRange(6, 0);
  const lastWeek = collectRange(13, 7);
  const hasThis = Object.keys(thisWeek).length > 0;
  const hasLast = Object.keys(lastWeek).length > 0;

  if (!hasLast) {
    return {
      status: hasThis ? "building" : "no-data",
      items: [],
      summary: hasThis
        ? "이번 주 기록이 쌓이고 있어요. 한 주가 더 지나면 지난주와 비교한 코칭이 시작돼요."
        : null,
    };
  }

  const ids = new Set([...Object.keys(thisWeek), ...Object.keys(lastWeek)]);
  const items = [];
  ids.forEach((id) => {
    const t = thisWeek[id];
    const l = lastWeek[id];
    const name = (t || l).name;
    if (t && l) {
      const diff = ((t.bestE1RM - l.bestE1RM) / l.bestE1RM) * 100;
      if (diff > 2) {
        items.push({
          type: "up",
          name,
          msg: `지난주보다 향상됐어요 (추정 1RM ${Math.round(l.bestE1RM)}→${Math.round(
            t.bestE1RM
          )}kg). 이 흐름 그대로 유지하세요.`,
        });
      } else if (diff < -2) {
        items.push({
          type: "down",
          name,
          msg: `지난주보다 낮아졌어요. 폼과 회복 상태를 점검하고, 무게를 살짝 낮춰 안정적으로 가져가보세요.`,
        });
      } else {
        items.push({
          type: "flat",
          name,
          msg: `2주째 비슷한 수준이에요. 다음엔 무게 +2.5kg 또는 반복 +1~2회에 도전해보세요.`,
        });
      }
    } else if (l && !t) {
      items.push({ type: "missing", name, msg: `이번 주엔 쉬셨네요. 다음 주엔 꼭 챙겨보세요.` });
    } else {
      items.push({ type: "new", name, msg: `새로 시작한 종목이에요. 다음 주 흐름을 지켜볼게요.` });
    }
  });

  const exercises = getExercises();
  const allCats = [...new Set(exercises.map((e) => e.cat))];
  const trainedCats = new Set(
    [...Object.values(thisWeek), ...Object.values(lastWeek)].map((v) => v.cat).filter(Boolean)
  );
  const untouched = allCats.filter((c) => !trainedCats.has(c));
  if (untouched.length > 0 && untouched.length < allCats.length) {
    items.push({
      type: "missing",
      name: "부위 밸런스",
      msg: `최근 2주간 ${untouched.join(", ")} 부위를 안 하셨어요. 다음 주엔 추가해서 균형을 맞춰보세요.`,
    });
  }

  const totalThis = Object.values(thisWeek).reduce((a, v) => a + v.volume, 0);
  const totalLast = Object.values(lastWeek).reduce((a, v) => a + v.volume, 0);
  let summary;
  if (totalLast === 0) {
    summary = `이번 주 총 볼륨 ${Math.round(totalThis).toLocaleString()}kg.`;
  } else {
    const pct = Math.round(((totalThis - totalLast) / totalLast) * 100);
    const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "-";
    summary = `이번 주 총 볼륨 ${Math.round(totalThis).toLocaleString()}kg (지난주 대비 ${arrow} ${Math.abs(
      pct
    )}%)`;
  }

  const order = { up: 0, down: 1, missing: 2, flat: 3, new: 4 };
  items.sort((a, b) => order[a.type] - order[b.type]);

  return { status: "ready", items, summary };
}

/* ---------- AI coaching (Gemini) ---------- */

function getAICoachCache() {
  return loadJSON(LS.aiCoach, null);
}
function saveAICoachCache(obj) {
  saveJSON(LS.aiCoach, obj);
}

function buildWeeklyDataText() {
  const thisWeek = collectRange(6, 0);
  const lastWeek = collectRange(13, 7);
  const lines = [`오늘 날짜: ${todayKey()}`, "", "[이번 주 (최근 7일) 운동 기록]"];
  if (Object.keys(thisWeek).length === 0) lines.push("- 기록 없음");
  Object.values(thisWeek).forEach((v) => {
    lines.push(`- ${v.name} (${v.cat || "기타"}): 총 볼륨 ${Math.round(v.volume)}kg, 추정 1RM ${Math.round(v.bestE1RM)}kg`);
  });
  lines.push("", "[지난 주 (8~14일 전) 운동 기록]");
  if (Object.keys(lastWeek).length === 0) lines.push("- 기록 없음");
  Object.values(lastWeek).forEach((v) => {
    lines.push(`- ${v.name} (${v.cat || "기타"}): 총 볼륨 ${Math.round(v.volume)}kg, 추정 1RM ${Math.round(v.bestE1RM)}kg`);
  });
  return lines.join("\n");
}

function buildGeminiPrompt() {
  const data = buildWeeklyDataText();
  return `당신은 전문 웨이트 트레이닝 코치입니다. 아래는 회원의 최근 2주간 운동 기록 요약입니다 (볼륨=무게×횟수 합, 1RM은 Epley 공식 추정치).

${data}

이 데이터를 바탕으로 한국어로 다음 내용을 작성해주세요:
1. 이번 주 총평 (2~3문장)
2. 종목별 코멘트 (눈에 띄는 변화가 있는 종목 위주로, 각 1~2문장)
3. 다음 주 운동 방향 제안 (구체적인 무게/횟수/부위 조언 포함, 불릿 3~5개)

과도하게 formal하지 않게, 친근하지만 전문적인 트레이너 톤으로 작성하세요. 전체 400~600자 내외로 간결하게, 마크다운 헤더(##) 없이 자연스러운 문단과 "-"로 시작하는 불릿만 사용하세요.`;
}

async function callGemini(promptText) {
  const s = getSettings();
  const key = s.geminiKey;
  if (!key) throw new Error("MISSING_KEY");
  const model = s.geminiModel || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": key },
    body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini 호출 실패 (${res.status}) ${t.slice(0, 150)}`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
  if (!text) throw new Error("Gemini 응답에 텍스트가 없습니다");
  return text.trim();
}

async function generateAICoaching() {
  const rule = generateCoaching();
  if (rule.status !== "ready") return;

  S.aiLoading = true;
  S.aiError = null;
  render();
  try {
    const text = await callGemini(buildGeminiPrompt());
    saveAICoachCache({ date: todayKey(), text, generatedAt: Date.now() });
  } catch (e) {
    S.aiError = e.message === "MISSING_KEY" ? "MISSING_KEY" : String(e.message || e);
  }
  S.aiLoading = false;
  render();
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
  if (!s.token || !s.owner || !s.repo) {
    s.lastSyncOk = false;
    s.lastSyncError = "GitHub 토큰/사용자명/저장소를 먼저 입력하고 저장해주세요.";
    saveSettings(s);
    if (S.screen === "settings" || S.screen === "home") render();
    return;
  }

  S.syncing = true;
  if (S.screen === "settings" || S.screen === "home") render();

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
  S.syncing = false;
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
  if (S.screen === "calendar") return renderCalendar();
  if (S.screen === "coaching") return renderCoaching();
  if (S.screen === "aicoaching") return renderAICoaching();
  if (S.screen === "backfillpick") return renderBackfillPick();
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
      <div style="width:40px"></div>
    </div>
  `;
}

function summarizeEntry(entry) {
  return entry.sets.map((s) => `${s.weight}×${s.reps}`).join(", ");
}

function coachingTeaserHtml() {
  const c = generateCoaching();
  if (c.status === "no-data") return "";
  if (c.status === "building") {
    return h`
      <div class="coach-teaser">
        <h3>주간 코칭</h3>
        <p>${esc(c.summary)}</p>
      </div>
    `;
  }
  const preview = c.items.slice(0, 1);
  return h`
    <div class="coach-teaser" data-action="open-coaching">
      <h3>주간 코칭 · ${c.items.length}개 항목</h3>
      ${preview
        .map((i) => `<p>${COACH_ICON[i.type]} ${esc(i.name)} — ${esc(i.msg)}</p>`)
        .join("")}
      <p style="margin-top:6px;color:var(--accent);font-weight:600;">전체 보기 ›</p>
    </div>
  `;
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
            (e, i) => h`
          <div class="entry">
            <div class="entry-top">
              <span class="entry-name">${esc(e.exerciseName)}</span>
              <span class="entry-actions">
                <button class="row-edit" data-action="edit-log-entry" data-date="${todayKey()}" data-idx="${i}">✎</button>
                <button class="row-del" data-action="del-log-entry" data-date="${todayKey()}" data-idx="${i}">✕</button>
              </span>
            </div>
            <div class="entry-sets">
              ${e.sets.map((s) => `<span class="set-chip">${s.weight}×${s.reps}</span>`).join("")}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  const quickrow = h`
    <div class="quickrow">
      <button class="pill" data-action="calendar">📅 운동일정</button>
      <button class="pill" data-action="manage">${ICON_DUMBBELL} 종목설정</button>
      <button class="pill" data-action="open-ai-coaching">🤖 AI 코칭</button>
    </div>
  `;

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
    if (S.syncing) {
      syncLine = `<div class="sync-status">GitHub 동기화 중…</div>`;
    } else if (settings.lastSyncOk === true) {
      syncLine = `<div class="sync-status ok">GitHub 동기화됨 · ${new Date(
        settings.lastSync
      ).toLocaleTimeString("ko-KR")}</div>`;
    } else if (settings.lastSyncOk === false) {
      syncLine = `<div class="sync-status err">동기화 실패: ${esc(
        settings.lastSyncError || ""
      )}</div>`;
    }
  }

  const appTitle = settings.appTitle || "운동 기록";
  document.title = appTitle;

  app.innerHTML = h`
    ${renderTopbar(appTitle)}
    ${quickrow}
    ${coachingTeaserHtml()}
    ${todayHtml}
    <div class="grid">${gridHtml}</div>
    ${syncLine}
  `;
}

function renderBackfillPick() {
  const exercises = getExercises();
  const cats = [...new Set(exercises.map((e) => e.cat))];
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
  const label = S.logTargetDate.replace(/-/g, ". ");
  app.innerHTML = h`
    ${renderTopbar(`${label} 기록 추가`, { onBack: true })}
    <div class="grid">${gridHtml}</div>
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

  const controlHtml = isReps
    ? h`
      <div class="stepper-row">
        <button class="stepper-btn" data-action="step-down">−</button>
        <button class="stepper-btn" data-action="step-up">+</button>
      </div>
    `
    : h`
      <div class="dial-outer">
        <div class="dial" id="weight-dial">
          <div class="dial-ticks"></div>
          <div class="dial-knob" id="weight-dial-knob"><div class="dial-notch"></div></div>
          <div class="dial-center" id="weight-dial-center">
            <span class="dial-center-label">단위</span>
            <span class="dial-center-val" id="weight-dial-center-val">${S.weightStep}kg</span>
          </div>
        </div>
        <div class="dial-hint">돌려서 조절 · ← 내리기 · 올리기 → · 가운데를 탭하면 단위 변경</div>
      </div>
    `;

  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    <div class="session-title">세트 ${S.flowIndex + 1} / ${S.targetSets}</div>
    <div class="progress-dots">${dots}</div>
    <div class="stepper-wrap">
      <div class="stepper-label">${label}</div>
      <div class="stepper-value"><span id="draft-num">${value}</span><span class="unit">${unit}</span></div>
      ${controlHtml}
      <button class="confirm-btn" data-action="confirm-step">확인 ✓</button>
    </div>
  `;

  if (!isReps) attachDialEvents();
}

function angleDelta(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

let dialAudioCtx = null;
function playDialTick() {
  try {
    if (!dialAudioCtx) dialAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (dialAudioCtx.state === "suspended") dialAudioCtx.resume();
    const t = dialAudioCtx.currentTime;
    const osc = dialAudioCtx.createOscillator();
    const gain = dialAudioCtx.createGain();
    osc.type = "square";
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(gain).connect(dialAudioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  } catch (e) {}
}

const WEIGHT_STEP_OPTIONS = [1, 2.5, 5];

function attachDialEvents() {
  const dial = document.getElementById("weight-dial");
  const knob = document.getElementById("weight-dial-knob");
  const numEl = document.getElementById("draft-num");
  const centerValEl = document.getElementById("weight-dial-center-val");
  if (!dial || !knob) return;

  const STEP_DEG = 30; // degrees of rotation per weight step (matches the 12 tick marks)
  const CENTER_R = 44; // radius (px) of the tappable center zone
  const TAP_MOVE_LIMIT = 8; // px of movement still counted as a tap, not a drag

  let mode = null; // 'rotate' | 'tap'
  let lastAngle = 0;
  let rotation = 0;
  let accum = 0;
  let downX = 0;
  let downY = 0;

  function angleAt(clientX, clientY) {
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }

  function pulse(el) {
    if (!el) return;
    el.classList.remove("dial-pulse");
    void el.offsetWidth; // restart the animation even if it's already mid-pulse
    el.classList.add("dial-pulse");
  }

  function cycleWeightStep() {
    const idx = WEIGHT_STEP_OPTIONS.indexOf(S.weightStep);
    S.weightStep = WEIGHT_STEP_OPTIONS[(idx + 1) % WEIGHT_STEP_OPTIONS.length];
    if (centerValEl) centerValEl.textContent = `${S.weightStep}kg`;
    pulse(centerValEl);
    if (navigator.vibrate) navigator.vibrate([5, 40, 5]);
    playDialTick();
  }

  function onMove(e) {
    if (mode !== "rotate") return;
    const angle = angleAt(e.clientX, e.clientY);
    const delta = angleDelta(angle, lastAngle);
    lastAngle = angle;
    rotation += delta;
    knob.style.transform = `rotate(${rotation}deg)`;
    accum += delta;
    while (accum >= STEP_DEG) {
      S.draftWeight = roundTo(S.draftWeight + S.weightStep, 2);
      accum -= STEP_DEG;
      if (numEl) numEl.textContent = S.draftWeight;
      pulse(numEl);
      if (navigator.vibrate) navigator.vibrate(4);
      playDialTick();
    }
    while (accum <= -STEP_DEG) {
      S.draftWeight = Math.max(0, roundTo(S.draftWeight - S.weightStep, 2));
      accum += STEP_DEG;
      if (numEl) numEl.textContent = S.draftWeight;
      pulse(numEl);
      if (navigator.vibrate) navigator.vibrate(4);
      playDialTick();
    }
  }

  function onUp(e) {
    if (mode === "tap") {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < TAP_MOVE_LIMIT) cycleWeightStep();
    }
    mode = null;
    dial.classList.remove("grabbing");
    try {
      dial.releasePointerCapture(e.pointerId);
    } catch (err) {}
    dial.removeEventListener("pointermove", onMove);
    dial.removeEventListener("pointerup", onUp);
    dial.removeEventListener("pointercancel", onUp);
  }

  dial.addEventListener("pointerdown", (e) => {
    const rect = dial.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    downX = e.clientX;
    downY = e.clientY;
    dial.setPointerCapture(e.pointerId);
    if (dist <= CENTER_R) {
      mode = "tap";
    } else {
      mode = "rotate";
      dial.classList.add("grabbing");
      lastAngle = angleAt(e.clientX, e.clientY);
      accum = 0;
    }
    dial.addEventListener("pointermove", onMove);
    dial.addEventListener("pointerup", onUp);
    dial.addEventListener("pointercancel", onUp);
  });
}

function renderSummary() {
  const isEditingLog = !!S.editingLog;
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
    <div class="session-title">${
      isEditingLog ? "기록 수정 · 세트를 탭하면 수정" : "기록 완료 · 세트를 탭하면 수정"
    }</div>
    <div class="set-list">${rows}</div>
    <div class="footer-actions">
      <button class="big-btn ghost" data-action="add-set">+ 세트 추가</button>
      <button class="confirm-btn" data-action="finish-exercise">${
        isEditingLog ? "수정 저장" : "저장하고 홈으로"
      }</button>
    </div>
  `;
}

function renderManage() {
  const exercises = getExercises();
  const rows = exercises
    .map(
      (e) => h`
    <div class="manage-row">
      <span class="manage-name">${esc(e.name)} <span style="color:var(--text-3)">· ${esc(e.cat)}</span></span>
      <div class="manage-weight">
        <input type="number" inputmode="decimal" step="2.5" min="0"
          class="weight-input" data-action="set-start-weight" data-id="${esc(e.id)}"
          value="${e.startWeight ?? 20}" />
        <span class="unit-sm">kg</span>
      </div>
      <button class="del-btn" data-action="del-exercise" data-id="${esc(e.id)}">삭제</button>
    </div>
  `
    )
    .join("");

  app.innerHTML = h`
    ${renderTopbar("종목설정", { onBack: true })}
    <div class="set-list">${rows}</div>
    <div class="form-row">
      <label>새 종목 이름</label>
      <input id="new-ex-name" type="text" placeholder="예: 스미스머신 스쿼트" />
    </div>
    <div class="form-row">
      <label>분류</label>
      <input id="new-ex-cat" type="text" placeholder="예: 하체" value="기타" />
    </div>
    <div class="form-row">
      <label>시작 무게 (kg)</label>
      <input id="new-ex-weight" type="number" inputmode="decimal" step="2.5" min="0" value="20" />
    </div>
    <button class="confirm-btn" data-action="add-exercise">추가</button>
  `;
}

function renderSettings() {
  const s = getSettings();
  app.innerHTML = h`
    ${renderTopbar("설정", { onBack: true })}

    <div class="category-label" style="margin-top:0">앱</div>
    <div class="form-row">
      <label>앱 제목</label>
      <input id="set-title" type="text" placeholder="운동 기록" value="${esc(s.appTitle || "운동 기록")}" />
    </div>

    <div class="category-label" style="text-transform:none">AI 코칭 · Gemini</div>
    <div class="form-row">
      <label>Gemini API Key</label>
      <input id="set-gemini-key" type="password" placeholder="AIza..." value="${esc(s.geminiKey || "")}" />
    </div>
    <div class="form-row">
      <label>모델</label>
      <input id="set-gemini-model" type="text" value="${esc(s.geminiModel || "gemini-2.0-flash")}" />
    </div>
    <div class="sync-status" style="text-align:left;margin-top:-6px;margin-bottom:6px;">
      aistudio.google.com/apikey 에서 무료로 키를 발급받을 수 있어요.
    </div>

    <div class="category-label" style="text-transform:none">GitHub 백업</div>
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
    <button class="big-btn ghost" style="margin-top:10px" data-action="sync-now" ${S.syncing ? "disabled" : ""}>${
    S.syncing ? "동기화 중…" : "지금 GitHub 동기화"
  }</button>
    <div class="sync-status ${S.syncing ? "" : s.lastSyncOk === true ? "ok" : s.lastSyncOk === false ? "err" : ""}">
      ${
        S.syncing
          ? "GitHub에 저장하는 중이에요…"
          : s.lastSyncOk === true
          ? `마지막 동기화: ${new Date(s.lastSync).toLocaleString("ko-KR")}`
          : s.lastSyncOk === false
          ? `실패: ${esc(s.lastSyncError || "")}`
          : "아직 동기화 안 됨"
      }
    </div>
  `;
}

function renderAICoaching() {
  const cache = getAICoachCache();
  const rule = generateCoaching();
  const s = getSettings();

  let body;
  if (!s.geminiKey) {
    body = h`
      <div class="coach-summary">
        AI 코칭을 쓰려면 Gemini API 키가 필요해요.<br><br>
        1. aistudio.google.com/apikey 에서 무료로 발급<br>
        2. 설정 화면에서 키 입력 후 저장<br><br>
        무료 티어로 충분히 쓸 수 있어요.
      </div>
      <button class="confirm-btn" data-action="settings">설정으로 이동</button>
    `;
  } else if (rule.status !== "ready") {
    body = `<div class="coach-summary">${esc(
      rule.summary || "아직 코칭을 만들 만큼 기록이 쌓이지 않았어요. 최소 2주 정도 기록을 쌓아주세요."
    )}</div>`;
  } else if (S.aiLoading) {
    body = `<div class="coach-summary">코치가 이번 주 기록을 분석하고 있어요...</div>`;
  } else if (S.aiError === "MISSING_KEY") {
    body = h`
      <div class="coach-summary">Gemini API 키를 설정에서 입력해주세요.</div>
      <button class="confirm-btn" data-action="settings">설정으로 이동</button>
    `;
  } else if (S.aiError) {
    body = h`
      <div class="coach-summary" style="color:var(--red)">생성 실패: ${esc(S.aiError)}</div>
      <button class="confirm-btn" data-action="ai-generate">다시 시도</button>
    `;
  } else if (cache) {
    body = h`
      <div class="coach-summary" style="white-space:pre-wrap;line-height:1.6;">${esc(cache.text)}</div>
      <div class="sync-status">생성: ${new Date(cache.generatedAt).toLocaleString("ko-KR")}</div>
      <button class="big-btn ghost" style="margin-top:14px" data-action="ai-generate">다시 생성</button>
    `;
  } else {
    body = h`
      <div class="coach-summary">이번 주 기록을 바탕으로 전문 코칭을 받아보세요.</div>
      <button class="confirm-btn" data-action="ai-generate">AI 코칭 생성하기</button>
    `;
  }

  app.innerHTML = h`
    ${renderTopbar("AI 코칭", { onBack: true })}
    ${body}
  `;
}

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function renderCalendar() {
  const logs = getLogs();
  const y = S.calYear;
  const m = S.calMonth;
  const firstDow = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today = todayKey();

  let cells = "";
  for (let i = 0; i < firstDow; i++) {
    cells += `<div class="cal-cell empty"></div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(y, m, day));
    const hasLog = !!logs[key];
    let cls = "cal-cell";
    if (hasLog) cls += " has-log";
    if (key === today) cls += " today";
    if (key === S.calSelected) cls += " selected";
    cells += `<div class="${cls}" data-action="cal-pick-day" data-key="${key}">${day}</div>`;
  }

  let detailHtml = "";
  if (S.calSelected) {
    const entries = logs[S.calSelected] || [];
    const label = S.calSelected.replace(/-/g, ". ");
    const addBtn = `<button class="add-log-btn" data-action="backfill-start">+ 이 날짜에 기록 추가</button>`;
    if (entries.length === 0) {
      detailHtml = h`
        <div class="day-detail">
          <h3>${esc(label)} ${addBtn}</h3>
          <div class="empty-msg">기록이 없습니다</div>
        </div>
      `;
    } else {
      detailHtml = h`
        <div class="day-detail">
          <h3>${esc(label)} ${addBtn}</h3>
          <div class="set-list">
            ${entries
              .map(
                (e, i) => h`
              <div class="set-row">
                <span class="set-idx">${esc(e.exerciseName)}</span>
                <span class="row-right">
                  <span class="set-val">${esc(summarizeEntry(e))}</span>
                  <button class="row-del" data-action="del-log-entry" data-date="${S.calSelected}" data-idx="${i}">✕</button>
                </span>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }
  }

  app.innerHTML = h`
    ${renderTopbar("운동일정", { onBack: true })}
    <div class="cal-nav">
      <button class="iconbtn" data-action="cal-prev">‹</button>
      <span class="cal-month-label">${y}년 ${m + 1}월</span>
      <button class="iconbtn" data-action="cal-next">›</button>
    </div>
    <div class="cal-weekdays">${WEEKDAY_LABELS.map((d) => `<span>${d}</span>`).join("")}</div>
    <div class="cal-grid">${cells}</div>
    ${detailHtml}
  `;
}

function renderCoaching() {
  const c = generateCoaching();
  let body;
  if (c.status !== "ready") {
    body = `<div class="coach-summary">${esc(
      c.summary || "아직 코칭을 만들 만큼 기록이 쌓이지 않았어요."
    )}</div>`;
  } else {
    body = h`
      <div class="coach-summary">${esc(c.summary)}</div>
      ${c.items
        .map(
          (i) => h`
        <div class="coach-item ${i.type}">
          <div class="coach-name">${COACH_ICON[i.type]} ${esc(i.name)}</div>
          <div class="coach-msg">${esc(i.msg)}</div>
        </div>
      `
        )
        .join("")}
    `;
  }

  app.innerHTML = h`
    ${renderTopbar("주간 코칭", { onBack: true })}
    ${body}
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
    case "calendar":
      goCalendar();
      break;
    case "cal-prev":
      calShiftMonth(-1);
      break;
    case "cal-next":
      calShiftMonth(1);
      break;
    case "cal-pick-day":
      calPickDay(el.dataset.key);
      break;
    case "backfill-start":
      startBackfill();
      break;
    case "edit-log-entry": {
      startEditLogEntry(el.dataset.date, Number(el.dataset.idx));
      break;
    }
    case "del-log-entry": {
      const date = el.dataset.date;
      const idx = Number(el.dataset.idx);
      if (!confirm("이 기록을 삭제할까요?")) break;
      const logs = getLogs();
      if (logs[date]) {
        logs[date].splice(idx, 1);
        if (logs[date].length === 0) delete logs[date];
        saveLogs(logs);
        syncToGitHub();
      }
      render();
      break;
    }
    case "open-coaching":
      S.screen = "coaching";
      render();
      break;
    case "open-ai-coaching":
      S.aiError = null;
      S.screen = "aicoaching";
      render();
      break;
    case "ai-generate":
      generateAICoaching();
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
      const weightInput = document.getElementById("new-ex-weight");
      const name = nameInput.value.trim();
      const cat = catInput.value.trim() || "기타";
      const startWeight = Number(weightInput.value) || 0;
      if (!name) break;
      const id = "custom_" + name.replace(/\s+/g, "_") + "_" + Date.now();
      const list = getExercises();
      list.push({ id, name, cat, startWeight });
      saveExercises(list);
      render();
      break;
    }
    case "save-settings": {
      const s = getSettings();
      s.appTitle = document.getElementById("set-title").value.trim() || "운동 기록";
      s.geminiKey = document.getElementById("set-gemini-key").value.trim();
      s.geminiModel = document.getElementById("set-gemini-model").value.trim() || "gemini-2.0-flash";
      s.token = document.getElementById("set-token").value.trim();
      s.owner = document.getElementById("set-owner").value.trim();
      s.repo = document.getElementById("set-repo").value.trim();
      s.path = document.getElementById("set-path").value.trim() || "data/log.json";
      saveSettings(s);
      document.title = s.appTitle;
      render();
      break;
    }
    case "sync-now":
      syncToGitHub();
      break;
  }
});

app.addEventListener("change", (e) => {
  const el = e.target.closest('[data-action="set-start-weight"]');
  if (!el) return;
  const list = getExercises();
  const ex = list.find((x) => x.id === el.dataset.id);
  if (ex) {
    const val = Number(el.value);
    ex.startWeight = isNaN(val) ? 0 : val;
    saveExercises(list);
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
    if (S.editingLog) {
      const date = S.editingLog.date;
      resetSession();
      if (date === todayKey()) {
        goHome();
      } else {
        const [y, m] = date.split("-").map(Number);
        S.calYear = y;
        S.calMonth = m - 1;
        S.calSelected = date;
        S.screen = "calendar";
        render();
      }
      return;
    }
    S.screen = "setcount";
    S.sets = [];
    render();
  } else if (S.screen === "backfillpick") {
    S.logTargetDate = null;
    S.screen = "calendar";
    render();
  } else if (
    S.screen === "manage" ||
    S.screen === "settings" ||
    S.screen === "calendar" ||
    S.screen === "coaching" ||
    S.screen === "aicoaching"
  ) {
    S.screen = "home";
    render();
  }
}

/* ---------- press feedback (iOS Safari doesn't reliably fire :active on tap) ---------- */

const PRESSABLE = ".big-btn, .confirm-btn, .stepper-btn, .iconbtn, .quickrow .pill, .del-btn, .cal-cell, .set-row[data-action], .coach-teaser[data-action], .row-del, .row-edit, .add-log-btn";

function clearPressed() {
  document.querySelectorAll(".pressed").forEach((el) => el.classList.remove("pressed"));
}
document.addEventListener(
  "pointerdown",
  (e) => {
    const el = e.target.closest(PRESSABLE);
    if (el) el.classList.add("pressed");
  },
  { passive: true }
);
document.addEventListener("pointerup", clearPressed, { passive: true });
document.addEventListener("pointercancel", clearPressed, { passive: true });
document.addEventListener("pointerleave", clearPressed, true);

/* ---------- service worker ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
