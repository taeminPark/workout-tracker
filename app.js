"use strict";

/* ---------- icons ---------- */

const ICON_DUMBBELL = `<svg class="icon-svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="1" y="9" width="3" height="6" rx="1"/><rect x="4.5" y="7" width="3" height="10" rx="1"/><line x1="8" y1="12" x2="16" y2="12"/><rect x="16.5" y="7" width="3" height="10" rx="1"/><rect x="20" y="9" width="3" height="6" rx="1"/></svg>`;

const ICON_GEAR = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg>`; // Lucide "settings" (ISC license)
const ICON_PENCIL = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-4-4L4 16z"/><line x1="13.5" y1="6.5" x2="17.5" y2="10.5"/></svg>`;
const ICON_TRASH = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="M6 7l1 12.5a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`;

/* ---------- storage helpers ---------- */

const LS = {
  exercises: "wt_exercises",
  lastUsed: "wt_lastused",
  logs: "wt_logs",
  settings: "wt_settings",
  aiCoach: "wt_ai_coach",
  routines: "wt_routines",
  done: "wt_done", // { "YYYY-MM-DD": timestamp } days marked with 운동 끝
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
    appTitle: "오름",
    heightCm: "",
    weightKg: "",
    token: "",
    owner: "taeminPark",
    repo: "workout-data",
    path: "log.json",
    lastSync: null,
    lastSyncOk: null,
    geminiKey: "",
    geminiModel: "gemini-flash-lite-latest",
    weeklyGoal: 3,
    restDefault: 90,
    theme: "auto",
    weightInput: "dial",
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
  weightStep: 5,
  startStep: 5,
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  calSelected: null,
  aiLoading: false,
  aiError: null,
  syncing: false,
  restoring: false,
  settingsSaved: false,
  logTargetDate: null,
  editingLog: null, // { date, idx } when editing an already-saved log entry
  todayCollapsed: false,
  voiceStatus: "idle", // 'idle' | 'listening' | 'parsing' | 'review' | 'error' | 'unsupported'
  voiceTranscript: "",
  voiceParsed: null, // array of { exerciseId, exerciseName, noWeight, sets } once parsed
  voiceError: null,
  geminiModels: null, // array of model ids once fetched via "사용 가능한 모델 확인"
  geminiModelsLoading: false,
  geminiModelsError: null,
  restEndsAt: null, // timestamp when the running rest timer ends
  restTotal: 0,
  restDone: false,
  routine: null, // { id, name, ids, done, current } while a routine is running
  routineDraft: null, // { id, name, exerciseIds } on the routine editor
  routineEditMode: false,
  manageOpen: null, // exercise id expanded on 종목설정
  newEx: null, // { name, cat, noWeight, startWeight } while the add form is open // home's 루틴 row shows edit targets instead of start buttons
  historyId: null,
  historyFrom: "home",
  historyRange: null, // "1m" | "3m" | "all" on the 성장 detail chart
  historyXs: null,
  historyYs: null,
  historyPoints: null,
  historyUnit: "kg",
};

const WEIGHT_STEP = 2.5;
const REPS_STEP = 1;
let settingsSavedTimer = null;
let voiceRecognition = null;
let voiceFinalText = "";

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
        noWeight: !!S.currentExercise.noWeight,
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
    noWeight: !!S.currentExercise.noWeight,
    sets: S.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    ts: Date.now(),
  });
  saveLogs(logs);
  announcePR(key, logs[key].length - 1);

  if (key === todayKey()) {
    setDayDone(key, false); // logging after 운동 끝 means the workout continued
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
    noWeight: !!entry.noWeight,
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
  navDirection = "back";
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
  S.phase = S.currentExercise.noWeight ? "reps" : "weight";
  S.screen = "flow";
  render();
}

function confirmWeightStep() {
  S.phase = "reps";
  render();
}

function confirmRepsStep() {
  const weight = S.currentExercise.noWeight ? 0 : S.draftWeight;
  const value = { weight, reps: S.draftReps };
  if (S.flowMode === "edit") {
    S.sets[S.flowIndex] = value;
    S.screen = "summary";
    render();
    return;
  }
  S.sets.push(value);
  if (!S.logTargetDate && !S.editingLog) {
    unlockAudio();
    startRest(restSecFor(S.currentExercise));
  }
  if (S.sets.length < S.targetSets) {
    startSet(S.sets.length, "append");
  } else {
    S.screen = "summary";
    render();
  }
}

function backIntoPreviousSet() {
  const index = S.flowIndex - 1;
  const popped = S.sets.pop(); // the completed set we're stepping back into
  S.flowIndex = index;
  S.flowMode = "append";
  if (popped) {
    S.draftWeight = popped.weight;
    S.draftReps = popped.reps;
  } else {
    const d = defaultsForIndex(index);
    S.draftWeight = d.weight;
    S.draftReps = d.reps;
  }
  S.phase = "reps"; // land on the step that was last confirmed for that set
  S.screen = "flow";
  render();
}

function endEarly() {
  S.targetSets = S.sets.length; // drop the unstarted remaining sets
  S.screen = "summary";
  render();
}

function addExtraSet() {
  S.targetSets = S.sets.length + 1;
  startSet(S.sets.length, "append");
}

function editSet(index) {
  startSet(index, "edit");
}

function finishExercise() {
  navDirection = "back"; // completing a flow retraces the path back to where it started
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
  } else if (!advanceRoutine()) {
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
      if (entry.noWeight) return; // volume/1RM-based coaching doesn't apply to bodyweight exercises
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

function buildProfileText() {
  const s = getSettings();
  const lines = [];
  if (s.heightCm) lines.push(`키 ${s.heightCm}cm`);
  if (s.weightKg) lines.push(`몸무게 ${s.weightKg}kg`);
  return lines.length ? `[회원 정보] ${lines.join(", ")}\n` : "";
}

function buildGeminiPrompt() {
  const data = buildWeeklyDataText();
  return `당신은 전문 웨이트 트레이닝 코치입니다. 아래는 회원의 최근 2주간 운동 기록 요약입니다 (볼륨=무게×횟수 합, 1RM은 Epley 공식 추정치).

${buildProfileText()}${data}

이 데이터를 바탕으로 한국어로 다음 내용을 작성해주세요 (회원 정보가 주어졌다면 체형에 맞는 조언이 되도록 참고하세요):
1. 이번 주 총평 (2~3문장)
2. 종목별 코멘트 (눈에 띄는 변화가 있는 종목 위주로, 각 1~2문장)
3. 다음 주 운동 방향 제안 (구체적인 무게/횟수/부위 조언 포함, 불릿 3~5개)

과도하게 formal하지 않게, 친근하지만 전문적인 트레이너 톤으로 작성하세요. 전체 400~600자 내외로 간결하게, 마크다운 헤더(##) 없이 자연스러운 문단과 "-"로 시작하는 불릿만 사용하세요.`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGemini(promptText, opts) {
  const s = getSettings();
  const key = s.geminiKey;
  if (!key) throw new Error("MISSING_KEY");
  const model = s.geminiModel || "gemini-flash-lite-latest";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = { contents: [{ parts: [{ text: promptText }] }] };
  if (opts && opts.json) body.generationConfig = { responseMimeType: "application/json" };

  const maxAttempts = 3;
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const data = await res.json();
      const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
      if (!text) throw new Error("Gemini 응답에 텍스트가 없습니다");
      return text.trim();
    }
    const t = await res.text();
    // 503(과부하)/429(요청 과다)는 보통 몇 초 안에 풀리는 일시적 오류라 재시도해볼 가치가 있다.
    if ((res.status === 503 || res.status === 429) && attempt < maxAttempts) {
      lastErr = new Error(`Gemini 호출 실패 (${res.status}) ${t.slice(0, 150)}`);
      await sleep(attempt * 1200);
      continue;
    }
    throw new Error(`Gemini 호출 실패 (${res.status}) ${t.slice(0, 150)}`);
  }
  throw lastErr;
}

async function listGeminiModels() {
  const s = getSettings();
  if (!s.geminiKey) {
    S.geminiModelsError = "MISSING_KEY";
    S.geminiModels = null;
    render();
    return;
  }
  S.geminiModelsLoading = true;
  S.geminiModelsError = null;
  S.geminiModels = null;
  render();
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(s.geminiKey)}`
    );
    if (!res.ok) {
      const t = await res.text();
      throw new Error(`목록 조회 실패 (${res.status}) ${t.slice(0, 150)}`);
    }
    const data = await res.json();
    const models = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes("generateContent"))
      .map((m) => (m.name || "").replace(/^models\//, ""))
      .filter(Boolean)
      .sort();
    S.geminiModels = models;
  } catch (e) {
    S.geminiModelsError = String(e.message || e);
  }
  S.geminiModelsLoading = false;
  render();
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

/* ---------- voice log (Web Speech API + Gemini parsing) ---------- */

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function startVoiceListening() {
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    S.voiceStatus = "unsupported";
    render();
    return;
  }
  voiceFinalText = "";
  S.voiceStatus = "listening";
  S.voiceTranscript = "";
  S.voiceError = null;
  render();

  const recognition = new Ctor();
  voiceRecognition = recognition;
  recognition.lang = "ko-KR";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (e) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) voiceFinalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    S.voiceTranscript = (voiceFinalText + " " + interim).trim();
    render();
  };
  recognition.onerror = (e) => {
    S.voiceStatus = "error";
    S.voiceError = e.error === "not-allowed" ? "마이크 권한을 허용해주세요." : `음성 인식 오류: ${e.error}`;
    voiceRecognition = null;
    render();
  };
  recognition.onend = () => {
    if (voiceRecognition !== recognition) return; // superseded by a newer session
    voiceRecognition = null;
    if (S.voiceStatus === "listening") finishVoiceListening();
  };

  try {
    recognition.start();
  } catch (err) {
    S.voiceStatus = "error";
    S.voiceError = String(err.message || err);
    voiceRecognition = null;
    render();
  }
}

function stopVoiceListening() {
  if (voiceRecognition) {
    try {
      voiceRecognition.stop();
    } catch (e) {}
  }
}

function finishVoiceListening() {
  const text = voiceFinalText.trim() || S.voiceTranscript.trim();
  if (!text) {
    S.voiceStatus = "idle";
    S.voiceTranscript = "";
    render();
    return;
  }
  parseVoiceTranscript(text);
}

function stripJsonFence(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```$/, "")
    .trim();
}

function normalizeVoiceItem(it, exercises) {
  if (!it || !it.exerciseName) return null;
  const rawName = String(it.exerciseName).trim();
  if (!rawName) return null;
  const noWeight = !!it.noWeight;
  const sets = (Array.isArray(it.sets) ? it.sets : [])
    .map((s) => ({
      weight: noWeight ? 0 : Math.max(0, roundTo(Number(s.weight) || 0, 2)),
      reps: Math.max(0, Math.round(Number(s.reps) || 0)),
    }))
    .filter((s) => s.reps > 0);
  if (sets.length === 0) return null;
  const match =
    exercises.find((e) => e.name === rawName) ||
    exercises.find((e) => e.name.replace(/\s+/g, "") === rawName.replace(/\s+/g, ""));
  return {
    exerciseId: match ? match.id : null,
    exerciseName: match ? match.name : rawName,
    noWeight: match ? !!match.noWeight : noWeight,
    sets,
  };
}

function buildVoiceParsePrompt(text, exercises) {
  const names = exercises.map((e) => e.name).join(", ");
  return `당신은 운동 기록 음성 인식 도우미입니다. 아래는 사용자가 방금 마친 운동을 한국어로 말한 내용을 텍스트로 받아적은 것입니다.

사용자 발화: "${text}"

등록된 운동 종목: ${names}

이 발화를 분석해서 사용자가 말한 운동과 세트별 무게(kg)·횟수를 다음 JSON 배열 형식으로만 답하세요. 다른 설명이나 마크다운 코드블록 없이 JSON 배열만 출력하세요.

[{"exerciseName": "종목 이름", "noWeight": false, "sets": [{"weight": 40, "reps": 15}]}]

규칙:
- 종목 이름은 등록된 목록에 있으면 그 이름을 그대로 쓰고, 없으면 발화에서 언급된 이름을 그대로 쓰세요.
- "N세트"라고만 말하고 이후 무게·횟수가 N번 반복되면 각각을 별도 세트로 만드세요.
- "키로"/"킬로"/"kg"은 모두 kg 단위입니다.
- 무게 언급 없이 횟수만 있는 맨몸 운동(플랭크, 복근 등)은 noWeight를 true로 하고 각 세트는 {"reps": N}만 채우세요 (weight 필드는 생략).
- 여러 운동을 말했다면 배열에 각각 항목을 만드세요.
- 운동 정보를 전혀 알아들을 수 없으면 빈 배열 []을 반환하세요.`;
}

async function parseVoiceTranscript(text) {
  const exercises = getExercises();
  S.voiceStatus = "parsing";
  render();
  try {
    const raw = await callGemini(buildVoiceParsePrompt(text, exercises), { json: true });
    const parsed = JSON.parse(stripJsonFence(raw));
    if (!Array.isArray(parsed)) throw new Error("잘못된 응답 형식입니다");
    const items = parsed.map((it) => normalizeVoiceItem(it, exercises)).filter(Boolean);
    if (items.length === 0) {
      S.voiceStatus = "error";
      S.voiceError = "운동 내용을 알아듣지 못했어요. 다시 시도해주세요.";
      render();
      return;
    }
    S.voiceParsed = items;
    S.voiceStatus = "review";
  } catch (e) {
    S.voiceStatus = "error";
    S.voiceError = e.message === "MISSING_KEY" ? "MISSING_KEY" : String(e.message || e);
  }
  render();
}

