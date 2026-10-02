const STORAGE_KEY = "gmapCollectorState";

const elements = {
  datasetName: document.querySelector("#dataset-name"),
  keyword: document.querySelector("#keyword"),
  location: document.querySelector("#location"),
  collect: document.querySelector("#collect"),
  exportJson: document.querySelector("#export-json"),
  exportCsv: document.querySelector("#export-csv"),
  clear: document.querySelector("#clear"),
  status: document.querySelector("#status"),
  processedCount: document.querySelector("#processed-count"),
  businessCount: document.querySelector("#business-count"),
  duplicateCount: document.querySelector("#duplicate-count"),
  failedCount: document.querySelector("#failed-count"),
  lastCollected: document.querySelector("#last-collected")
};

let state = {
  businesses: [],
  lastCollectedAt: null,
  stats: { processed: 0, collected: 0, duplicate: 0, failed: 0 }
};

initialize();

elements.collect.addEventListener("click", collectFromActiveTab);
elements.exportJson.addEventListener("click", () => exportDataset("json"));
elements.exportCsv.addEventListener("click", () => exportDataset("csv"));
elements.clear.addEventListener("click", clearDataset);

async function initialize() {
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  state = stored[STORAGE_KEY] || state;
  updateView();
}

async function collectFromActiveTab() {
  setStatus("Membaca hasil Google Maps...");
  elements.collect.disabled = true;

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id || !isMapsUrl(tab.url)) {
      throw new Error("Buka halaman hasil Google Maps sebelum melakukan collection.");
    }

    const response = await chrome.tabs.sendMessage(tab.id, { type: "COLLECT_BUSINESSES" });

    if (!response?.ok) {
      throw new Error(response?.error || "Data tidak dapat dibaca dari halaman ini.");
    }

    const businesses = response.businesses || [];
    const existingIds = new Set(state.businesses.map((business) => business.businessId));
    const newBusinesses = businesses.filter((business) => !existingIds.has(business.businessId));
    const duplicateCount = businesses.length - newBusinesses.length;
    const failedCount = response.stats?.failed || 0;
    state.businesses = [...state.businesses, ...newBusinesses];
    state.lastCollectedAt = new Date().toISOString();
    state.stats = { processed: response.stats?.processed || businesses.length, collected: newBusinesses.length, duplicate: duplicateCount, failed: failedCount };
    await saveState();

    setStatus(`${newBusinesses.length} ditambahkan, ${duplicateCount} duplicate, ${failedCount} gagal.`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    elements.collect.disabled = false;
  }
}

async function exportDataset(format) {
  if (!state.businesses.length) {
    setStatus("Belum ada data untuk diekspor.", true);
    return;
  }

  const dataset = createDataset();
  const content = format === "json" ? JSON.stringify(dataset, null, 2) : createCsv(state.businesses);
  const mimeType = format === "json" ? "application/json" : "text/csv;charset=utf-8";
  const extension = format === "json" ? "json" : "csv";
  const fileName = `${slugify(dataset.dataset.name || "gmap-dataset")}.${extension}`;
  const blobUrl = URL.createObjectURL(new Blob([content], { type: mimeType }));
  const anchor = document.createElement("a");

  anchor.href = blobUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(blobUrl);
  setStatus(`${format.toUpperCase()} berhasil diekspor.`);
}

async function clearDataset() {
  state = { businesses: [], lastCollectedAt: null, stats: { processed: 0, collected: 0, duplicate: 0, failed: 0 } };
  await saveState();
  setStatus("Hasil collection dihapus.");
}

function createDataset() {
  return {
    schemaName: "gmap-prospect-dataset",
    schemaVersion: "1.0",
    dataset: {
      datasetId: `ds_${Date.now()}`,
      name: elements.datasetName.value.trim() || "GMap Collection",
      keyword: elements.keyword.value.trim() || null,
      location: elements.location.value.trim() || null,
      collectedAt: state.lastCollectedAt,
      source: "gmap-collector",
      businesses: state.businesses
    }
  };
}

function createCsv(businesses) {
  const headers = [
    "businessId", "name", "category", "address", "phone", "website", "websiteStatus", "mapsUrl",
    "rating", "reviewCount", "openingHours", "businessStatus", "latitude", "longitude", "placeId", "area", "collectedAt"
  ];
  const rows = businesses.map((business) => headers.map((header) => csvValue(business[header])));
  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
}

function csvValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  const text = typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

async function saveState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: state });
  updateView();
}

function updateView() {
  elements.businessCount.textContent = String(state.businesses.length);
  elements.processedCount.textContent = String(state.stats?.processed || 0);
  elements.duplicateCount.textContent = String(state.stats?.duplicate || 0);
  elements.failedCount.textContent = String(state.stats?.failed || 0);
  elements.lastCollected.textContent = state.lastCollectedAt ? new Date(state.lastCollectedAt).toLocaleTimeString() : "-";
}

function setStatus(message, isError = false) {
  elements.status.textContent = message;
  elements.status.style.color = isError ? "#9a3f28" : "#667064";
}

function isMapsUrl(url) {
  return typeof url === "string" && (url.startsWith("https://www.google.com/maps/") || url.startsWith("https://maps.google.com/"));
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "gmap-dataset";
}
