// ===== Data Management (Persistence) =====
let players = JSON.parse(localStorage.getItem('players')) || [];
let history = JSON.parse(localStorage.getItem('history')) || [];
let totalFund = parseInt(localStorage.getItem('totalFund')) || 0;
let totalSlot = parseInt(localStorage.getItem('totalSlot')) || 0;
let totalEarn = parseInt(localStorage.getItem('totalEarn')) || 0;
let editIndex = null;
let deleteIndex = null;

function saveData() {
  localStorage.setItem('players', JSON.stringify(players));
  localStorage.setItem('history', JSON.stringify(history));
  localStorage.setItem('totalFund', totalFund);
  localStorage.setItem('totalSlot', totalSlot);
  localStorage.setItem('totalEarn', totalEarn);
}

// ===== Login =====
function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const error = document.getElementById('error');
  if (username === "Tamim" && password === "Tamim") {
    localStorage.setItem('role', 'admin');
    showDashboard();
  } else if (username === "Hunter" && password === "hunters") {
    localStorage.setItem('role', 'player');
    showDashboard();
  } else {
    error.textContent = "Invalid Credentials!";
  }
}

// ===== Dashboard =====
function showDashboard() {
  const loginPage = document.getElementById('loginPage');
  const dashboard = document.getElementById('dashboard');
  if (!loginPage || !dashboard) return;

  loginPage.style.display = 'none';
  dashboard.style.display = 'block';
  const role = localStorage.getItem('role');
  const welcomeText = document.getElementById('welcomeText');
  if (welcomeText) welcomeText.textContent = role === 'admin' ? "Welcome Admin!" : "Welcome Player!";
  
  const adminControls = document.getElementById('adminControls');
  if (role === 'player' && adminControls) {
    adminControls.style.display = 'none';
  }
  
  renderPlayers();
  renderHistory();
  updateSummary();
}