function confirmVoiceLog() {
  if (!S.voiceParsed || S.voiceParsed.length === 0) return;
  const exercises = getExercises();
  const logs = getLogs();
  const lastUsed = getLastUsed();
  const key = todayKey();
  if (!logs[key]) logs[key] = [];
  let exListChanged = false;

  S.voiceParsed.forEach((item) => {
    let ex = (item.exerciseId && exercises.find((e) => e.id === item.exerciseId)) || exercises.find((e) => e.name === item.exerciseName);
    if (!ex) {
      ex = {
        id: "custom_" + item.exerciseName.replace(/\s+/g, "_") + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
        name: item.exerciseName,
        cat: "기타",
        startWeight: item.noWeight ? 0 : item.sets[0].weight,
        noWeight: item.noWeight,
      };
      exercises.push(ex);
      exListChanged = true;
    }
    logs[key].push({
      exerciseId: ex.id,
      exerciseName: ex.name,
      noWeight: !!ex.noWeight,
      sets: item.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
      ts: Date.now(),
    });
    const last = item.sets[item.sets.length - 1];
    lastUsed[ex.id] = { weight: last.weight, reps: last.reps };
  });

  saveLogs(logs);
  saveLastUsed(lastUsed);
  if (exListChanged) saveExercises(exercises);
  syncToGitHub();

  S.voiceStatus = "idle";
  S.voiceParsed = null;
  S.voiceTranscript = "";
  goHome();
}

/* ---------- GitHub sync ---------- */

function utf8ToB64(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}

function b64ToUtf8(b64) {
  const bin = atob(b64.replace(/\n/g, ""));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
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

    const content = JSON.stringify(
      {
        logs: getLogs(),
        exercises: getExercises(),
        routines: getRoutines(),
        appTitle: s.appTitle || "오름",
        aiCoach: getAICoachCache(),
        doneDays: getDoneDays(),
      },
      null,
      2
    );
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

async function loadFromGitHub() {
  const s = getSettings();
  if (!s.token || !s.owner || !s.repo) {
    s.lastRestoreOk = false;
    s.lastRestoreError = "GitHub 토큰/사용자명/저장소를 먼저 입력하고 저장해주세요.";
    saveSettings(s);
    if (S.screen === "settings") render();
    return;
  }
  if (!confirm("GitHub에 백업된 기록으로 이 기기의 운동 기록을 덮어씁니다. 계속할까요?")) return;

  S.restoring = true;
  render();

  const path = s.path || "data/log.json";
  const url = `https://api.github.com/repos/${s.owner}/${s.repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${s.token}`,
    Accept: "application/vnd.github+json",
  };

  try {
    const getRes = await fetch(url, { headers });
    if (getRes.status === 404) {
      throw new Error("GitHub 저장소에 백업 파일이 없습니다.");
    }
    if (!getRes.ok) {
      throw new Error(`조회 실패 (${getRes.status})`);
    }
    const data = await getRes.json();
    const parsed = JSON.parse(b64ToUtf8(data.content));

    if (parsed && typeof parsed === "object" && parsed.logs && typeof parsed.logs === "object") {
      saveLogs(parsed.logs);
      if (Array.isArray(parsed.exercises)) saveExercises(parsed.exercises);
      if (Array.isArray(parsed.routines)) saveRoutines(parsed.routines);
      if (typeof parsed.appTitle === "string" && parsed.appTitle.trim()) {
        s.appTitle = parsed.appTitle.trim();
        document.title = s.appTitle;
      }
      if (parsed.aiCoach && typeof parsed.aiCoach === "object") saveAICoachCache(parsed.aiCoach);
      if (parsed.doneDays && typeof parsed.doneDays === "object") saveDoneDays(parsed.doneDays);
    } else {
      // 이전 백업 형식 (log.json이 날짜별 기록만 담고 있던 시절) 호환
      saveLogs(parsed);
    }

    s.lastRestore = Date.now();
    s.lastRestoreOk = true;
    s.lastRestoreError = null;
  } catch (e) {
    s.lastRestoreOk = false;
    s.lastRestoreError = String(e.message || e);
  }
  saveSettings(s);
  S.restoring = false;
  render();
}

/* ---------- shared audio ---------- */

let dialAudioCtx = null;
function getAudioCtx() {
  if (!dialAudioCtx) dialAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (dialAudioCtx.state === "suspended") dialAudioCtx.resume();
  return dialAudioCtx;
}
// iOS only lets audio start inside a user gesture; call this from a tap so a later
// timer-driven sound (rest over) is allowed to play.
function unlockAudio() {
  try {
    getAudioCtx();
  } catch (e) {}
}
function playTones(tones) {
  try {
    const ctx = getAudioCtx();
    tones.forEach(([freq, at, dur]) => {
      const t = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  } catch (e) {}
}

/* ---------- toast (lives outside #app so re-renders don't wipe it) ---------- */

let toastTimer = null;
function showToast(text, kind) {
  let el = document.getElementById("toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "toast";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.className = `toast ${kind || ""}`;
  el.textContent = text;
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 4000);
}

/* ---------- rest timer ---------- */

const DEFAULT_REST_SEC = 90;
let restTicker = null;

function defaultRestSec() {
  const v = Number(getSettings().restDefault);
  return v > 0 ? v : DEFAULT_REST_SEC;
}

function restSecFor() {
  return defaultRestSec();
}

function startRest(sec) {
  S.restTotal = sec;
  S.restEndsAt = Date.now() + sec * 1000;
  S.restDone = false;
  ensureRestTicker();
}

function stopRest() {
  S.restEndsAt = null;
  S.restDone = false;
  clearInterval(restTicker);
  restTicker = null;
  const el = document.getElementById("rest-banner");
  if (el) el.remove();
}

function ensureRestTicker() {
  if (!restTicker) restTicker = setInterval(tickRest, 250);
}

function tickRest() {
  if (!S.restEndsAt) {
    clearInterval(restTicker);
    restTicker = null;
    return;
  }
  if (!S.restDone && S.restEndsAt - Date.now() <= 0) {
    S.restDone = true;
    playTones([
      [880, 0, 0.18],
      [880, 0.3, 0.18],
      [1320, 0.6, 0.4],
    ]);
    clearInterval(restTicker);
    restTicker = null;
  }
  updateRestBanner();
}

function fmtClock(sec) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function restBannerHtml() {
  if (!S.restEndsAt) return "";
  const left = (S.restEndsAt - Date.now()) / 1000;
  const frac = S.restDone ? 0 : Math.max(0, Math.min(1, left / S.restTotal));
  return h`
    <div class="rest-banner${S.restDone ? " done" : ""}" id="rest-banner">
      <svg class="rest-ring" viewBox="0 0 40 40" aria-hidden="true">
        <circle cx="20" cy="20" r="17" class="rest-ring-bg"/>
        <circle cx="20" cy="20" r="17" class="rest-ring-fg" id="rest-ring-fg" pathLength="100" stroke-dasharray="100" stroke-dashoffset="${100 - frac * 100}"/>
      </svg>
      <div class="rest-text">
        <span class="rest-label" id="rest-label">${S.restDone ? "휴식 끝, 다음 세트 시작!" : "휴식"}</span>
        <span class="rest-time" id="rest-time">${S.restDone ? "0:00" : fmtClock(left)}</span>
      </div>
      <button class="rest-btn wide" data-action="rest-skip" id="rest-skip">${S.restDone ? "닫기" : "건너뛰기"}</button>
    </div>
  `;
}

// updates text/ring in place (never replaces the buttons, so a tap mid-countdown isn't lost)
function updateRestBanner() {
  const el = document.getElementById("rest-banner");
  if (!el) return;
  const left = (S.restEndsAt - Date.now()) / 1000;
  el.classList.toggle("done", S.restDone);
  document.getElementById("rest-label").textContent = S.restDone ? "휴식 끝, 다음 세트 시작!" : "휴식";
  document.getElementById("rest-time").textContent = S.restDone ? "0:00" : fmtClock(left);
  document.getElementById("rest-skip").textContent = S.restDone ? "닫기" : "건너뛰기";
  const frac = S.restDone ? 0 : Math.max(0, Math.min(1, left / S.restTotal));
  document.getElementById("rest-ring-fg").setAttribute("stroke-dashoffset", String(100 - frac * 100));
}

/* ---------- personal records ---------- */

function entryBest(entry) {
  if (!entry.sets || entry.sets.length === 0) return 0;
  if (entry.noWeight) return Math.max(...entry.sets.map((s) => s.reps));
  return Math.max(...entry.sets.map((s) => estOneRM(s.weight, s.reps)));
}

// walks all logs in date order; an entry is a PR when it beats every earlier entry of
// the same exercise (the very first entry of an exercise has nothing to beat, so it isn't one)
function computePRs(logs) {
  const best = {};
  const prs = new Map(); // "date|idx" -> { prev, now }
  Object.keys(logs)
    .sort()
    .forEach((date) => {
      (logs[date] || []).forEach((entry, idx) => {
        const v = entryBest(entry);
        const prev = best[entry.exerciseId];
        if (prev !== undefined && v > prev + 1e-9) prs.set(`${date}|${idx}`, { prev, now: v });
        if (prev === undefined || v > prev) best[entry.exerciseId] = v;
      });
    });
  return prs;
}

function prBadge(prs, date, idx) {
  return prs.has(`${date}|${idx}`) ? `<span class="pr-badge">${ICON_STAR}신기록</span>` : "";
}

function announcePR(date, idx) {
  const logs = getLogs();
  const entry = logs[date] && logs[date][idx];
  const pr = entry && computePRs(logs).get(`${date}|${idx}`);
  if (!pr) return;
  const detail = entry.noWeight
    ? `최다 ${pr.now}회 (이전 ${pr.prev}회)`
    : `추정 1RM ${Math.round(pr.prev)}kg → ${Math.round(pr.now)}kg`;
  showToast(`🏆 ${entry.exerciseName} 신기록! ${detail}`, "gold");
  playTones([
    [660, 0, 0.14],
    [880, 0.14, 0.14],
    [1320, 0.28, 0.35],
  ]);
}

/* ---------- theme ---------- */

const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
function applyTheme() {
  const pref = getSettings().theme || "auto";
  const theme = pref === "auto" ? (darkQuery.matches ? "dark" : "light") : pref;
  document.documentElement.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "light" ? "#f2f2f7" : "#000000");
}
darkQuery.addEventListener("change", applyTheme);
applyTheme();

/* ---------- weekly goal ---------- */

function weekStart(d) {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // back to Monday
  return x;
}

function daysLoggedInWeek(logs, monday) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    days.push({ key, logged: !!(logs[key] && logs[key].length) });
  }
  return days;
}

function weeklyGoalHtml(logs, settings) {
  const goal = Math.min(7, Math.max(1, Number(settings.weeklyGoal) || 3));
  const monday = weekStart(new Date());
  const days = daysLoggedInWeek(logs, monday);
  const done = days.filter((d) => d.logged).length;
  const today = todayKey();

  // consecutive weeks that met the goal, counting this week only once it's met
  let streak = done >= goal ? 1 : 0;
  const w = new Date(monday);
  for (let i = 0; i < 104; i++) {
    w.setDate(w.getDate() - 7);
    if (daysLoggedInWeek(logs, w).filter((d) => d.logged).length >= goal) streak++;
    else break;
  }

  const text = done >= goal ? `목표 달성 ${done}/${goal}회` : `이번 주 ${done}/${goal}회`;
  const dots = days
    .map(
      (d, i) =>
        `<span class="week-day${d.logged ? " on" : ""}${d.key === today ? " today" : ""}">${"월화수목금토일"[i]}</span>`
    )
    .join("");
  return h`
    <div class="week-goal${done >= goal ? " met" : ""}">
      <div class="week-days">${dots}</div>
      <div class="week-text">${text}${streak >= 2 ? `<span class="week-streak">🔥 ${streak}주 연속</span>` : ""}</div>
    </div>
  `;
}

// "가슴, 팔, 복근 운동" — 종목설정의 부위(cat)를 기록 순서대로 중복 없이
function partsSummaryHtml(entries) {
  const exercises = getExercises();
  const parts = [
    ...new Set(
      entries
        .map((e) => (exercises.find((x) => x.id === e.exerciseId) || exercises.find((x) => x.name === e.exerciseName) || {}).cat)
        .filter(Boolean)
    ),
  ];
  if (!parts.length) return "";
  return `<div class="parts-summary">${parts.map((c) => `<b>${esc(c)}</b>`).join(", ")} 운동</div>`;
}

/* ---------- 운동 끝 (finish the day) ---------- */

