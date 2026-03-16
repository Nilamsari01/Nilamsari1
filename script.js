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

function createSchedule(day, text) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    day,
    text,
    done: false,
    createdAt: Date.now(),
  };
}

function isInputPage() {
  return !!document.getElementById("hariSelect");
}

function isListPage() {
  return !!document.getElementById("list");
}

/* --- Input Page Logic --- */
function initInputPage() {
  const hariSelect = document.getElementById("hariSelect");
  const taskInput = document.getElementById("taskInput");
  const addBtn = document.getElementById("addBtn");

  function addSchedule() {
    const day = hariSelect.value.trim();
    const text = taskInput.value.trim();

    if (!day || !text) {
      alert("Pilih hari dan isi olahraga dulu ya!");
      return;
    }

    const schedules = loadSchedules();
    schedules.unshift(createSchedule(day, text));
    saveSchedules(schedules);

    taskInput.value = "";
    hariSelect.value = "";
    taskInput.focus();

    window.location.href = "list.html";
  }

  addBtn.addEventListener("click", addSchedule);
  taskInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") addSchedule();
  });
}

/* --- List Page Logic --- */
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

  function sortByDay(a, b) {
    return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
  }

  function renderList() {
    const visible = [...schedules].sort(sortByDay);

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
      badge.textContent = task.day;

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
    schedules.sort(sortByDay);
    renderList();
  });

  const backBtn = document.getElementById("backBtn");
  backBtn.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  renderList();
}

/* --- Init entrypoint --- */
if (isInputPage()) {
  initInputPage();
} else if (isListPage()) {
  initListPage();
}