// ===== Modals =====
function showAddPlayerModal() { document.getElementById('playerModal').style.display = 'flex'; }
function showAddSlotModal() { document.getElementById('slotModal').style.display = 'flex'; }
function showAddEarnModal() { document.getElementById('earnModal').style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ===== Add Player =====
function addPlayer(e) {
  e.preventDefault();
  const p = {
    name: document.getElementById('pName').value,
    district: document.getElementById('pDistrict').value,
    gender: document.getElementById('pGender').value,
    age: document.getElementById('pAge').value,
    profession: document.getElementById('pProfession').value,
    uid: document.getElementById('pUID').value,
    totalFund: 0,
    totalMatch: 0
  };
  players.push(p);
  addHistory("Player Added", p.name, 0, "New Player Created");
  closeModal('playerModal');
  renderPlayers();
  renderHistory();
  updateSummary();
  saveData();
}

// ===== Edit Player =====
function editPlayer(index) {
  editIndex = index;
  const p = players[index];
  document.getElementById('editName').value = p.name;
  document.getElementById('editDistrict').value = p.district;
  document.getElementById('editGender').value = p.gender;
  document.getElementById('editAge').value = p.age;
  document.getElementById('editProfession').value = p.profession;
  document.getElementById('editUID').value = p.uid;
  document.getElementById('editPlayerModal').style.display = 'flex';
}

function savePlayerEdit(e) {
  e.preventDefault();
  if (editIndex === null) return;
  const p = players[editIndex];
  p.name = document.getElementById('editName').value;
  p.district = document.getElementById('editDistrict').value;
  p.gender = document.getElementById('editGender').value;
  p.age = document.getElementById('editAge').value;
  p.profession = document.getElementById('editProfession').value;
  p.uid = document.getElementById('editUID').value;
  addHistory("Player Edited", p.name, 0, "Player Info Updated");
  closeModal('editPlayerModal');
  renderPlayers();
  renderHistory();
  updateSummary();
  saveData();
  editIndex = null;
}

// ===== Render Players =====
function renderPlayers() {
  const tbody = document.querySelector('#playerTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const role = localStorage.getItem('role');
  players.forEach((p, i) => {
    if (role === 'player' && p.name !== 'Hunter') return;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${p.name}</td><td>${p.district}</td><td>${p.gender}</td><td>${p.age}</td><td>${p.profession}</td><td>${p.totalFund}৳</td><td>${p.totalMatch}</td>
<td>${role === 'admin' ? `<button class="action-btn" onclick="addFund(${i})">Add Fund</button>
<button class="action-btn" onclick="addMatch(${i})">Add Match</button>
<button class="action-btn" onclick="paySalary(${i})">Pay Salary</button>
<button class="action-btn" onclick="editPlayer(${i})">Edit</button>` : ''}</td>`;
    tbody.appendChild(tr);
  });
}

// ===== Fund / Match / Salary / Slot / Earn =====
function addFund(index) {
  const amt = parseInt(prompt("Enter Fund Amount:"));
  if (amt) {
    players[index].totalFund += amt;
    totalFund += amt;
    addHistory("Fund Added", players[index].name, amt, "Fund to Player");
    renderPlayers();
    renderHistory();
    updateSummary();
    saveData();
  }
}

function addMatch(index) {
  players[index].totalMatch += 1;
  addHistory("Match Added", players[index].name, 0, "Match Played");
  renderPlayers();
  renderHistory();
  updateSummary();
  saveData();
}

function paySalary(index) {
  const amt = parseInt(prompt(`Enter Salary Amount for ${players[index].name}:`));
  if (amt && amt <= totalFund) {
    players[index].totalFund -= amt;
    totalFund -= amt;
    addHistory("Salary Paid", players[index].name, amt, "Salary Deduction");
    renderPlayers();
    renderHistory();
    updateSummary();
    saveData();
  } else if (amt > totalFund) {
    alert("Insufficient Total Fund!");
  }
}

function addSlot(e) {
  e.preventDefault();
  const amt = parseInt(document.getElementById('slotAmount').value);
  totalFund -= amt;
  totalSlot += amt;
  addHistory("Slot Purchased", "All Players", amt, document.getElementById('slotType').value);
  closeModal('slotModal');
  updateSummary();
  renderPlayers();
  renderHistory();
  saveData();
}

function addEarn(e) {
  e.preventDefault();
  const amt = parseInt(document.getElementById('earnAmount').value);
  totalFund += amt;
  totalEarn += amt;
  addHistory("InGame Earn", "All Players", amt, document.getElementById('earnType').value);
  closeModal('earnModal');
  updateSummary();
  renderPlayers();
  renderHistory();
  saveData();
}

// ===== History =====
function addHistory(type, player, amount, details) {
  const now = new Date();
  history.push({
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    type,
    player,
    amount,
    details
  });
}

function renderHistory() {
  const tbody = document.querySelector('#historyTable tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  const role = localStorage.getItem('role');
  history.slice().reverse().forEach((h, i) => {
    const actualIndex = history.length - 1 - i;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${h.date}</td><td>${h.time}</td><td>${h.type}</td><td>${h.player}</td><td>${h.amount}</td><td>${h.details}</td>
    <td>${role === 'admin' ? `<button class="action-btn" style="background: none; color: #ff4d4d; border: none; padding: 0; min-width: auto;" onclick="confirmDeleteHistory(${actualIndex})" title="Delete">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
    </button>` : ''}</td>`;
    tbody.appendChild(tr);
  });
}

function confirmDeleteHistory(index) {
  deleteIndex = index;
  const h = history[index];
  const confirmModalP = document.querySelector('#confirmModal p');
  if (confirmModalP) confirmModalP.innerHTML = `Are you sure you want to delete the <b>${h.type}</b> record for <b>${h.player}</b>?`;
  
  const confirmModal = document.getElementById('confirmModal');
  if (confirmModal) confirmModal.style.display = 'flex';
  
  const finalDeleteBtn = document.getElementById('finalDeleteBtn');
  if (finalDeleteBtn) {
    finalDeleteBtn.onclick = function () {
      if (deleteIndex !== null) {
        history.splice(deleteIndex, 1);
        saveData();
        renderHistory();
        closeModal('confirmModal');
        deleteIndex = null;
      }
    };
  }
}

// ===== Update Summary =====
function updateSummary() {
  const playerFundValue = players.reduce((a, b) => a + b.totalFund, 0);
  const totalPlayersValue = players.length;
  const totalMatchValue = players.reduce((a, b) => a + b.totalMatch, 0);
  
  const totalFundEl = document.getElementById('totalFund');
  const playerFundEl = document.getElementById('playerFund');
  const totalPlayersEl = document.getElementById('totalPlayers');
  const totalMatchEl = document.getElementById('totalMatch');
  const slotPurchaseEl = document.getElementById('slotPurchase');
  const ingameEarningEl = document.getElementById('ingameEarning');

  if (totalFundEl) totalFundEl.textContent = totalFund;
  if (playerFundEl) playerFundEl.textContent = playerFundValue;
  if (totalPlayersEl) totalPlayersEl.textContent = totalPlayersValue;
  if (totalMatchEl) totalMatchEl.textContent = totalMatchValue;
  if (slotPurchaseEl) slotPurchaseEl.textContent = totalSlot;
  if (ingameEarningEl) ingameEarningEl.textContent = totalEarn;
}

// ===== Logout =====
function logout() {
  localStorage.removeItem('role');
  location.reload();
}

// ===== Auto Login Check =====
window.onload = function () {
  if (localStorage.getItem('role')) {
    showDashboard();
  }
}