const ICON_CHECK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="5 12.5 10 17 19 7"/></svg>`;
const ORDINALS = ["첫", "두", "세", "네", "다섯", "여섯", "일곱"];

function getDoneDays() {
  return loadJSON(LS.done, {});
}
function saveDoneDays(obj) {
  saveJSON(LS.done, obj);
}
function isDayDone(key) {
  return !!getDoneDays()[key];
}
function setDayDone(key, done) {
  const days = getDoneDays();
  if (done) days[key] = Date.now();
  else delete days[key];
  saveDoneDays(days);
}

function finishSummary() {
  const logs = getLogs();
  const key = todayKey();
  const today = logs[key] || [];
  const prs = computePRs(logs);
  const prByEx = {};
  today.forEach((e, i) => {
    const pr = prs.get(`${key}|${i}`);
    if (pr && (!prByEx[e.exerciseId] || pr.now > prByEx[e.exerciseId].now))
      prByEx[e.exerciseId] = { name: e.exerciseName, noWeight: !!e.noWeight, ...pr, prev: prByEx[e.exerciseId] ? prByEx[e.exerciseId].prev : pr.prev };
  });
  const sets = today.reduce((n, e) => n + e.sets.length, 0);
  const volume = today.reduce((n, e) => n + (e.noWeight ? 0 : e.sets.reduce((m, s) => m + s.weight * s.reps, 0)), 0);
  const reps = today.reduce((n, e) => n + e.sets.reduce((m, s) => m + s.reps, 0), 0);
  const goal = Math.min(7, Math.max(1, Number(getSettings().weeklyGoal) || 3));
  const week = daysLoggedInWeek(logs, weekStart(new Date()));
  return {
    exercises: today.length,
    sets,
    volume,
    reps,
    prs: Object.values(prByEx),
    goal,
    weekDone: week.filter((d) => d.logged).length,
    nth: week.filter((d) => d.logged && d.key <= key).length,
  };
}

function finishWorkout() {
  unlockAudio();
  setDayDone(todayKey(), true);
  syncToGitHub();
  render();
  showFinishCelebration(finishSummary());
}

function resumeWorkout() {
  setDayDone(todayKey(), false);
  syncToGitHub();
  render();
  showToast("다시 기록할 수 있어요. 다 하면 운동 끝을 눌러주세요.");
}

function showFinishCelebration(sum) {
  const pr = sum.prs.length > 0;
  const names = sum.prs.map((p) => p.name);
  const title = pr ? `신기록 ${sum.prs.length}개 찍고 끝!` : "오늘 운동 끝!";
  const sub = pr
    ? `${names.slice(0, 2).join(", ")}${names.length > 2 ? ` 외 ${names.length - 2}개` : ""} 기록이 올랐어요.`
    : `이번 주 ${ORDINALS[sum.nth - 1] || sum.nth} 번째 운동이에요.`;
  const third = sum.volume > 0 ? [sum.volume.toLocaleString("ko-KR"), "총 kg"] : [sum.reps, "총 횟수"];
  const prRows = sum.prs
    .map((p) => {
      const val = p.noWeight ? `${p.now}회` : `1RM ${Math.round(p.now)}kg`;
      const up = Math.round((p.now - p.prev) * 10) / 10;
      return `<div class="cel-pr">${ICON_STAR}<b>${esc(p.name)}</b><span class="cel-pr-val">${val}</span><span class="cel-pr-up">+${up}${p.noWeight ? "회" : "kg"}</span></div>`;
    })
    .join("");
  const dots = Array.from({ length: sum.goal }, (_, i) => `<i${i < sum.weekDone ? ' class="on"' : ""}></i>`).join("");
  const weekText = sum.weekDone >= sum.goal ? `이번 주 목표 달성 ${sum.weekDone}/${sum.goal}회` : `이번 주 ${sum.weekDone}/${sum.goal}회`;
  const burst = Array.from({ length: 9 }, (_, i) => {
    const a = (i / 9) * Math.PI * 2 - Math.PI / 2;
    const r = 84 + (i % 3) * 14;
    return ICON_STAR.replace(
      "<svg ",
      `<svg style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r).toFixed(0)}px;--r:${i % 2 ? 90 : -90}deg" `
    );
  }).join("");

  document.getElementById("celebrate")?.remove();
  const el = document.createElement("div");
  el.id = "celebrate";
  el.className = `celebrate${pr ? " pr" : ""}`;
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", title);
  el.innerHTML = h`
    <div class="cel-inner">
      <div class="cel-hero">
        <svg class="cel-ring" viewBox="0 0 140 140" aria-hidden="true"><circle class="track" cx="70" cy="70" r="60"/><circle class="prog" cx="70" cy="70" r="60"/></svg>
        ${
          pr
            ? `<svg class="cel-mark star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.8l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.1l7.1-.7z"/></svg><div class="cel-burst">${burst}</div>`
            : `<svg class="cel-mark chk" viewBox="0 0 60 60" aria-hidden="true"><path d="M15 31 l10 10 l20 -22"/></svg>`
        }
      </div>
      <div class="cel-date st" style="--d:0">${new Date().toLocaleDateString("ko-KR", { month: "long", day: "numeric", weekday: "long" })}</div>
      <h2 class="cel-title st" style="--d:1">${title}</h2>
      <p class="cel-sub st" style="--d:2">${esc(sub)}</p>
      <div class="cel-stats st" style="--d:3">
        <div><b>${sum.exercises}</b><span>종목</span></div>
        <div><b>${sum.sets}</b><span>세트</span></div>
        <div><b>${third[0]}</b><span>${third[1]}</span></div>
      </div>
      ${pr ? `<div class="cel-prs st" style="--d:4">${prRows}</div>` : ""}
      <div class="cel-week st" style="--d:5">${dots}<span>${weekText}</span></div>
      <button class="confirm-btn cel-ok st" style="--d:6" type="button">확인</button>
    </div>
  `;
  // tapping anywhere closes it, even mid-animation
  el.addEventListener("click", () => {
    el.classList.add("closing");
    setTimeout(() => el.remove(), 200);
  });
  document.body.appendChild(el);
  el.querySelector(".cel-ok").focus({ preventScroll: true });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // the chime lands when the ring closes so sound and motion arrive together
  setTimeout(
    () =>
      playTones(
        pr
          ? [
              [660, 0, 0.14],
              [880, 0.14, 0.14],
              [1320, 0.28, 0.35],
            ]
          : [
              [523, 0, 0.12],
              [784, 0.12, 0.3],
            ]
      ),
    reduce ? 0 : 1000
  );
}

/* ---------- routines ---------- */

function getRoutines() {
  return loadJSON(LS.routines, []);
}
function saveRoutines(list) {
  saveJSON(LS.routines, list);
}

function routineExercises(routine) {
  const exercises = getExercises();
  return routine.exerciseIds.map((id) => exercises.find((x) => x.id === id)).filter(Boolean);
}

function startRoutine(id) {
  const routine = getRoutines().find((r) => r.id === id);
  if (!routine) return;
  const list = routineExercises(routine);
  if (list.length === 0) return;
  S.routine = { id, name: routine.name, ids: list.map((x) => x.id), done: [], current: list[0].id };
  pickExercise(list[0]);
}

function routineRemaining() {
  if (!S.routine) return [];
  const exercises = getExercises();
  return S.routine.ids
    .filter((id) => id !== S.routine.current && !S.routine.done.includes(id))
    .map((id) => exercises.find((x) => x.id === id))
    .filter(Boolean);
}

// marks the current exercise done and moves to the next one left; returns false when the routine is over
function advanceRoutine() {
  if (!S.routine) return false;
  const next = routineRemaining()[0];
  S.routine.done.push(S.routine.current);
  if (next) {
    S.routine.current = next.id;
    navDirection = "forward";
    pickExercise(next);
    return true;
  }
  const name = S.routine.name;
  S.routine = null;
  showToast(`👏 ${name} 루틴 완료!`, "");
  return false;
}

// do another exercise of the routine first (e.g. the planned machine is taken)
function switchRoutineExercise(id) {
  const ex = getExercises().find((x) => x.id === id);
  if (!S.routine || !ex) return;
  S.routine.current = id;
  pickExercise(ex);
}

function routineBannerHtml() {
  if (!S.routine) return "";
  const remaining = routineRemaining();
  const n = S.routine.ids.length;
  const others = remaining
    .map((ex) => `<button class="routine-pick" data-action="routine-switch" data-id="${esc(ex.id)}">${esc(ex.name)}</button>`)
    .join("");
  return h`
    <div class="routine-banner">
      <div class="routine-banner-top">
        <span><b>${esc(S.routine.name)}</b> ${S.routine.done.length + 1}/${n}번째 종목</span>
        <button class="rest-btn wide" data-action="routine-skip">${remaining.length ? "건너뛰기" : "루틴 끝내기"}</button>
      </div>
      ${
        others
          ? `<div class="routine-banner-sub">기구가 비어 있지 않다면 다른 종목을 먼저 할 수 있어요</div><div class="routine-pick-row">${others}</div>`
          : ""
      }
    </div>
  `;
}

function openRoutineEditor(id) {
  const existing = id ? getRoutines().find((r) => r.id === id) : null;
  S.routineDraft = existing
    ? { id: existing.id, name: existing.name, exerciseIds: [...existing.exerciseIds] }
    : { id: null, name: "", exerciseIds: [] };
  S.screen = "routine";
  render();
}

function saveRoutineDraft() {
  const d = S.routineDraft;
  if (!d || !d.name.trim() || d.exerciseIds.length === 0) return;
  const list = getRoutines();
  if (d.id) {
    const r = list.find((x) => x.id === d.id);
    if (r) {
      r.name = d.name.trim();
      r.exerciseIds = d.exerciseIds;
    }
  } else {
    list.push({ id: "routine_" + Date.now(), name: d.name.trim(), exerciseIds: d.exerciseIds });
  }
  saveRoutines(list);
  syncToGitHub();
  S.routineDraft = null;
  navDirection = "back";
  S.screen = "home";
  render();
}

function routinesSectionHtml() {
  const routines = getRoutines();
  const editing = S.routineEditMode && routines.length > 0;
  const chips = routines
    .map((r) =>
      editing
        ? `<button class="routine-chip editing" data-action="edit-routine" data-id="${esc(r.id)}"><span class="routine-name">${esc(
            r.name
          )}</span><span class="routine-count">✎ 순서 바꾸기, 삭제</span></button>`
        : `<button class="routine-chip" data-action="start-routine" data-id="${esc(r.id)}"><span class="routine-name">${esc(
            r.name
          )}</span><span class="routine-count">${r.exerciseIds.length}종목</span></button>`
    )
    .join("");
  const editBtn = routines.length
    ? `<button class="label-link" data-action="toggle-routine-edit">${editing ? "완료" : "편집"}</button>`
    : "";
  return h`
    <div class="category-label">루틴${editBtn}</div>
    <div class="routine-row">
      ${chips}
      ${
        editing
          ? ""
          : `<button class="routine-chip add" data-action="new-routine"><span class="routine-name">+ 루틴 만들기</span><span class="routine-count">순서대로 진행</span></button>`
      }
    </div>
  `;
}

function renderRoutineEditor() {
  const d = S.routineDraft;
  const exercises = getExercises();
  const cats = [...new Set(exercises.map((e) => e.cat))];
  const order = d.exerciseIds
    .map((id, i) => {
      const ex = exercises.find((x) => x.id === id);
      return h`
        <div class="routine-step">
          <span class="routine-step-n">${i + 1}</span>
          <span class="routine-step-name">${esc(ex ? ex.name : "삭제된 종목")}</span>
          <button class="row-edit" data-action="routine-up" data-i="${i}" aria-label="위로" ${i === 0 ? "disabled" : ""}>↑</button>
          <button class="row-edit" data-action="routine-down" data-i="${i}" aria-label="아래로" ${i === d.exerciseIds.length - 1 ? "disabled" : ""}>↓</button>
          <button class="row-del" data-action="routine-remove" data-i="${i}" aria-label="빼기">✕</button>
        </div>
      `;
    })
    .join("");
  let picker = "";
  cats.forEach((cat) => {
    picker += `<div class="routine-pick-cat">${esc(cat)}</div><div class="routine-pick-row">`;
    exercises
      .filter((e) => e.cat === cat)
      .forEach((e) => {
        picker += `<button class="routine-pick" data-action="routine-add" data-id="${esc(e.id)}">${esc(e.name)}</button>`;
      });
    picker += `</div>`;
  });
  const canSave = d.name.trim() && d.exerciseIds.length > 0;
  app.innerHTML = h`
    ${renderTopbar(d.id ? "루틴 편집" : "루틴 만들기", { onBack: true })}
    <div class="form-row">
      <label>루틴 이름</label>
      <input id="routine-name" type="text" placeholder="예: 가슴 데이" value="${esc(d.name)}" />
    </div>
    <div class="category-label" style="margin-top:6px">진행 순서</div>
    ${order ? `<div class="routine-steps">${order}</div>` : `<div class="empty-msg">아래에서 종목을 탭하면 순서대로 추가돼요.</div>`}
    <div class="category-label">종목 추가</div>
    ${picker}
    <div class="footer-actions">
      ${d.id ? `<button class="big-btn ghost danger" data-action="routine-delete">루틴 삭제</button>` : ""}
      <button class="confirm-btn" data-action="routine-save" ${canSave ? "" : "disabled"}>저장</button>
    </div>
  `;
}

/* ---------- growth (all exercises) ---------- */

