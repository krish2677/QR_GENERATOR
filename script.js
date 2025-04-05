// DOM Elements
const qrText = document.getElementById("qrText");
const qrImage = document.getElementById("qrImage");
const imgBox = document.getElementById("imgBox");
const downloadBtn = document.getElementById("downloadBtn");
const historyList = document.getElementById("historyList");
const fgColor = document.getElementById("fgColor");
const bgColor = document.getElementById("bgColor");
const qrSize = document.getElementById("qrSize");
const dataType = document.getElementById("dataType");
const inputFields = document.getElementById("inputFields");
const scanResult = document.getElementById("scanResult");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  loadHistory();
  setupDarkModeToggle();
  startQRScanner();
});

// Handle input fields based on type
dataType.addEventListener("change", () => {
  const type = dataType.value;
  let html = "";

  if (type === "text") {
    html = `<input type="text" id="qrText" placeholder="Enter text or URL">`;
  } else if (type === "vcard") {
    html = `
      <input type="text" id="name" placeholder="Full Name">
      <input type="text" id="email" placeholder="Email">
      <input type="text" id="phone" placeholder="Phone">
    `;
  } else if (type === "wifi") {
    html = `
      <input type="text" id="ssid" placeholder="Wi-Fi SSID">
      <input type="text" id="password" placeholder="Password">
    `;
  }

  inputFields.innerHTML = html;
});

// Generate QR Code
function generateQR() {
  let data = "";
  const type = dataType.value;

  if (type === "text") {
    data = document.getElementById("qrText").value.trim();
  } else if (type === "vcard") {
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    data = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nEMAIL:${email}\nTEL:${phone}\nEND:VCARD`;
  } else if (type === "wifi") {
    const ssid = document.getElementById("ssid").value;
    const password = document.getElementById("password").value;
    data = `WIFI:T:WPA;S:${ssid};P:${password};;`;
  }

  if (!data) {
    alert("Please fill in the required fields.");
    return;
  }

  const size = qrSize.value;
  const fg = fgColor.value.replace("#", "");
  const bg = bgColor.value.replace("#", "");

  const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(data)}&size=${size}&color=${fg}&bgcolor=${bg}`;
  qrImage.src = url;
  downloadBtn.href = url;

  imgBox.style.display = "flex";
  saveToHistory(data);
}

// Save QR code to PDF
function saveAsPDF() {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  pdf.addImage(qrImage.src, "PNG", 30, 30, 150, 150);
  pdf.save("qr-code.pdf");
}

// Save to local history
function saveToHistory(data) {
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  history.unshift(data);
  if (history.length > 10) history.pop(); // Limit to 10
  localStorage.setItem("qrHistory", JSON.stringify(history));
  loadHistory();
}

// Load history
function loadHistory() {
  historyList.innerHTML = "";
  let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
  history.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// Clear history
function clearHistory() {
  localStorage.removeItem("qrHistory");
  loadHistory();
  alert("QR history cleared!");
}

// Dark Mode
function setupDarkModeToggle() {
  const toggle = document.getElementById("darkModeToggle");
  const body = document.body;

  toggle.addEventListener("change", () => {
    body.classList.toggle("dark");
    localStorage.setItem("darkMode", body.classList.contains("dark"));
  });

  if (localStorage.getItem("darkMode") === "true") {
    body.classList.add("dark");
    toggle.checked = true;
  }
}

// Sharing
function shareWhatsApp() {
  const text = `Check out this QR Code: ${qrImage.src}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

function shareEmail() {
  const subject = "QR Code";
  const body = `Here's your QR code:\n${qrImage.src}`;
  window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, "_blank");
}

