const STORAGE_KEY = "jadwalOlahraga";

function loadSchedules() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveSchedules(schedules) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function createSchedule(date, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date,
    text,
    done: false,
    createdAt: Date.now(),
  };
}

const state = {
  schedules: [],
  sortAsc: true,
};

const dayOrder = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value) {
  const date = parseDate(value);
  if (!date) return value || "";

  const weekday = date.toLocaleDateString("id-ID", { weekday: "long" });
  const day = date.toLocaleDateString("id-ID", { day: "2-digit" });
  const month = date.toLocaleDateString("id-ID", { month: "long" });
  const year = date.toLocaleDateString("id-ID", { year: "numeric" });

  return `${weekday}, ${day} ${month} ${year}`;
}

function getUpcomingCount() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inSevenDays = new Date(today);
  inSevenDays.setDate(inSevenDays.getDate() + 7);

  return state.schedules.filter((task) => {
    const date = parseDate(task.date ?? task.day);
    if (!date) return false;
    date.setHours(0, 0, 0, 0);
    return date >= today && date <= inSevenDays;
  }).length;
}

function updateStats() {
  const totalCount = document.getElementById("totalCount");
  const soonCount = document.getElementById("soonCount");

  if (!totalCount || !soonCount) return;

  totalCount.textContent = state.schedules.length;
  soonCount.textContent = getUpcomingCount();
}

function navigateTo(section) {
  document.querySelectorAll(".section").forEach((el) => {
    el.classList.toggle("active", el.id === `${section}Section`);
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.section === section);
  });

  window.location.hash = section;

  if (section === "list") {
    renderList();
  }
}

function initNavigation() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      navigateTo(btn.dataset.section);
    });
  });

  const hash = window.location.hash.replace("#", "") || "home";
  navigateTo(hash);

  window.addEventListener("hashchange", () => {
    const next = window.location.hash.replace("#", "") || "home";
    navigateTo(next);
  });
}

function initAddForm() {
  const dateInput = document.getElementById("dateInput");
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");

  const today = new Date().toISOString().slice(0, 10);
  if (dateInput) dateInput.value = dateInput.value || today;

  function addSchedule() {
    if (!dateInput || !taskInput) return;

    const date = dateInput.value.trim();
    const text = taskInput.value.trim();

    if (!date || !text) {
      alert("Pilih tanggal dan isi olahraga dulu ya!");
      return;
    }

    state.schedules.unshift(createSchedule(date, text));
    saveSchedules(state.schedules);
    updateStats();

    taskInput.value = "";
    dateInput.value = today;
    taskInput.focus();

    navigateTo("list");
  }

  if (addBtn) {
    addBtn.addEventListener("click", addSchedule);
  }

  if (taskInput) {
    taskInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") addSchedule();
    });
  }
}

function sortByDate(a, b) {
  const aDate = parseDate(a.date ?? a.day);
  const bDate = parseDate(b.date ?? b.day);

  if (aDate && bDate) return aDate - bDate;
  if (aDate) return -1;
  if (bDate) return 1;

  return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
}

function renderList() {
  const listEl = document.getElementById("list");
  const emptyState = document.getElementById("emptyState");
  const sortBtn = document.getElementById("sortBtn");

  if (!listEl || !emptyState || !sortBtn) return;

  const visible = [...state.schedules].sort((a, b) =>
    sortByDate(a, b) * (state.sortAsc ? 1 : -1)
  );

  listEl.innerHTML = "";
  if (visible.length === 0) {
    emptyState.style.display = "flex";
    return;
  }

  emptyState.style.display = "none";

  visible.forEach((task) => {
    const li = document.createElement("li");
    li.className = task.done ? "done" : "";

    const item = document.createElement("div");
    item.className = "item";

    const info = document.createElement("div");
    info.className = "item-info";

    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = formatDate(task.date ?? task.day);

    const text = document.createElement("span");
    text.className = "text";
    text.textContent = task.text;

    info.appendChild(badge);
    info.appendChild(text);

    const controls = document.createElement("div");
    controls.className = "item-actions";

    const doneBtn = document.createElement("button");
    doneBtn.className = "done-btn";
    doneBtn.textContent = task.done ? "Batal" : "Selesai";
    doneBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDone(task.id);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "Hapus";
    deleteBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      removeTask(task.id);
    });

    controls.appendChild(doneBtn);
    controls.appendChild(deleteBtn);

    item.appendChild(info);
    item.appendChild(controls);

    li.appendChild(item);
    listEl.appendChild(li);
  });

  sortBtn.textContent = state.sortAsc
    ? "Urutkan Tanggal"
    : "Urutkan Tanggal (Terbalik)";

  sortBtn.onclick = () => {
    state.sortAsc = !state.sortAsc;
    renderList();
  };
}

function toggleDone(id) {
  const task = state.schedules.find((t) => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveSchedules(state.schedules);
  renderList();
  updateStats();
}

function removeTask(id) {
  state.schedules = state.schedules.filter((t) => t.id !== id);
  saveSchedules(state.schedules);
  renderList();
  updateStats();
}

function initApp() {
  state.schedules = loadSchedules();
  initNavigation();
  initAddForm();
  updateStats();
}

initApp();