const ICON_GROWTH = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>`;
const ICON_STAR = `<svg class="star-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1.8l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.1l7.1-.7z"/></svg>`;
const GROWTH_DAYS = 92; // the "3개월" window used for the list's gain and the detail's default range
const HIST_RANGES = [
  ["1m", "1개월", 31],
  ["3m", "3개월", GROWTH_DAYS],
  ["all", "전체", null],
];

function goGrowth() {
  S.screen = "growth";
  render();
}

function fmtDateLong(key) {
  const [, m, d] = key.split("-").map(Number);
  return `${m}월 ${d}일`;
}

// best value reached before `sinceKey`, or the first day's value when nothing is older
function gainSince(days, sinceKey) {
  const best = Math.max(...days.map((d) => d.v));
  const before = days.filter((d) => d.date < sinceKey);
  const base = sinceKey ? (before.length ? Math.max(...before.map((d) => d.v)) : days[0].v) : days[0].v;
  return best - base;
}

function fmtGain(g, unit) {
  return g > 0.05 ? `▲ ${Math.round(g * 10) / 10}${unit}` : "변화 없음";
}

function sparkSvg(vals) {
  const W = 64, H = 26, P = 3;
  const lo = Math.min(...vals), hi = Math.max(...vals);
  const d = vals
    .map((v, i) => {
      const x = P + (vals.length > 1 ? i / (vals.length - 1) : 0.5) * (W - 2 * P);
      const y = hi === lo ? H / 2 : P + (1 - (v - lo) / (hi - lo)) * (H - 2 * P);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `<svg class="spark${hi === lo ? " flat" : ""}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${d}"/></svg>`;
}

function growthRows(logs, prs) {
  const since = daysAgoKey(GROWTH_DAYS);
  return getExercises()
    .map((ex) => {
      const days = historyDays(historySessions(ex.id, logs, prs));
      if (!days.length) return null;
      const last = days[days.length - 1];
      return {
        ex,
        days,
        best: Math.max(...days.map((d) => d.v)),
        gain: gainSince(days, since),
        lastPr: [...days].reverse().find((d) => d.pr),
        lastDate: last.date,
        unit: last.noWeight ? "회" : "kg",
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.lastDate < b.lastDate ? 1 : a.lastDate > b.lastDate ? -1 : 0));
}

function renderGrowth() {
  const logs = getLogs();
  const prs = computePRs(logs);
  const rows = growthRows(logs, prs);
  let body;
  if (!rows.length) {
    body = `<div class="empty-msg">아직 기록이 없어요.<br>운동을 기록하면 종목별 성장이 여기에 쌓여요.</div>`;
  } else {
    const month = todayKey().slice(0, 7);
    const monthPrs = [...prs.keys()].filter((k) => k.startsWith(month)).length;
    const top = rows.filter((r) => r.unit === "kg" && r.gain > 0.05).sort((a, b) => b.gain - a.gain)[0];
    const list = rows
      .map(
        (r) => h`
        <button class="grow-row" data-action="open-history" data-id="${esc(r.ex.id)}">
          <span class="grow-name">${esc(r.ex.name)}<small>${
            r.lastPr ? `${ICON_STAR}${fmtDateLong(r.lastPr.date)} 신기록` : `${daysAgoLabel(r.lastDate)} 기록`
          }</small></span>
          ${sparkSvg(r.days.slice(-12).map((d) => d.v))}
          <span class="grow-val"><b>${Math.round(r.best)}<small>${r.unit}</small></b><span class="grow-gain${
            r.gain > 0.05 ? "" : " flat"
          }">${fmtGain(r.gain, r.unit)}</span></span>
        </button>`
      )
      .join("");
    body = h`
      <div class="grow-sum">
        <div><b>${ICON_STAR}${monthPrs}번</b><span>${Number(month.slice(5))}월 신기록</span></div>
        <div><b>${top ? esc(top.ex.name) : "—"}</b><span>3개월 동안 가장 많이 성장</span></div>
      </div>
      <div class="category-label">최근 운동한 순</div>
      <p class="manage-intro">추정 1RM 최고 기록(횟수 종목은 최다 횟수)과 최근 3개월 동안 오른 만큼이에요.</p>
      <div class="grow-list">${list}</div>
    `;
  }
  app.innerHTML = h`
    ${renderTopbar("성장", { onBack: true })}
    ${body}
    ${tabbarHtml("growth")}
  `;
}

/* ---------- exercise history ---------- */

function openHistory(id) {
  S.historyId = id;
  S.historyFrom = S.screen;
  S.historyRange = null; // picked on first render
  S.screen = "history";
  render();
}

function historySessions(id, logs, prs) {
  const sessions = [];
  Object.keys(logs)
    .sort()
    .forEach((date) => {
      (logs[date] || []).forEach((entry, idx) => {
        if (entry.exerciseId !== id || !entry.sets.length) return;
        const top = entry.sets.reduce((a, s) => (s.weight > a.weight || (s.weight === a.weight && s.reps > a.reps) ? s : a));
        const pr = prs.get(`${date}|${idx}`);
        sessions.push({ date, entry, best: entryBest(entry), top, pr: !!pr, prPrev: pr ? pr.prev : null });
      });
    });
  return sessions;
}

// one point per day: the day's best session
function historyDays(sessions) {
  const days = [];
  sessions.forEach((s) => {
    const p = { date: s.date, v: s.best, pr: s.pr, prPrev: s.prPrev, top: s.top, entry: s.entry, noWeight: !!s.entry.noWeight };
    const prev = days[days.length - 1];
    if (prev && prev.date === p.date) {
      if (p.v > prev.v) Object.assign(prev, p, { pr: prev.pr || p.pr, prPrev: prev.prPrev ?? p.prPrev });
      else if (p.pr) Object.assign(prev, { pr: true, prPrev: prev.prPrev ?? p.prPrev });
    } else days.push(p);
  });
  return days;
}

function fmtDate(key) {
  const [, m, d] = key.split("-").map(Number);
  return `${m}. ${d}`;
}

const HIST_W = 340, HIST_H = 190, HIST_L = 34, HIST_R = 16, HIST_T = 18, HIST_B = 26;

function historyChartSvg(points, unit) {
  const W = HIST_W, H = HIST_H, L = HIST_L, R = HIST_R, T = HIST_T, B = HIST_B;
  const t0 = new Date(points[0].date).getTime();
  const t1 = new Date(points[points.length - 1].date).getTime();
  const vals = points.map((p) => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pad = Math.max(1, (hi - lo) * 0.15);
  lo = Math.max(0, lo - pad);
  hi = hi + pad;
  const x = (p) => (t1 === t0 ? (L + W - R) / 2 : L + ((new Date(p.date).getTime() - t0) / (t1 - t0)) * (W - L - R));
  const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  S.historyXs = points.map((p) => x(p));
  S.historyYs = points.map((p) => y(p.v));
  const grid = [lo, (lo + hi) / 2, hi]
    .map(
      (g) =>
        `<line x1="${L}" x2="${W - R}" y1="${y(g)}" y2="${y(g)}" class="hist-grid"/><text x="${L - 6}" y="${y(g) + 4}" class="hist-axis" text-anchor="end">${Math.round(g)}</text>`
    )
    .join("");
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const area = `${path} L${x(points[points.length - 1]).toFixed(1)},${H - B} L${x(points[0]).toFixed(1)},${H - B} Z`;
  const last = points[points.length - 1];
  const marks = points
    .map((p) =>
      p.pr
        ? `<path class="hist-star" transform="translate(${(x(p) - 8).toFixed(1)},${(y(p.v) - 8).toFixed(1)}) scale(0.667)" d="M12 1.8l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.1l7.1-.7z"/>`
        : `<circle cx="${x(p).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="4" class="hist-dot"/>`
    )
    .join("");
  return h`
    <svg class="hist-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${fmtDateLong(points[0].date)} ${Math.round(points[0].v)}${unit}에서 ${fmtDateLong(last.date)} ${Math.round(last.v)}${unit}까지 변화 그래프">
      ${grid}
      <text x="${L}" y="${H - 6}" class="hist-axis">${fmtDate(points[0].date)}</text>
      <text x="${W - R}" y="${H - 6}" class="hist-axis" text-anchor="end">${fmtDate(last.date)}</text>
      <path d="${area}" class="hist-area"/>
      <path d="${path}" class="hist-line"/>
      <line id="hist-cross" class="hist-cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/>
      ${marks}
      <circle id="hist-ring" class="hist-ring" r="8" cx="0" cy="0" visibility="hidden"/>
    </svg>
  `;
}

function historyReadout(p) {
  const unit = S.historyUnit;
  if (!p) {
    const pts = S.historyPoints;
    return `<b>${fmtDateLong(pts[0].date)} ~ ${fmtDateLong(pts[pts.length - 1].date)}</b><span>그래프를 눌러 그날 기록 보기</span>`;
  }
  const detail = p.noWeight
    ? `세트 ${p.entry.sets.map((s) => `${s.reps}회`).join(", ")}`
    : `가장 무거운 세트 ${p.top.weight}kg × ${p.top.reps}회`;
  return `<b>${fmtDateLong(p.date)} · ${Math.round(p.v)}${unit}${p.pr ? " · 신기록" : ""}</b><span>${esc(detail)}</span>`;
}

