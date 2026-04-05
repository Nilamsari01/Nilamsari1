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

function isInputPage() {
  return !!document.getElementById("dateInput");
}

function isListPage() {
  return !!document.getElementById("list");
}

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

function initInputPage() {
  const dateInput = document.getElementById("dateInput");
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");

  const today = new Date().toISOString().slice(0, 10);
  dateInput.value = dateInput.value || today;

  function addSchedule() {
    const date = dateInput.value.trim();
    const text = taskInput.value.trim();

    if (!date || !text) {
      alert("Pilih tanggal dan isi olahraga dulu ya!");
      return;
    }

    const schedules = loadSchedules();
    schedules.unshift(createSchedule(date, text));
    saveSchedules(schedules);

    taskInput.value = "";
    dateInput.value = today;
    taskInput.focus();

    window.location.href = "list.html";
  }

  addBtn.addEventListener("click", addSchedule);
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addSchedule();
  });
}

function initListPage() {
  let schedules = loadSchedules();

  const refs = {
    list: document.getElementById("list"),
    emptyState: document.getElementById("emptyState"),
    sortBtn: document.getElementById("sortBtn"),
  };

  const dayOrder = [
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
    "Minggu",
  ];

  function sortByDate(a, b) {
    const aDate = parseDate(a.date ?? a.day);
    const bDate = parseDate(b.date ?? b.day);

    if (aDate && bDate) return aDate - bDate;
    if (aDate) return -1;
    if (bDate) return 1;

    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  }

  let sortAsc = true;

  function renderList() {
    const visible = [...schedules].sort((a, b) =>
      sortByDate(a, b) * (sortAsc ? 1 : -1)
    );

    refs.list.innerHTML = "";
    if (visible.length === 0) {
      refs.emptyState.style.display = "flex";
      return;
    }

    refs.emptyState.style.display = "none";

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
      refs.list.appendChild(li);
    });
  }

  function toggleDone(id) {
    const task = schedules.find((t) => t.id === id);
    if (!task) return;
    task.done = !task.done;
    saveSchedules(schedules);
    renderList();
  }

  function removeTask(id) {
    schedules = schedules.filter((t) => t.id !== id);
    saveSchedules(schedules);
    renderList();
  }

  refs.sortBtn.addEventListener("click", () => {
    sortAsc = !sortAsc;
    refs.sortBtn.textContent = sortAsc
      ? "Urutkan Tanggal"
      : "Urutkan Tanggal (Terbalik)";
    renderList();
  });

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  renderList();
}

if (isInputPage()) {
  initInputPage();
} else if (isListPage()) {
  initListPage();
}