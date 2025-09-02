const getGymsBtn = document.getElementById("getGymsBtn");
const loading = document.getElementById("loading");

const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageInfo = document.getElementById("pageInfo");

let allGyms = [];
let currentPage = 1;
const gymsPerPage = 100;

const API_BASE = "https://cf-gym-tracker.vercel.app/api/gyms";

function renderGyms(gyms) {
  const tbody = document.querySelector("#gymsTable tbody");
  tbody.innerHTML = "";

  if (gyms.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 4;
    cell.textContent = "No gyms found.";
    cell.classList.add("px-4", "py-2", "text-center", "text-gray-400");
    row.appendChild(cell);
    tbody.appendChild(row);
    return;
  }

  gyms.forEach((gym) => {
    const row = document.createElement("tr");

    // Contest name + link
    const nameCell = document.createElement("td");
    if (gym.contestLink) {
      const link = document.createElement("a");
      link.href = gym.contestLink;
      link.target = "_blank";
      link.textContent = gym.contestName || gym.name || `Gym ${gym.id}`;
      link.classList.add(
        "text-blue-400",
        "hover:text-blue-300",
        "cursor-pointer"
      );
      nameCell.appendChild(link);
    } else {
      nameCell.textContent = gym.contestName || gym.name || `Gym ${gym.id}`;
    }
    nameCell.classList.add("px-4", "py-2");
    row.appendChild(nameCell);

    // Team
    const teamCell = document.createElement("td");
    teamCell.textContent = gym.teamName || "-";
    teamCell.classList.add("px-4", "py-2", "text-white");
    row.appendChild(teamCell);

    // Difficulty
    const diffCell = document.createElement("td");
    diffCell.textContent = String(gym.difficulty ?? "-");
    diffCell.classList.add("px-4", "py-2", "text-gray-200");
    row.appendChild(diffCell);

    // Status
    const statusCell = document.createElement("td");
    if (gym.teamName) {
      statusCell.textContent = "Solved";
      statusCell.classList.add("text-green-400");
    } else {
      statusCell.textContent = "Unsolved";
      statusCell.classList.add("text-red-400");
    }
    statusCell.classList.add("px-4", "py-2");
    row.appendChild(statusCell);

    tbody.appendChild(row);
  });
}

const randomGymBtn = document.getElementById("randomGymBtn");

// Random Gym button event
randomGymBtn.addEventListener("click", () => {
  if (allGyms.length === 0) {
    return showWarning("No gyms available. Fetch gyms first!");
  }

  const randomIndex = Math.floor(Math.random() * allGyms.length);
  const randomGym = allGyms[randomIndex];

  renderGyms([randomGym]);

  pageInfo.textContent = `🎲 Random Gym (from ${allGyms.length})`;
});

// Pagination
function showPage(page) {
  const start = (page - 1) * gymsPerPage;
  const end = start + gymsPerPage;
  const pageGyms = allGyms.slice(start, end);

  renderGyms(pageGyms);

  pageInfo.textContent = `Page ${page} of ${Math.ceil(
    allGyms.length / gymsPerPage
  )}`;
  prevPageBtn.disabled = page === 1;
  nextPageBtn.disabled = end >= allGyms.length;
}

async function fetchGyms() {
  const handlesInput = document.getElementById("handles");
  const difficultyInput = document.getElementById("difficulty");
  const modeInput = document.getElementById("mode");

  const handles = handlesInput.value
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean);

  let difficulty = difficultyInput.value.trim();
  const mode = modeInput.value;

  if (!mode) {
    return showWarning("Please select a mode before searching.");
  }

  if (mode !== "all") {
    if (handles.length === 0) {
      return showWarning("Please enter at least one handle.");
    }
    if (difficulty === "") {
      return showWarning("Please select a difficulty level.");
    }
  }

  try {
    loading.classList.remove("hidden");

    let query = "";

    // Handles first
    if (handles.length > 0) {
      query += `?handles=${handles
        .map((h) => encodeURIComponent(h))
        .join("&handles=")}`;
    }

    // Difficulty next
    if (difficulty !== "") {
      const diffValue = difficulty.toLowerCase() === "all" ? 0 : difficulty;
      query += `${query ? "&" : "?"}difficulty=${encodeURIComponent(
        diffValue
      )}`;
    }

    let endpoint = API_BASE;
    if (mode === "team") endpoint = `${API_BASE}/virtual${query}`;
    else if (mode === "unsolved") endpoint = `${API_BASE}/unsolved${query}`;
    else if (mode === "all") {
      endpoint =
        difficulty === "" || difficulty == "0"
          ? API_BASE
          : `${API_BASE}${query}`;
    }

    const res = await fetch(endpoint);
    if (!res.ok) throw new Error("Bad response from server");

    const gymsObj = await res.json();
    allGyms = Object.values(gymsObj);

    currentPage = 1;
    showPage(currentPage);
  } catch (err) {
    console.error(err);
    showWarning("check the handles again");
  } finally {
    loading.classList.add("hidden");
  }
}

// Events
getGymsBtn.addEventListener("click", fetchGyms);

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    showPage(currentPage);
  }
});

nextPageBtn.addEventListener("click", () => {
  if (currentPage < Math.ceil(allGyms.length / gymsPerPage)) {
    currentPage++;
    showPage(currentPage);
  }
});

window.addEventListener("DOMContentLoaded", async () => {
  try {
    // Show loading spinner immediately
    loading.classList.remove("hidden");

    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch gyms");

    const data = await res.json();
    allGyms = Object.values(data);
    currentPage = 1;
    showPage(currentPage);
  } catch (err) {
    console.error("Failed to load gyms && Check the errors again :", err);
    showWarning("Failed to load gyms on page load.");
  } finally {
    // Hide loading spinner once done
    loading.classList.add("hidden");
  }
});

function showWarning(message) {
  const warnBox = document.getElementById("warningBox");
  warnBox.textContent = message;
  warnBox.classList.remove("hidden");

  setTimeout(() => {
    warnBox.classList.add("hidden");
  }, 3000);
}