function renderHistory() {
  const ex = getExercises().find((x) => x.id === S.historyId) || { id: S.historyId, name: "종목" };
  const logs = getLogs();
  const sessions = historySessions(S.historyId, logs, computePRs(logs));
  const noWeight = sessions.length ? !!sessions[sessions.length - 1].entry.noWeight : !!ex.noWeight;
  const unit = noWeight ? "회" : "kg";
  const metric = noWeight ? "최다 횟수" : "추정 1RM";
  S.historyUnit = unit;
  S.historyPoints = null;

  let body;
  if (sessions.length === 0) {
    body = `<div class="empty-msg">아직 기록이 없어요. 이 종목을 한 번 기록하면 여기에 쌓여요.</div>`;
  } else {
    const days = historyDays(sessions);
    const sinceOf = (key) => {
      const r = HIST_RANGES.find((x) => x[0] === key);
      return r[2] ? daysAgoKey(r[2]) : "";
    };
    if (!S.historyRange) S.historyRange = days.filter((d) => d.date >= sinceOf("3m")).length >= 2 ? "3m" : "all";
    const since = sinceOf(S.historyRange);
    const rangeLabel = HIST_RANGES.find((x) => x[0] === S.historyRange)[1];
    const pts = days.filter((d) => d.date >= since);
    const best = Math.max(...days.map((d) => d.v));
    const gain = gainSince(days, since);
    const inRange = sessions.filter((s) => s.date >= since);
    const heaviest = inRange.length ? inRange.reduce((a, s) => (s.top.weight > a.top.weight ? s : a)) : null;
    const prCount = pts.filter((d) => d.pr).length;

    const hero = h`
      <div class="hist-hero">
        <div class="hist-hero-label">${
          noWeight ? "최다 횟수" : `추정 1RM <button class="hist-info" data-action="rm-info" aria-label="추정 1RM 설명">i</button>`
        }</div>
        <div class="hist-hero-num">${Math.round(best)}<small>${unit}</small></div>
        <div class="hist-hero-gain${gain > 0.05 ? "" : " flat"}">${fmtGain(gain, unit)}<span> · ${
          S.historyRange === "all" ? "첫 기록보다" : `최근 ${rangeLabel} 동안`
        }</span></div>
      </div>`;
    const seg =
      days.length >= 2
        ? `<div class="segmented hist-seg">${HIST_RANGES.map(
            ([k, l]) => `<button class="seg-btn${k === S.historyRange ? " active" : ""}" data-action="hist-range" data-v="${k}">${l}</button>`
          ).join("")}</div>`
        : "";
    let chart;
    if (days.length < 2) chart = `<div class="empty-msg">두 번 이상 기록하면 변화 그래프가 그려져요.</div>`;
    else if (pts.length < 2)
      chart = `<div class="empty-msg">최근 ${rangeLabel} 동안은 기록이 ${pts.length ? "한 번뿐" : "없어"}요.<br>기간을 늘려보세요.</div>`;
    else {
      S.historyPoints = pts;
      chart = h`
        <div class="hist-card">
          <div class="hist-readout" id="hist-readout">${historyReadout(null)}</div>
          ${historyChartSvg(pts, unit)}
          <div class="hist-legend"><span><i></i>${metric}</span><span>${ICON_STAR}신기록</span></div>
        </div>`;
    }
    const stats = noWeight
      ? [
          [`${inRange.length}번`, "운동한 횟수"],
          [`${prCount}번`, "신기록"],
        ]
      : [
          [heaviest ? `${heaviest.top.weight}kg × ${heaviest.top.reps}` : "—", "가장 무거운 세트"],
          [`${inRange.length}번`, "운동한 횟수"],
        ];
    const prDays = pts.filter((d) => d.pr).reverse();
    const prList = prDays.length
      ? h`
        <div class="category-label">신기록 ${prDays.length}번</div>
        <div class="hist-prs">${prDays
          .slice(0, 5)
          .map(
            (d) => h`
          <div class="hist-pr">${ICON_STAR}<span class="hist-pr-date">${fmtDate(d.date)}</span><span class="hist-pr-val">${Math.round(d.v)}${unit}${
              noWeight ? "" : `<small>${d.top.weight}kg × ${d.top.reps}</small>`
            }</span><span class="hist-pr-up">+${Math.round((d.v - d.prPrev) * 10) / 10}${unit}</span></div>`
          )
          .join("")}</div>`
      : "";
    const recent = sessions
      .slice(-10)
      .reverse()
      .map(
        (s) => h`
        <div class="day-set-card">
          <div class="day-set-head">
            <span class="day-set-name">${fmtDateLong(s.date)}${s.pr ? ` <span class="pr-badge">${ICON_STAR}신기록</span>` : ""}</span>
            <span class="hist-best">${noWeight ? `${s.best}회` : `1RM ${Math.round(s.best)}kg`}</span>
          </div>
          <div class="day-set-chips">
            ${s.entry.sets.map((st) => `<span class="day-set-chip">${esc(setChipLabel(s.entry, st))}</span>`).join("")}
          </div>
        </div>`
      )
      .join("");
    body = h`
      ${hero}
      ${seg}
      ${chart}
      <div class="hist-stats">${stats.map(([v, l]) => `<div class="hist-stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
      ${prList}
      <div class="category-label">최근 기록</div>
      <div class="set-list">${recent}</div>
    `;
  }
  app.innerHTML = h`
    ${renderTopbar(ex.name, { onBack: true })}
    ${body}
  `;
}

function showHistoryPoint(i) {
  const p = S.historyPoints && S.historyPoints[i];
  const out = document.getElementById("hist-readout");
  const cross = document.getElementById("hist-cross");
  const ring = document.getElementById("hist-ring");
  if (!p || !out || !cross || !ring) return;
  out.innerHTML = historyReadout(p);
  const x = S.historyXs[i], y = S.historyYs[i];
  cross.setAttribute("x1", x);
  cross.setAttribute("x2", x);
  ring.setAttribute("cx", x);
  ring.setAttribute("cy", y);
  cross.setAttribute("visibility", "visible");
  ring.setAttribute("visibility", "visible");
}

// press or drag across the chart to read the nearest day (vertical drags still scroll: touch-action pan-y)
let histScrubbing = false;
function scrubHistory(e) {
  const svg = document.querySelector(".hist-chart");
  if (!svg || !S.historyXs) return;
  const r = svg.getBoundingClientRect();
  const px = ((e.clientX - r.left) / r.width) * HIST_W;
  let bi = 0;
  S.historyXs.forEach((x, i) => {
    if (Math.abs(x - px) < Math.abs(S.historyXs[bi] - px)) bi = i;
  });
  showHistoryPoint(bi);
}
document.addEventListener("pointerdown", (e) => {
  if (S.screen !== "history" || !e.target.closest(".hist-chart")) return;
  histScrubbing = true;
  scrubHistory(e);
});
document.addEventListener("pointermove", (e) => {
  if (histScrubbing) scrubHistory(e);
});
["pointerup", "pointercancel"].forEach((t) => document.addEventListener(t, () => (histScrubbing = false)));

/* ---------- long press (exercise → history, routine → edit) ---------- */

let longPressTimer = null;
let longPressFired = false;
let longPressStart = null;
document.addEventListener(
  "pointerdown",
  (e) => {
    const el = e.target.closest(".ex-btn, .routine-chip[data-id]");
    longPressFired = false;
    clearTimeout(longPressTimer);
    if (!el) return;
    longPressStart = [e.clientX, e.clientY];
    longPressTimer = setTimeout(() => {
      longPressFired = true;
      clearPressed();
      if (navigator.vibrate) navigator.vibrate(10);
      if (el.classList.contains("ex-btn")) openHistory(el.dataset.id);
      else openRoutineEditor(el.dataset.id);
    }, 550);
  },
  { passive: true }
);
document.addEventListener(
  "pointermove",
  (e) => {
    if (!longPressStart) return;
    if (Math.hypot(e.clientX - longPressStart[0], e.clientY - longPressStart[1]) > 10) {
      clearTimeout(longPressTimer);
      longPressStart = null;
    }
  },
  { passive: true }
);
["pointerup", "pointercancel"].forEach((t) =>
  document.addEventListener(
    t,
    () => {
      clearTimeout(longPressTimer);
      longPressStart = null;
    },
    { passive: true }
  )
);

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

let lastScreen = S.screen;
let navDirection = "forward"; // set to "back" right before a render() that should retrace its entry path
let savedHomeScroll = 0; // scroll position of the home screen, restored on return so logging the next exercise doesn't require re-scrolling

function renderAndRestoreScroll() {
  renderScreen();
  lastScreen = S.screen;
  if (S.screen === "home") window.scrollTo(0, savedHomeScroll);
  updateWakeLock();
}

function render() {
  const screenChanged = S.screen !== lastScreen;
  const direction = navDirection;
  navDirection = "forward";

  if (lastScreen === "home" && S.screen !== "home") {
    savedHomeScroll = window.scrollY;
  }

  if (!screenChanged || typeof document.startViewTransition !== "function") {
    renderAndRestoreScroll();
    return;
  }

  document.documentElement.dataset.navDir = direction;
  const transition = document.startViewTransition(() => {
    renderAndRestoreScroll();
  });
  transition.finished.finally(() => {
    delete document.documentElement.dataset.navDir;
  });
}

function renderScreen() {
  if (S.screen === "home") return renderHome();
  if (S.screen === "setcount") return renderSetCount();
  if (S.screen === "flow") return renderFlow();
  if (S.screen === "summary") return renderSummary();
  if (S.screen === "manage") return renderManage();
  if (S.screen === "settings") return renderSettings();
  if (S.screen === "calendar") return renderCalendar();
  if (S.screen === "coaching") return renderCoaching();
  if (S.screen === "aicoaching") return renderAICoaching();
  if (S.screen === "voicelog") return renderVoiceLog();
  if (S.screen === "backfillpick") return renderBackfillPick();
  if (S.screen === "routine") return renderRoutineEditor();
  if (S.screen === "history") return renderHistory();
  if (S.screen === "growth") return renderGrowth();
}

function renderTopbar(title, opts) {
  opts = opts || {};
  return h`
    <div class="topbar">
      ${
        opts.onBack
          ? `<button class="iconbtn" data-action="back">‹</button>`
          : `<button class="iconbtn" data-action="settings" aria-label="설정">${ICON_GEAR}</button>`
      }
      <h1>${esc(title)}</h1>
      ${opts.right || `<div style="width:40px"></div>`}
    </div>
  `;
}

function summarizeEntry(entry) {
  if (entry.noWeight) return entry.sets.map((s) => `${s.reps}회`).join(", ");
  return entry.sets.map((s) => `${s.weight}×${s.reps}`).join(", ");
}

function setChipLabel(entry, s) {
  return entry.noWeight ? `${s.reps}회` : `${s.weight}kg × ${s.reps}회`;
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

const ICON_HOME = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3.2 2.8 11a1 1 0 0 0 1.3 1.5l.9-.8V20a1.5 1.5 0 0 0 1.5 1.5h3.5v-6h4v6h3.5A1.5 1.5 0 0 0 19 20v-8.3l.9.8a1 1 0 0 0 1.3-1.5z"/></svg>`;
const ICON_CALENDAR = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5"/><line x1="3.5" y1="10" x2="20.5" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/></svg>`;
const ICON_SPARKLE = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 2.5c.4 4.6 2.9 7.1 7.5 7.5-4.6.4-7.1 2.9-7.5 7.5-.4-4.6-2.9-7.1-7.5-7.5 4.6-.4 7.1-2.9 7.5-7.5zM18.5 14c.2 2.3 1.2 3.3 3.5 3.5-2.3.2-3.3 1.2-3.5 3.5-.2-2.3-1.2-3.3-3.5-3.5 2.3-.2 3.3-1.2 3.5-3.5z"/></svg>`;
const ICON_MIC = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0"/><line x1="12" y1="17.5" x2="12" y2="21"/></svg>`;

// shared by the four top-level screens so the bar stays put while switching tabs
function tabbarHtml(active) {
  const tabs = [
    ["home", "back", ICON_HOME, "홈"],
    ["calendar", "calendar", ICON_CALENDAR, "운동일정"],
    ["growth", "growth", ICON_GROWTH, "성장"],
    ["manage", "manage", ICON_DUMBBELL, "종목설정"],
    ["aicoaching", "open-ai-coaching", ICON_SPARKLE, "AI 코칭"],
  ];
  return h`
    <div class="tabbar-spacer"></div>
    <nav class="tabbar">
      ${tabs
        .map(([screen, action, icon, label]) =>
          screen === active
            ? `<button class="tab-btn active" aria-current="page">${icon}<span>${label}</span></button>`
            : `<button class="tab-btn" data-action="${action}">${icon}<span>${label}</span></button>`
        )
        .join("")}
    </nav>
  `;
}

// most recent entry per exercise: { weight, reps, noWeight, date }
function lastEntries(logs) {
  const out = {};
  Object.keys(logs)
    .sort()
    .forEach((date) => {
      logs[date].forEach((entry) => {
        const last = entry.sets[entry.sets.length - 1];
        if (last) out[entry.exerciseId] = { ...last, noWeight: !!entry.noWeight, date };
      });
    });
  return out;
}

function daysAgoLabel(date) {
  const days = Math.round((new Date(todayKey()) - new Date(date)) / 86400000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  return `${days}일 전`;
}

function renderHome() {
  const exercises = getExercises();
  const cats = [...new Set(exercises.map((e) => e.cat))];
  const logs = getLogs();
  const today = logs[todayKey()] || [];
  const settings = getSettings();
  const prs = computePRs(logs);

  let todayHtml = "";
  const dayDone = isDayDone(todayKey());
  if (today.length > 0) {
    todayHtml = h`
      <div class="today-box${S.todayCollapsed ? " collapsed" : ""}">
        <div class="today-box-head" data-action="toggle-today">
          <h3>오늘</h3>
          ${dayDone ? `<span class="done-chip">${ICON_CHECK}운동 끝</span>` : ""}
          <span class="today-count">${today.length}개 종목, ${today.reduce((n, e) => n + e.sets.length, 0)}세트</span>
          <span class="today-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg></span>
        </div>
        ${dayDone ? partsSummaryHtml(today) : ""}
        <div class="today-entries">
          ${today
            .map(
              (e, i) => h`
            <div class="entry">
              <div class="entry-top">
                <span class="entry-name">${esc(e.exerciseName)}${prBadge(prs, todayKey(), i)}</span>
                <span class="entry-actions">
                  <button class="row-edit" data-action="edit-log-entry" data-date="${todayKey()}" data-idx="${i}" aria-label="수정">${ICON_PENCIL}</button>
                  <button class="row-del" data-action="del-log-entry" data-date="${todayKey()}" data-idx="${i}" aria-label="삭제">${ICON_TRASH}</button>
                </span>
              </div>
              <div class="entry-sets">
                ${e.sets
                  .map((s) => `<span class="set-chip">${e.noWeight ? `${s.reps}회` : `${s.weight}×${s.reps}`}</span>`)
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      ${
        dayDone
          ? `<button class="big-btn ghost resume-btn" data-action="resume-workout">운동 이어하기</button>`
          : `<button class="finish-btn" data-action="finish-workout">${ICON_CHECK}운동 끝</button>`
      }
    `;
  }

  const jumpHtml = cats.length
    ? h`
      <div class="jump-box">
        <h3>오늘 무슨 운동?</h3>
        <div class="jump-chips">${cats
          .map((c) => `<button class="jump-chip" data-action="jump-cat" data-cat="${esc(c)}">${esc(c)}</button>`)
          .join("")}</div>
      </div>`
    : "";

  const lastByEx = lastEntries(logs);
  let gridHtml = "";
  cats.forEach((cat) => {
    gridHtml += `<div class="category-label" data-cat="${esc(cat)}">${esc(cat)}</div>`;
    exercises
      .filter((e) => e.cat === cat)
      .forEach((e) => {
        const last = lastByEx[e.id];
        const lastHtml = last
          ? `<span class="ex-ago">${daysAgoLabel(last.date)}</span><span class="ex-num">${
              last.noWeight ? last.reps : last.weight
            }<small>${last.noWeight ? "회" : "kg"}</small></span>`
          : `<span class="ex-num empty">—</span>`;
        gridHtml += `<button class="big-btn ex-btn" data-action="pick-exercise" data-id="${esc(
          e.id
        )}"><span class="ex-name">${esc(e.name)}</span>${lastHtml}</button>`;
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

  const appTitle = settings.appTitle || "오름";
  document.title = appTitle;

  app.innerHTML = h`
    <header class="home-header">
      <h1>${esc(appTitle)}</h1>
      <button class="iconbtn" data-action="settings" aria-label="설정">${ICON_GEAR}</button>
    </header>
    ${weeklyGoalHtml(logs, settings)}
    ${jumpHtml}
    ${restBannerHtml()}
    ${todayHtml}
    <div class="grid">${routinesSectionHtml()}${gridHtml}</div>
    <p class="home-tip">종목 버튼을 길게 누르면 성장 그래프를 볼 수 있어요.</p>
    ${coachingTeaserHtml()}
    ${syncLine}
    ${tabbarHtml("home")}
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
    ${restBannerHtml()}
    ${routineBannerHtml()}
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

  const weightInput = getSettings().weightInput || "dial";
  const controlHtml = isReps
    ? h`
      <div class="stepper-row">
        <button class="stepper-btn" data-action="step-down">−</button>
        <button class="stepper-btn" data-action="step-up">+</button>
      </div>
    `
    : weightInput === "ruler"
    ? h`
      <div class="ruler-wrap"><div class="weight-ruler" id="weight-ruler"><div class="ruler-track" id="weight-ruler-track"></div></div></div>
      <div class="dial-hint">좌우로 밀어서 맞춰요.</div>
    `
    : weightInput === "wheel"
    ? h`
      <div class="wheels">
        <div class="wheel" id="wheel-int"></div>
        <div class="wheel wheel-frac" id="wheel-frac"></div>
        <span class="wheel-unit">kg</span>
      </div>
      <div class="dial-hint">위아래로 굴려서 가운데 줄에 맞춰요.</div>
    `
    : h`
      <div class="dial-outer">
        <div class="dial" id="weight-dial">
          <div class="dial-knob" id="weight-dial-knob">
            <div class="dial-ticks minor"></div>
            <div class="dial-ticks major"></div>
            <div class="dial-notch"></div>
          </div>
          <div class="dial-pointer"></div>
          <div class="dial-center" id="weight-dial-center">
            <span class="dial-center-label">단위</span>
            <span class="dial-center-val" id="weight-dial-center-val">${S.weightStep}kg</span>
          </div>
        </div>
        <div class="dial-hint">시계 방향으로 돌리면 무게가 올라가요.<br>가운데를 탭하면 단위가 바뀌어요.</div>
      </div>
    `;

  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    ${restBannerHtml()}
    <div class="session-title">세트 ${S.flowIndex + 1} / ${S.targetSets}</div>
    <div class="progress-dots">${dots}</div>
    <div class="stepper-wrap">
      <div class="stepper-label">${label}</div>
      <div class="stepper-value"${
        isReps ? ' data-action="edit-reps"' : ""
      }><span id="draft-num">${value}</span><span class="unit">${unit}</span></div>
      ${controlHtml}
      <button class="confirm-btn" data-action="confirm-step">확인 ✓</button>
      ${
        S.flowMode === "append" && S.sets.length > 0
          ? `<button class="end-early-btn" data-action="end-early">${S.sets.length}세트로 끝내기</button>`
          : ""
      }
    </div>
  `;

  if (!isReps) {
    if (weightInput === "ruler") attachRulerEvents();
    else if (weightInput === "wheel") attachWheelEvents();
    else attachDialEvents();
  }
}

function startEditReps() {
  if (S.phase !== "reps") return;
  const wrap = document.querySelector(".stepper-value");
  const numEl = document.getElementById("draft-num");
  if (!wrap || !numEl || wrap.querySelector(".draft-num-input")) return;

  const input = document.createElement("input");
  input.type = "tel";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.className = "draft-num-input";
  input.value = String(S.draftReps);
  numEl.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const commit = () => {
    if (done) return;
    done = true;
    const v = parseInt(input.value, 10);
    S.draftReps = Number.isFinite(v) && v >= 0 ? v : 0;
    render();
  };
  input.addEventListener("blur", commit);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") input.blur();
  });
}

function angleDelta(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function playDialTick() {
  try {
    const ctx = getAudioCtx();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 900;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.05, t + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.03);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.04);
  } catch (e) {}
}

