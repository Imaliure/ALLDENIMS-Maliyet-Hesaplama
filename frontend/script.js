// --- Yardımcı Fonksiyon ---
function parseInput(id, defaultValue = 0) {
  const val = document.getElementById(id).value;
  return val === "" ? defaultValue : parseFloat(val);
}

// --- Toast Bildirimi ---
function showToast(message, type = "info", duration = 3000) {
  let toast = document.getElementById("errorToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "errorToast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// --- Form Gönderimi ---
document.getElementById("costForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const requiredFields = [
    "quantity_range",
    "cutting_try",
    "sewing_try",
    "washing_try",
    "printing_try",
    "ironing_try",
    "accessories_try",
    "buttonhole_try",
    "fabric_price_eur",
    "fabric_meter_eur",
    "general_expense_ratio",
    "profit_ratio",
    "kdv_rate",
    "comission_rate"
  ];

  for (const id of requiredFields) {
    const el = document.getElementById(id);
    if (!el || el.value.trim() === "") {
      showToast("⚠️ Lütfen tüm alanları doldurun!");
      return;
    }
  }

  const data = {
    quantity_range: document.getElementById("quantity_range").value,
    cutting_try: parseInput("cutting_try"),
    sewing_try: parseInput("sewing_try"),
    washing_try: parseInput("washing_try"),
    printing_try: parseInput("printing_try"),
    ironing_try: parseInput("ironing_try"),
    accessories_try: parseInput("accessories_try"),
    buttonhole_try: parseInput("buttonhole_try"),
    fabric_price_eur: parseInput("fabric_price_eur"),
    fabric_meter_eur: parseInput("fabric_meter_eur"),
    general_expense_ratio: parseInput("general_expense_ratio"),
    profit_ratio: parseInput("profit_ratio"),
    kdv_rate: parseInput("kdv_rate"),
    commission_rate: parseInput("comission_rate"),
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/calculate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    const now = new Date();

    // Benzersiz ID + tarih ekle
    const resultData = {
      id: Date.now(),
      timestamp: now.toLocaleString(),
      quantity_range: data.quantity_range,
      ...result,
    };

    // Tabloya ekle
    const tbody = document.querySelector("#resultTable tbody");
    tbody.insertAdjacentHTML("beforeend", createRow(resultData));

    // Local storage'a ekle
    const calculations = JSON.parse(localStorage.getItem("calculations")) || [];
    calculations.push(resultData);
    localStorage.setItem("calculations", JSON.stringify(calculations));

    e.target.reset();
    showToast("✅ Hesaplama başarıyla kaydedildi!", "success");
  } catch (err) {
    console.error(err);
    showToast("❌ Sunucuya bağlanırken hata oluştu!", "error");
  }
});

// --- Satır oluşturma ---
function createRow(result) {
  return `
    <tr data-id="${result.id}">
      <td>${result.quantity_range}</td>
      <td>${result.timestamp}</td>
      <td>${result["TOPLAM (EUR)"]}</td>
      <td>${result["Ham Maliyet (€)"]}</td>
      <td>${result["Genel Gider (€)"]}</td>
      <td>${result["Kâr (€)"]}</td>
      <td>${result["Ara Toplam (€)"]}</td>
      <td>${result["Komisyon (€)"]}</td>
      <td>${result["KDV (€)"]}</td>
      <td>${result["Final EUR"]}</td>
      <td>${result["Final TL"]}</td>
      <td>${result["Final USD"]}</td>
      <td>${result["Final GBP"]}</td>
      <td><button class="delete-btn" style="background-color: red;">Sil</button></td>
    </tr>`;
}

// --- localStorage yükleme ---
function loadFromLocalStorage() {
  const calculations = JSON.parse(localStorage.getItem("calculations")) || [];
  const tbody = document.querySelector("#resultTable tbody");
  tbody.innerHTML = "";
  calculations.forEach((result) => {
    tbody.insertAdjacentHTML("beforeend", createRow(result));
  });
}

// --- Tek Satır Silme ---
document.querySelector("#resultTable").addEventListener("click", (e) => {
  if (e.target.classList.contains("delete-btn")) {
    const row = e.target.closest("tr");
    const id = parseInt(row.dataset.id);

    let calculations = JSON.parse(localStorage.getItem("calculations")) || [];
    // ID'yi filtrele ve kaydı güncelle
    calculations = calculations.filter((item) => item.id !== id);
    localStorage.setItem("calculations", JSON.stringify(calculations));

    row.remove();
    showToast("Kayıt kalıcı olarak silindi.", "success");
  }
});

// --- Tümünü Temizle ---
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  if (confirm("Tüm geçmiş hesaplamalar silinecek. Emin misiniz?")) {
    localStorage.removeItem("calculations");
    document.querySelector("#resultTable tbody").innerHTML = "";
    showToast("Tüm geçmiş temizlendi!", "success");
  }
});

// --- Sayfa açıldığında geçmişi yükle ---
window.addEventListener("DOMContentLoaded", loadFromLocalStorage);