const WEIGHT_STEP_OPTIONS = [1, 5, 10];

function weightTick() {
  const numEl = document.getElementById("draft-num");
  if (numEl) {
    numEl.textContent = S.draftWeight;
    numEl.classList.remove("dial-pulse");
    void numEl.offsetWidth;
    numEl.classList.add("dial-pulse");
  }
  if (navigator.vibrate) navigator.vibrate(4);
  playDialTick();
}

// weight ruler: one tick per 1kg, scroll-snapped under a fixed center pointer
const RULER_TICK_PX = 12;

function attachRulerEvents() {
  const ruler = document.getElementById("weight-ruler");
  const track = document.getElementById("weight-ruler-track");
  if (!ruler || !track) return;
  const max = Math.max(300, Math.ceil(S.draftWeight) + 50);
  let html = '<div class="ruler-pad"></div>';
  for (let i = 0; i <= max; i++) {
    const cls = i % 10 === 0 ? " m10" : i % 5 === 0 ? " m5" : "";
    html += `<div class="ruler-tick${cls}">${i % 10 === 0 ? `<span>${i}</span>` : ""}</div>`;
  }
  html += '<div class="ruler-pad"></div>';
  track.innerHTML = html;
  track.style.setProperty("--ruler-pad", `${ruler.clientWidth / 2 - RULER_TICK_PX / 2}px`);

  // only a scroll that lands on a different tick changes the weight, so 57.5 stays 57.5 until the ruler is moved
  let lastIdx = Math.floor(S.draftWeight);
  ruler.scrollLeft = lastIdx * RULER_TICK_PX;
  ruler.addEventListener("scroll", () => {
    const idx = Math.max(0, Math.min(max, Math.round(ruler.scrollLeft / RULER_TICK_PX)));
    if (idx === lastIdx) return;
    lastIdx = idx;
    S.draftWeight = idx;
    weightTick();
  }, { passive: true });
}

// weight wheels: whole kg on the left, .0 / .5 on the right (iOS picker style)
const WHEEL_ROW_PX = 40;
const WHEEL_FRACS = [0, 0.5];

function attachWheelEvents() {
  const wi = document.getElementById("wheel-int");
  const wf = document.getElementById("wheel-frac");
  if (!wi || !wf) return;
  const max = Math.max(300, Math.ceil(S.draftWeight) + 50);
  const rows = (items) => `<div class="wheel-pad"></div>${items.map((x) => `<div class="wheel-row">${x}</div>`).join("")}<div class="wheel-pad"></div>`;
  wi.innerHTML = rows(Array.from({ length: max + 1 }, (_, i) => i));
  wf.innerHTML = rows(WHEEL_FRACS.map((f) => `.${String(f).split(".")[1] || "0"}`));

  let intIdx = Math.floor(S.draftWeight);
  let fracIdx = S.draftWeight - intIdx >= 0.5 ? 1 : 0;
  wi.scrollTop = intIdx * WHEEL_ROW_PX;
  wf.scrollTop = fracIdx * WHEEL_ROW_PX;

  const onScroll = (el, isInt) => () => {
    const count = isInt ? max + 1 : WHEEL_FRACS.length;
    const idx = Math.max(0, Math.min(count - 1, Math.round(el.scrollTop / WHEEL_ROW_PX)));
    if (idx === (isInt ? intIdx : fracIdx)) return;
    if (isInt) intIdx = idx;
    else fracIdx = idx;
    S.draftWeight = intIdx + WHEEL_FRACS[fracIdx];
    weightTick();
  };
  wi.addEventListener("scroll", onScroll(wi, true), { passive: true });
  wf.addEventListener("scroll", onScroll(wf, false), { passive: true });
}

function attachDialEvents() {
  const dial = document.getElementById("weight-dial");
  const knob = document.getElementById("weight-dial-knob");
  const numEl = document.getElementById("draft-num");
  const centerValEl = document.getElementById("weight-dial-center-val");
  const notchEl = knob ? knob.querySelector(".dial-notch") : null;
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
      pulse(notchEl);
      if (navigator.vibrate) navigator.vibrate(4);
      playDialTick();
    }
    while (accum <= -STEP_DEG) {
      S.draftWeight = Math.max(0, roundTo(S.draftWeight - S.weightStep, 2));
      accum += STEP_DEG;
      if (numEl) numEl.textContent = S.draftWeight;
      pulse(numEl);
      pulse(notchEl);
      if (navigator.vibrate) navigator.vibrate(4);
      playDialTick();
    }
  }

  function snapToNearestTick() {
    // accum is the leftover rotation since the last committed weight step, so
    // rotation - accum is always the exact tick angle of that last committed step.
    const lastCommittedAngle = rotation - accum;
    let extraSteps = 0;
    if (accum >= STEP_DEG / 2) extraSteps = 1;
    else if (accum <= -STEP_DEG / 2) extraSteps = -1;

    if (extraSteps > 0) {
      S.draftWeight = roundTo(S.draftWeight + S.weightStep, 2);
    } else if (extraSteps < 0) {
      S.draftWeight = Math.max(0, roundTo(S.draftWeight - S.weightStep, 2));
    }
    if (extraSteps !== 0 && numEl) numEl.textContent = S.draftWeight;

    const snapped = lastCommittedAngle + extraSteps * STEP_DEG;
    const landed = snapped !== rotation;
    rotation = snapped;
    accum = 0;
    knob.style.transition = "transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1)";
    knob.style.transform = `rotate(${rotation}deg)`;
    const clearTransition = () => {
      knob.style.transition = "";
      knob.removeEventListener("transitionend", clearTransition);
    };
    knob.addEventListener("transitionend", clearTransition);
    if (landed) {
      pulse(notchEl);
      if (extraSteps !== 0) pulse(numEl);
      if (navigator.vibrate) navigator.vibrate(6);
      if (extraSteps !== 0) playDialTick();
    }
  }

  function onUp(e) {
    if (mode === "tap") {
      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (moved < TAP_MOVE_LIMIT) cycleWeightStep();
    } else if (mode === "rotate") {
      snapToNearestTick();
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
      knob.style.transition = ""; // cancel any leftover snap-back easing so this drag tracks the finger instantly
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
      <span class="row-right">
        <span class="set-val">${S.currentExercise.noWeight ? `${s.reps}회` : `${s.weight}kg × ${s.reps}회`}</span>
        ${
          S.sets.length > 1
            ? `<button class="row-del" data-action="del-set" data-i="${i}" aria-label="세트 ${i + 1} 삭제">${ICON_TRASH}</button>`
            : ""
        }
      </span>
    </div>
  `
    )
    .join("");

  app.innerHTML = h`
    ${renderTopbar(S.currentExercise.name, { onBack: true })}
    ${restBannerHtml()}
    <div class="session-title">${
      isEditingLog ? "기록 수정 · 세트를 탭하면 수정" : "기록 완료 · 세트를 탭하면 수정"
    }</div>
    <div class="set-list">${rows}</div>
    <div class="footer-actions">
      <button class="big-btn ghost" data-action="add-set">+ 세트 추가</button>
      <button class="confirm-btn" data-action="finish-exercise">${
        isEditingLog ? "수정 저장" : S.routine && routineRemaining().length ? "저장하고 다음 종목" : "저장하고 홈으로"
      }</button>
    </div>
  `;
}

const ICON_CHEVRON = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>`;

function switchHtml(action, id, on, label) {
  return h`
    <label class="ios-switch">
      <input type="checkbox" data-action="${action}" ${id ? `data-id="${esc(id)}"` : ""} ${on ? "checked" : ""} aria-label="${esc(label)}" />
      <span class="ios-switch-track"><span class="ios-switch-thumb"></span></span>
    </label>
  `;
}

function weightStepperHtml(action, id, value) {
  const idAttr = id ? `data-id="${esc(id)}"` : "";
  return h`
    <div class="mini-stepper">
      <button class="mini-step mini-step-unit" data-action="start-step-unit" aria-label="단위 바꾸기">${S.startStep}kg</button>
      <button class="mini-step" data-action="${action}" ${idAttr} data-d="-${S.startStep}" aria-label="${S.startStep}kg 내리기">−</button>
      <span class="mini-step-val"><input type="number" inputmode="decimal" step="any" min="0"
        class="mini-step-input" data-action="${action === "sw-step" ? "set-start-weight" : "new-ex-weight"}" ${idAttr} value="${value}" /><span>kg</span></span>
      <button class="mini-step" data-action="${action}" ${idAttr} data-d="${S.startStep}" aria-label="${S.startStep}kg 올리기">+</button>
    </div>
  `;
}

function manageAddFormHtml(cats) {
  const d = S.newEx;
  const catChips = cats
    .map(
      (c) =>
        `<button class="routine-pick${d.cat === c ? " selected" : ""}" data-action="new-ex-cat" data-cat="${esc(c)}">${esc(c)}</button>`
    )
    .join("");
  return h`
    <div class="ex-group add-card">
      <div class="add-card-title">새 종목</div>
      <input id="new-ex-name" class="plain-input" type="text" placeholder="종목 이름 (예: 스미스머신 스쿼트)" value="${esc(d.name)}" />
      <div class="add-card-label">부위</div>
      <div class="routine-pick-row">${catChips}</div>
      <input id="new-ex-cat" class="plain-input small" type="text" placeholder="새 부위 직접 입력" value="${esc(cats.includes(d.cat) ? "" : d.cat)}" />
      <div class="ex-setting">
        <span>횟수만 기록 <small>플랭크, 복근처럼 무게 없는 운동</small></span>
        ${switchHtml("new-ex-noweight", null, d.noWeight, "횟수만 기록")}
      </div>
      ${d.noWeight ? "" : h`<div class="ex-setting"><span>처음 시작 무게</span>${weightStepperHtml("new-ex-step", null, d.startWeight)}</div>`}
      <div class="add-card-actions">
        <button class="pill-btn" data-action="cancel-add-exercise">취소</button>
        <button class="pill-btn primary" data-action="add-exercise" ${d.name.trim() ? "" : "disabled"}>추가</button>
      </div>
    </div>
  `;
}

function renderManage() {
  const exercises = getExercises();
  const cats = [...new Set(exercises.map((e) => e.cat))];

  const groups = cats
    .map((cat) => {
      const rows = exercises
        .filter((e) => e.cat === cat)
        .map((e) => {
          const open = S.manageOpen === e.id;
          const meta = e.noWeight ? "횟수 기록" : `시작 ${e.startWeight ?? 20}kg`;
          return h`
            <div class="ex-item${open ? " open" : ""}">
              <button class="ex-row" data-action="manage-open" data-id="${esc(e.id)}" aria-expanded="${open}">
                <span class="ex-row-name">${esc(e.name)}</span>
                <span class="ex-row-meta">${meta}</span>
                <span class="ex-row-chev">${ICON_CHEVRON}</span>
              </button>
              ${
                open
                  ? h`
                <div class="ex-panel">
                  <div class="ex-setting">
                    <span>횟수만 기록</span>
                    ${switchHtml("toggle-noweight", e.id, e.noWeight, "횟수만 기록")}
                  </div>
                  ${
                    e.noWeight
                      ? ""
                      : h`<div class="ex-setting"><span>처음 시작 무게</span>${weightStepperHtml("sw-step", e.id, e.startWeight ?? 20)}</div>`
                  }
                  <div class="ex-panel-actions">
                    <button class="pill-btn danger" data-action="del-exercise" data-id="${esc(e.id)}">삭제</button>
                  </div>
                </div>`
                  : ""
              }
            </div>
          `;
        })
        .join("");
      const count = exercises.filter((e) => e.cat === cat).length;
      return h`
        <div class="category-label">${esc(cat)}<span class="label-count">${count}</span></div>
        <div class="ex-group">${rows}</div>
      `;
    })
    .join("");

  const addBtn = `<button class="iconbtn" data-action="toggle-add-exercise" aria-label="종목 추가">+</button>`;
  app.innerHTML = h`
    ${renderTopbar("종목설정", { onBack: true, right: addBtn })}
    ${S.newEx ? manageAddFormHtml(cats) : ""}
    <p class="manage-intro">종목을 탭하면 시작 무게를 바꾸거나 삭제할 수 있어요. 처음 하는 종목은 시작 무게부터 채워져요.</p>
    ${groups}
    ${tabbarHtml("manage")}
  `;
}

function renderSettings() {
  const s = getSettings();
  app.innerHTML = h`
    ${renderTopbar("설정", { onBack: true })}

    <div class="category-label" style="margin-top:0">앱</div>
    <div class="form-row">
      <label>앱 제목</label>
      <input id="set-title" type="text" placeholder="오름" value="${esc(s.appTitle || "오름")}" />
    </div>
    <div class="form-row">
      <label>주간 운동 목표 (회)</label>
      <input id="set-weekly-goal" type="number" inputmode="numeric" min="1" max="7" value="${esc(String(s.weeklyGoal || 3))}" />
    </div>
    <div class="form-row">
      <label>세트 사이 기본 휴식 시간 (초)</label>
      <input id="set-rest-default" type="number" inputmode="numeric" min="5" step="15" value="${esc(String(defaultRestSec()))}" />
    </div>
    <div class="form-row">
      <label>무게 입력 방식</label>
      <div class="segmented">
        ${[["dial", "다이얼"], ["ruler", "눈금자"], ["wheel", "휠"]]
          .map(
            ([v, l]) =>
              `<button class="seg-btn${(s.weightInput || "dial") === v ? " active" : ""}" data-action="set-weight-input" data-v="${v}">${l}</button>`
          )
          .join("")}
      </div>
    </div>
    <div class="form-row">
      <label>화면 테마</label>
      <div class="segmented">
        ${[["auto", "자동"], ["light", "라이트"], ["dark", "다크"]]
          .map(
            ([v, l]) =>
              `<button class="seg-btn${(s.theme || "auto") === v ? " active" : ""}" data-action="set-theme" data-v="${v}">${l}</button>`
          )
          .join("")}
      </div>
    </div>

    <div class="category-label" style="text-transform:none">신체 정보</div>
    <div class="form-row new-ex-options">
      <span class="manage-weight">
        <input id="set-height" type="number" inputmode="decimal" step="0.1" min="0" placeholder="키" class="weight-input" style="width:72px" value="${esc(s.heightCm || "")}" />
        <span class="unit-sm">cm</span>
      </span>
      <span class="manage-weight">
        <input id="set-weight" type="number" inputmode="decimal" step="0.1" min="0" placeholder="몸무게" class="weight-input" style="width:72px" value="${esc(s.weightKg || "")}" />
        <span class="unit-sm">kg</span>
      </span>
    </div>
    <div class="new-ex-hint">키/몸무게를 입력하면 AI 코칭이 체형에 맞춰 조언해줘요.</div>

    <div class="category-label" style="text-transform:none">AI 코칭 · Gemini</div>
    <div class="form-row">
      <label>Gemini API Key</label>
      <input id="set-gemini-key" type="password" placeholder="AIza..." value="${esc(s.geminiKey || "")}" />
    </div>
    <div class="form-row">
      <label>모델</label>
      <input id="set-gemini-model" type="text" value="${esc(s.geminiModel || "gemini-flash-lite-latest")}" />
    </div>
    <button class="big-btn ghost" style="margin-top:-4px" data-action="check-gemini-models" ${
      S.geminiModelsLoading ? "disabled" : ""
    }>${S.geminiModelsLoading ? "확인 중…" : "사용 가능한 모델 확인"}</button>
    ${
      S.geminiModelsError
        ? `<div class="sync-status err">${esc(
            S.geminiModelsError === "MISSING_KEY" ? "키를 먼저 입력해주세요." : S.geminiModelsError
          )}</div>`
        : ""
    }
    ${
      S.geminiModels
        ? h`
      <div class="today-box" style="margin-top:8px">
        <div class="sync-status" style="text-align:left;margin-top:0;">모델을 눌러 위 입력칸에 채우세요:</div>
        <div class="model-pick-list">
          ${S.geminiModels
            .map((m) => `<button class="pill" data-action="pick-gemini-model" data-name="${esc(m)}">${esc(m)}</button>`)
            .join("")}
        </div>
      </div>
    `
        : ""
    }
    <div class="sync-status" style="text-align:left;margin-top:-2px;margin-bottom:6px;">
      aistudio.google.com/apikey 에서 무료로 키를 발급받을 수 있어요. 모델 이름은 구글이 종종 변경/폐기하니 "모델 확인" 버튼으로 최신 목록을 확인하세요.
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
    ${S.settingsSaved ? `<div class="save-toast">✓ 저장되었습니다</div>` : ""}
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

    <button class="big-btn ghost" style="margin-top:10px" data-action="restore-now" ${
      S.restoring ? "disabled" : ""
    }>${S.restoring ? "불러오는 중…" : "GitHub에서 불러오기 (이 기기 덮어쓰기)"}</button>
    <div class="sync-status ${
      S.restoring ? "" : s.lastRestoreOk === true ? "ok" : s.lastRestoreOk === false ? "err" : ""
    }">
      ${
        S.restoring
          ? "GitHub에서 불러오는 중이에요…"
          : s.lastRestoreOk === true
          ? `마지막 복원: ${new Date(s.lastRestore).toLocaleString("ko-KR")}`
          : s.lastRestoreOk === false
          ? `실패: ${esc(s.lastRestoreError || "")}`
          : "아직 복원한 적 없음"
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
    ${tabbarHtml("aicoaching")}
  `;
}

function renderVoiceLog() {
  const s = getSettings();
  let body;

  if (!s.geminiKey) {
    body = h`
      <div class="coach-summary">
        음성 기록을 쓰려면 Gemini API 키가 필요해요.<br><br>
        1. aistudio.google.com/apikey 에서 무료로 발급<br>
        2. 설정 화면에서 키 입력 후 저장
      </div>
      <button class="confirm-btn" data-action="settings">설정으로 이동</button>
    `;
  } else if (S.voiceStatus === "unsupported") {
    body = `<div class="coach-summary">이 브라우저는 음성 인식을 지원하지 않아요. 안드로이드 Chrome에서 사용해주세요.</div>`;
  } else if (S.voiceStatus === "review" && S.voiceParsed) {
    body = h`
      <div class="today-box">
        <div class="today-entries">
          ${S.voiceParsed
            .map(
              (item, i) => h`
            <div class="entry">
              <div class="entry-top">
                <span class="entry-name">${esc(item.exerciseName)}${
                item.exerciseId ? "" : ` <span class="voice-new-badge">신규</span>`
              }</span>
                <span class="entry-actions">
                  <button class="row-del" data-action="voice-remove-item" data-idx="${i}">✕</button>
                </span>
              </div>
              <div class="entry-sets">
                ${item.sets
                  .map((st) => `<span class="set-chip">${item.noWeight ? `${st.reps}회` : `${st.weight}kg × ${st.reps}회`}</span>`)
                  .join("")}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
      <button class="confirm-btn" data-action="voice-save">오늘 기록에 저장</button>
      <button class="big-btn ghost" style="margin-top:10px" data-action="voice-retry">다시 녹음</button>
    `;
  } else if (S.voiceStatus === "parsing") {
    body = `<div class="coach-summary">방금 말한 내용을 분석하고 있어요...</div>`;
  } else if (S.voiceStatus === "error") {
    body = h`
      <div class="coach-summary" style="color:var(--red)">${
        S.voiceError === "MISSING_KEY"
          ? "Gemini API 키를 설정에서 입력해주세요."
          : esc(S.voiceError || "오류가 발생했어요.")
      }</div>
      <button class="confirm-btn" data-action="voice-retry">다시 시도</button>
    `;
  } else {
    const listening = S.voiceStatus === "listening";
    body = h`
      <div class="voice-mic-wrap">
        <button class="voice-mic-btn${listening ? " listening" : ""}" data-action="voice-toggle">${
      listening ? "⏹" : "🎙️"
    }</button>
        <div class="voice-hint">${listening ? "듣고 있어요… 끝나면 다시 눌러주세요" : "눌러서 오늘 한 운동을 말해보세요"}</div>
        ${listening ? `<div class="voice-transcript">${esc(S.voiceTranscript || "")}</div>` : ""}
        <div class="voice-example">예시: "벤치프레스 4세트, 40키로 15개, 50키로 15개, 60키로 12개, 70키로 10개"</div>
      </div>
    `;
  }

  app.innerHTML = h`
    ${renderTopbar("음성기록", { onBack: true })}
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
  const prs = computePRs(logs);
  const prDates = new Set([...prs.keys()].map((k) => k.split("|")[0]));

  let cells = "";
  for (let i = 0; i < firstDow; i++) {
    cells += `<div class="cal-cell empty"></div>`;
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const key = dateKey(new Date(y, m, day));
    const hasLog = !!logs[key];
    let cls = "cal-cell";
    if (hasLog) cls += " has-log";
    if (prDates.has(key)) cls += " has-pr";
    if (key === today) cls += " today";
    if (key === S.calSelected) cls += " selected";
    const star = prDates.has(key) ? `<span class="cal-pr">${ICON_STAR}</span>` : "";
    const label = `${m + 1}월 ${day}일${hasLog ? ", 운동한 날" : ""}${star ? ", 신기록" : ""}`;
    cells += `<div class="${cls}" data-action="cal-pick-day" data-key="${key}" aria-label="${label}">${day}${star}</div>`;
  }

  // 이번 달은 오늘까지, 지난 달은 한 달 전체를 분모로. 미래 달은 표시 안 함.
  const monthPrefix = `${y}-${String(m + 1).padStart(2, "0")}`;
  const monthDays = monthPrefix === today.slice(0, 7) ? Number(today.slice(8)) : monthPrefix < today.slice(0, 7) ? daysInMonth : 0;
  const workedDays = Object.keys(logs).filter((k) => k.startsWith(monthPrefix) && logs[k].length > 0).length;
  const summaryHtml = monthDays
    ? `<div class="cal-summary">${monthPrefix === today.slice(0, 7) ? "오늘까지 " : ""}${monthDays}일 중 <b>${workedDays}일</b> 운동했어요</div>`
    : "";

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
          ${partsSummaryHtml(entries)}
          <div class="set-list">
            ${entries
              .map(
                (e, i) => h`
              <div class="day-set-card">
                <div class="day-set-head">
                  <span class="day-set-name">${esc(e.exerciseName)}${prBadge(prs, S.calSelected, i)}</span>
                  <span class="entry-actions">
                    <button class="row-edit" data-action="edit-log-entry" data-date="${S.calSelected}" data-idx="${i}" aria-label="수정">${ICON_PENCIL}</button>
                    <button class="row-del" data-action="del-log-entry" data-date="${S.calSelected}" data-idx="${i}" aria-label="삭제">${ICON_TRASH}</button>
                  </span>
                </div>
                <div class="day-set-chips">
                  ${e.sets
                    .map(
                      (s, si) => h`
                    <span class="day-set-chip"><span class="chip-n">${si + 1}</span>${esc(setChipLabel(e, s))}</span>
                  `
                    )
                    .join("")}
                </div>
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
    ${summaryHtml}
    <div class="cal-weekdays">${WEEKDAY_LABELS.map((d) => `<span>${d}</span>`).join("")}</div>
    <div class="cal-grid">${cells}</div>
    <div class="cal-legend"><span><i class="cal-legend-log"></i>운동한 날</span><span><span class="cal-pr">${ICON_STAR}</span>신기록</span></div>
    ${detailHtml}
    ${tabbarHtml("calendar")}
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
  if (longPressFired && (action === "pick-exercise" || action === "start-routine")) {
    longPressFired = false;
    return;
  }

  switch (action) {
    case "rest-skip":
      stopRest();
      break;
    case "start-routine":
      startRoutine(el.dataset.id);
      break;
    case "new-routine":
      openRoutineEditor(null);
      break;
    case "routine-add":
      S.routineDraft.exerciseIds.push(el.dataset.id);
      render();
      break;
    case "routine-remove":
      S.routineDraft.exerciseIds.splice(Number(el.dataset.i), 1);
      render();
      break;
    case "routine-up": {
      const i = Number(el.dataset.i);
      const ids = S.routineDraft.exerciseIds;
      if (i > 0) [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]];
      render();
      break;
    }
    case "routine-down": {
      const i = Number(el.dataset.i);
      const ids = S.routineDraft.exerciseIds;
      if (i < ids.length - 1) [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]];
      render();
      break;
    }
    case "routine-switch":
      switchRoutineExercise(el.dataset.id);
      break;
    case "toggle-routine-edit":
      S.routineEditMode = !S.routineEditMode;
      render();
      break;
    case "edit-routine":
      S.routineEditMode = false;
      openRoutineEditor(el.dataset.id);
      break;
    case "set-weight-input": {
      const st = getSettings();
      st.weightInput = el.dataset.v;
      saveSettings(st);
      render();
      break;
    }
    case "set-theme": {
      const st = getSettings();
      st.theme = el.dataset.v;
      saveSettings(st);
      applyTheme();
      render();
      break;
    }
    case "routine-save":
      saveRoutineDraft();
      break;
    case "routine-delete":
      if (!confirm("이 루틴을 삭제할까요?")) break;
      saveRoutines(getRoutines().filter((r) => r.id !== S.routineDraft.id));
      syncToGitHub();
      S.routineDraft = null;
      navDirection = "back";
      S.screen = "home";
      render();
      break;
    case "routine-skip":
      if (!advanceRoutine()) goHome();
      break;
    case "open-history":
      openHistory(el.dataset.id);
      break;
    case "hist-range":
      S.historyRange = el.dataset.v;
      render();
      break;
    case "rm-info":
      showToast("추정 1RM은 무게와 횟수로 계산한 1회 최대 무게예요");
      break;
    case "growth":
      goGrowth();
      break;
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
    case "check-gemini-models": {
      const keyInput = document.getElementById("set-gemini-key");
      if (keyInput) {
        const s = getSettings();
        s.geminiKey = keyInput.value.trim();
        saveSettings(s);
      }
      listGeminiModels();
      break;
    }
    case "pick-gemini-model": {
      const modelInput = document.getElementById("set-gemini-model");
      if (modelInput) modelInput.value = el.dataset.name;
      break;
    }
    case "open-voice-log":
      S.voiceStatus = "idle";
      S.voiceParsed = null;
      S.voiceTranscript = "";
      S.voiceError = null;
      S.screen = "voicelog";
      render();
      break;
    case "voice-toggle":
      if (S.voiceStatus === "listening") stopVoiceListening();
      else startVoiceListening();
      break;
    case "voice-remove-item": {
      const idx = Number(el.dataset.idx);
      if (S.voiceParsed) {
        S.voiceParsed.splice(idx, 1);
        if (S.voiceParsed.length === 0) {
          S.voiceStatus = "idle";
          S.voiceParsed = null;
        }
        render();
      }
      break;
    }
    case "voice-save":
      confirmVoiceLog();
      break;
    case "voice-retry":
      S.voiceStatus = "idle";
      S.voiceParsed = null;
      S.voiceTranscript = "";
      S.voiceError = null;
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
    case "edit-reps":
      startEditReps();
      break;
    case "finish-workout":
      finishWorkout();
      break;
    case "resume-workout":
      resumeWorkout();
      break;
    case "jump-cat": {
      const label = [...document.querySelectorAll(".grid .category-label")].find((l) => l.dataset.cat === el.dataset.cat);
      if (label) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        label.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }
      break;
    }
    case "toggle-today":
      S.todayCollapsed = !S.todayCollapsed;
      render();
      break;
    case "confirm-step":
      if (S.phase === "weight") confirmWeightStep();
      else confirmRepsStep();
      break;
    case "edit-set":
      editSet(Number(el.dataset.i));
      break;
    case "end-early":
      endEarly();
      break;
    case "del-set":
      S.sets.splice(Number(el.dataset.i), 1);
      S.targetSets = S.sets.length;
      render();
      break;
    case "add-set":
      addExtraSet();
      break;
    case "finish-exercise":
      finishExercise();
      break;
    case "del-exercise": {
      const target = getExercises().find((x) => x.id === el.dataset.id);
      if (!target || !confirm(`${target.name} 종목을 삭제할까요? 지금까지의 기록은 그대로 남아요.`)) break;
      const list = getExercises().filter((x) => x.id !== el.dataset.id);
      saveExercises(list);
      render();
      break;
    }
    case "toggle-add-exercise":
      S.newEx = S.newEx ? null : { name: "", cat: getExercises()[0]?.cat || "기타", noWeight: false, startWeight: 20 };
      render();
      if (S.newEx) document.getElementById("new-ex-name")?.focus();
      break;
    case "cancel-add-exercise":
      S.newEx = null;
      render();
      break;
    case "new-ex-cat":
      S.newEx.cat = el.dataset.cat;
      render();
      break;
    case "start-step-unit":
      S.startStep = WEIGHT_STEP_OPTIONS[(WEIGHT_STEP_OPTIONS.indexOf(S.startStep) + 1) % WEIGHT_STEP_OPTIONS.length];
      render();
      break;
    case "new-ex-step":
      S.newEx.startWeight = Math.max(0, roundTo(S.newEx.startWeight + Number(el.dataset.d), 2));
      render();
      break;
    case "add-exercise": {
      const d = S.newEx;
      const name = d && d.name.trim();
      if (!name) break;
      const cat = (d.cat || "").trim() || "기타";
      const id = "custom_" + name.replace(/\s+/g, "_") + "_" + Date.now();
      const list = getExercises();
      list.push({ id, name, cat, startWeight: d.noWeight ? 0 : d.startWeight, noWeight: d.noWeight });
      saveExercises(list);
      S.newEx = null;
      S.manageOpen = id;
      render();
      showToast(`${name} 종목을 추가했어요`, "");
      break;
    }
    case "manage-open":
      S.manageOpen = S.manageOpen === el.dataset.id ? null : el.dataset.id;
      render();
      break;
    case "sw-step": {
      const list = getExercises();
      const ex = list.find((x) => x.id === el.dataset.id);
      if (ex) {
        ex.startWeight = Math.max(0, roundTo((ex.startWeight ?? 20) + Number(el.dataset.d), 2));
        saveExercises(list);
      }
      render();
      break;
    }
    case "save-settings": {
      const s = getSettings();
      s.appTitle = document.getElementById("set-title").value.trim() || "오름";
      const restDefault = parseInt(document.getElementById("set-rest-default").value, 10);
      s.restDefault = Number.isFinite(restDefault) && restDefault > 0 ? restDefault : DEFAULT_REST_SEC;
      s.weeklyGoal = Math.min(7, Math.max(1, parseInt(document.getElementById("set-weekly-goal").value, 10) || 3));
      s.heightCm = document.getElementById("set-height").value.trim();
      s.weightKg = document.getElementById("set-weight").value.trim();
      s.geminiKey = document.getElementById("set-gemini-key").value.trim();
      s.geminiModel = document.getElementById("set-gemini-model").value.trim() || "gemini-flash-lite-latest";
      s.token = document.getElementById("set-token").value.trim();
      s.owner = document.getElementById("set-owner").value.trim();
      s.repo = document.getElementById("set-repo").value.trim();
      s.path = document.getElementById("set-path").value.trim() || "data/log.json";
      saveSettings(s);
      document.title = s.appTitle;
      S.settingsSaved = true;
      render();
      clearTimeout(settingsSavedTimer);
      settingsSavedTimer = setTimeout(() => {
        S.settingsSaved = false;
        if (S.screen === "settings") render();
      }, 2200);
      break;
    }
    case "sync-now":
      syncToGitHub();
      break;
    case "restore-now":
      loadFromGitHub();
      break;
  }
});

app.addEventListener("change", (e) => {
  const weightEl = e.target.closest('[data-action="set-start-weight"]');
  if (weightEl) {
    const list = getExercises();
    const ex = list.find((x) => x.id === weightEl.dataset.id);
    if (ex) {
      const val = Number(weightEl.value);
      ex.startWeight = isNaN(val) ? 0 : val;
      saveExercises(list);
      render();
    }
    return;
  }

  const noWeightEl = e.target.closest('[data-action="toggle-noweight"]');
  if (noWeightEl) {
    const list = getExercises();
    const ex = list.find((x) => x.id === noWeightEl.dataset.id);
    if (ex) {
      ex.noWeight = noWeightEl.checked;
      saveExercises(list);
      render();
    }
    return;
  }

  if (e.target.dataset.action === "new-ex-noweight" && S.newEx) {
    S.newEx.noWeight = e.target.checked;
    render();
    return;
  }
  if (e.target.dataset.action === "new-ex-weight" && S.newEx) {
    const v = Number(e.target.value);
    S.newEx.startWeight = isNaN(v) ? 0 : v;
  }
});

app.addEventListener("input", (e) => {
  if (S.newEx && e.target.id === "new-ex-name") {
    S.newEx.name = e.target.value;
    const add = document.querySelector('[data-action="add-exercise"]');
    if (add) add.disabled = !S.newEx.name.trim();
  }
  if (S.newEx && e.target.id === "new-ex-cat") {
    S.newEx.cat = e.target.value.trim() || getExercises()[0]?.cat || "기타";
    document.querySelectorAll('[data-action="new-ex-cat"]').forEach((b) => b.classList.toggle("selected", b.dataset.cat === S.newEx.cat));
  }
  if (e.target.id === "routine-name" && S.routineDraft) {
    S.routineDraft.name = e.target.value;
    const save = document.querySelector('[data-action="routine-save"]');
    if (save) save.disabled = !(S.routineDraft.name.trim() && S.routineDraft.exerciseIds.length);
  }
});

function roundTo(n, decimals) {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

function handleBack() {
  navDirection = "back";
  if (S.screen === "setcount") {
    if (S.routine && S.routine.done.length > 0) {
      if (!confirm("루틴을 그만할까요? 지금까지 기록은 저장돼 있어요.")) return;
    }
    S.routine = null;
    goHome();
  } else if (S.screen === "flow") {
    if (S.phase === "reps" && !S.currentExercise.noWeight) {
      S.phase = "weight";
      render();
    } else if (S.flowMode === "edit") {
      S.screen = "summary";
      render();
    } else if (S.flowIndex === 0) {
      S.screen = "setcount";
      render();
    } else {
      backIntoPreviousSet();
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
  } else if (S.screen === "routine") {
    S.routineDraft = null;
    S.screen = "home";
    render();
  } else if (S.screen === "history") {
    S.screen = S.historyFrom === "growth" ? "growth" : "home";
    render();
  } else if (S.screen === "backfillpick") {
    S.logTargetDate = null;
    S.screen = "calendar";
    render();
  } else if (S.screen === "voicelog") {
    stopVoiceListening();
    S.voiceStatus = "idle";
    S.voiceParsed = null;
    S.voiceTranscript = "";
    S.screen = "home";
    render();
  } else if (S.screen === "manage") {
    S.manageOpen = null;
    S.newEx = null;
    S.screen = "home";
    render();
  } else if (
    S.screen === "settings" ||
    S.screen === "calendar" ||
    S.screen === "growth" ||
    S.screen === "coaching" ||
    S.screen === "aicoaching"
  ) {
    S.screen = "home";
    render();
  }
}

/* ---------- press feedback (iOS Safari doesn't reliably fire :active on tap) ---------- */

const PRESSABLE = ".big-btn, .confirm-btn, .stepper-btn, .iconbtn, .tab-btn[data-action], .del-btn, .cal-cell, .set-row[data-action], .coach-teaser[data-action], .row-del, .row-edit, .add-log-btn, .stepper-value[data-action], .today-box-head, .voice-cta-btn, .finish-btn, .rest-btn, .routine-chip, .routine-pick, .seg-btn, .grow-row, .ex-row, .mini-step, .pill-btn, .voice-mic-btn, .model-pick-list .pill";

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

/* ---------- swipe-to-go-back (iOS-style left-edge swipe) ---------- */
/* Detail screens only show a tappable back arrow; this lets a swipe from the
   left edge trigger the same handleBack() so navigation feels native.
   Uses raw touch events (not Pointer Events) so we can call preventDefault()
   and claim the gesture before the browser's own edge-swipe-back — which, on
   a page with no history to go back to, falls through to switching tabs. */

(function initSwipeBack() {
  const PREVENT_ZONE = 16; // px from the true edge where we eagerly claim the touch, ahead of the browser's own edge gesture
  const EDGE_ZONE = 28; // px from the left edge that can start a tracked back-swipe
  const TRIGGER_PX = 70; // horizontal drag distance required to trigger back
  const MAX_SLOPE = 0.6; // vertical/horizontal ratio allowed before it's treated as a vertical scroll

  let tracking = false;
  let startX = 0;
  let startY = 0;

  function canGoBack() {
    return !!document.querySelector('.topbar [data-action="back"]');
  }

  document.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (t.clientX > EDGE_ZONE || !canGoBack() || e.target.closest(".weight-ruler")) {
        tracking = false;
        return;
      }
      tracking = true;
      startX = t.clientX;
      startY = t.clientY;
      if (t.clientX <= PREVENT_ZONE && e.cancelable) e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchmove",
    (e) => {
      if (!tracking) return;
      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dx > 10 && dy < dx * MAX_SLOPE && e.cancelable) e.preventDefault();
    },
    { passive: false }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      if (!tracking) return;
      tracking = false;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);
      if (dx > TRIGGER_PX && dy < dx * MAX_SLOPE) handleBack();
    },
    { passive: true }
  );

  document.addEventListener(
    "touchcancel",
    () => {
      tracking = false;
    },
    { passive: true }
  );
})();

/* ---------- keep screen awake while logging ---------- */

// Stops the iPhone from auto-locking mid-workout (which forces a Face ID unlock
// before every set). Only held on the logging screens so home/calendar still
// sleep normally. Needs iOS 18.4+ for home-screen apps; a no-op elsewhere.
const WAKE_SCREENS = ["setcount", "flow", "summary"];
let wakeLock = null;
let wakeLockPending = false;

function wantWakeLock() {
  return WAKE_SCREENS.includes(S.screen) && document.visibilityState === "visible";
}

async function updateWakeLock() {
  if (!("wakeLock" in navigator) || wakeLockPending) return;
  const want = wantWakeLock();
  if (want && !wakeLock) {
    wakeLockPending = true;
    try {
      const lock = await navigator.wakeLock.request("screen");
      // the OS drops the lock when the app is backgrounded
      lock.addEventListener("release", () => {
        if (wakeLock === lock) wakeLock = null;
      });
      wakeLock = lock;
    } catch (e) {}
    wakeLockPending = false;
    // the user may have left the logging screens while we were waiting
    if (!wantWakeLock()) updateWakeLock();
  } else if (!want && wakeLock) {
    wakeLock.release().catch(() => {});
    wakeLock = null;
  }
}

document.addEventListener("visibilitychange", updateWakeLock);

/* ---------- service worker ---------- */

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

render();
