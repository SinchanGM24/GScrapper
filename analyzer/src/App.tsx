import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import "./App.css";
import { summarizeBusinesses } from "./domain/analytics";
import { emptyFilters, filterBusinesses, sortBusinesses, type ProspectFilters, type ScoredBusiness } from "./domain/filtering";
import { recommendBusinesses } from "./domain/recommendation";
import { defaultScoringConfig, type Dataset, type Potential } from "./domain/schema";
import { scoreBusinesses } from "./domain/scoring";
import { parseCsv, parseJson, stringifyCsv } from "./import-export/csv";
import { IndexedDbDatasetRepository } from "./persistence/dataset-repository";

type View = "overview" | "prospects" | "analytics" | "datasets" | "settings";
const repository = new IndexedDbDatasetRepository();

function App() {
  const [view, setView] = useState<View>("overview");
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>();
  const [filters, setFilters] = useState<ProspectFilters>(emptyFilters);
  const [sortField, setSortField] = useState<"score" | "rating" | "reviews" | "name">("score");
  const [targetCategories, setTargetCategories] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>();
  const [message, setMessage] = useState("Import dataset JSON atau CSV untuk mulai.");

  useEffect(() => {
    repository.listDatasets().then((stored) => {
      setDatasets(stored);
      setActiveDatasetId(stored[0]?.datasetId);
    }).catch(() => setMessage("Storage browser belum dapat dibuka."));
  }, []);

  const activeDataset = datasets.find((dataset) => dataset.datasetId === activeDatasetId);
  const config = { ...defaultScoringConfig, targetCategories: targetCategories.split(",").map((value) => value.trim()).filter(Boolean) };
  const scoredBusinesses: ScoredBusiness[] = (activeDataset?.businesses ?? []).map((business) => ({ ...business, analysis: scoreBusinesses([business], config)[0] }));
  const filteredBusinesses = sortBusinesses(filterBusinesses(scoredBusinesses, filters), sortField);
  const summary = summarizeBusinesses(scoredBusinesses);
  const recommendations = recommendBusinesses(scoredBusinesses, 5);

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const dataset = file.name.toLowerCase().endsWith(".csv") ? parseCsv(content, { name: file.name.replace(/\.[^.]+$/, "") }).dataset : parseJson(content);
      if (!dataset) throw new Error("Dataset tidak dapat dibaca.");
      await repository.saveDataset(dataset);
      setDatasets(await repository.listDatasets());
      setActiveDatasetId(dataset.datasetId);
      setSelectedIds([]);
      setMessage(`${dataset.businesses.length} bisnis berhasil diimpor dari ${file.name}.`);
      setView("prospects");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Import gagal.");
    } finally {
      event.target.value = "";
    }
  }

  async function deleteActiveDataset() {
    if (!activeDataset) return;
    await repository.deleteDataset(activeDataset.datasetId);
    const updated = await repository.listDatasets();
    setDatasets(updated);
    setActiveDatasetId(updated[0]?.datasetId);
    setSelectedIds([]);
    setSelectedBusinessId(undefined);
    setMessage("Dataset berhasil dihapus.");
  }

  function downloadBusinesses(businesses: ScoredBusiness[], suffix: string) {
    if (!businesses.length) return;
    const url = URL.createObjectURL(new Blob([stringifyCsv(businesses)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeDataset?.name ?? "prospects"}${suffix}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage(`${businesses.length} bisnis berhasil diekspor.`);
  }

  function toggleSelected(businessId: string) {
    setSelectedIds((current) => current.includes(businessId) ? current.filter((id) => id !== businessId) : [...current, businessId]);
  }

  function openExternal(url: string | null) {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function copyPhone(phone: string | null) {
    if (!phone) return;
    await navigator.clipboard.writeText(phone);
    setMessage("Nomor telepon disalin.");
  }

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand-mark">G</div><div className="brand-copy"><strong>GMap</strong><span>Prospect Analyzer</span></div><nav aria-label="Main navigation">{(["overview", "prospects", "analytics", "datasets", "settings"] as View[]).map((item) => <button key={item} className={view === item ? "nav-item active" : "nav-item"} onClick={() => setView(item)} type="button"><span className="nav-dot" />{item[0].toUpperCase() + item.slice(1)}</button>)}</nav><div className="sidebar-foot"><span className="status-dot" />Local workspace</div></aside>
    <main className="main-content"><header className="topbar"><div><p className="kicker">Prospecting workspace</p><h1>{view === "overview" ? "Overview" : view[0].toUpperCase() + view.slice(1)}</h1></div><label className="import-button">Import dataset<input type="file" accept=".json,.csv,application/json,text/csv" onChange={handleImport} /></label></header><div className="notice" role="status">{message}</div>{view === "overview" && <Overview summary={summary} recommendations={recommendations} onProspects={() => setView("prospects")} />}{view === "prospects" && <Prospects businesses={filteredBusinesses} filters={filters} setFilters={setFilters} sortField={sortField} setSortField={setSortField} selectedIds={selectedIds} selectedBusinessId={selectedBusinessId} onSelect={setSelectedBusinessId} onToggle={toggleSelected} onExport={() => downloadBusinesses(filteredBusinesses, "-filtered")} onExportSelected={() => downloadBusinesses(filteredBusinesses.filter((business) => selectedIds.includes(business.businessId)), "-selected")} onOpen={openExternal} onCopyPhone={copyPhone} />}{view === "analytics" && <Analytics summary={summary} />}{view === "datasets" && <Datasets datasets={datasets} activeDatasetId={activeDatasetId} onSelect={setActiveDatasetId} onDelete={deleteActiveDataset} />}{view === "settings" && <Settings value={targetCategories} onChange={setTargetCategories} />}</main>
  </div>;
}

function Overview({ summary, recommendations, onProspects }: { summary: ReturnType<typeof summarizeBusinesses>; recommendations: ScoredBusiness[]; onProspects: () => void }) {
  return <><section className="hero-strip"><div><p className="kicker">Signal, not certainty</p><h2>Find the next conversation worth having.</h2><p>Prioritaskan bisnis dari indikator yang terlihat, lalu biarkan keputusan akhir tetap di tangan Anda.</p></div><button type="button" className="dark-button" onClick={onProspects}>Open prospect table</button></section><section className="metric-grid"><Metric label="Total businesses" value={summary.total} accent="ink" /><Metric label="Without website" value={summary.withoutWebsite} accent="coral" /><Metric label="With phone" value={summary.withPhone} accent="sage" /><Metric label="High potential" value={summary.high} accent="gold" /></section><section className="content-grid"><div className="panel recommendation-panel"><div className="panel-heading"><div><p className="kicker">First look</p><h2>Recommended prospects</h2></div><span className="panel-count">{recommendations.length}</span></div>{recommendations.length ? recommendations.map((business) => <ProspectRow key={business.businessId} business={business} />) : <EmptyState />}</div><div className="panel distribution-panel"><div className="panel-heading"><div><p className="kicker">Dataset health</p><h2>Potential mix</h2></div></div><Distribution label="High" value={summary.high} total={summary.total} color="coral" /><Distribution label="Medium" value={summary.medium} total={summary.total} color="gold" /><Distribution label="Low" value={summary.low} total={summary.total} color="sage" /><p className="panel-note">Score dihitung dari data yang tersedia, bukan kepastian kebutuhan bisnis.</p></div></section></>;
}

function Prospects({ businesses, filters, setFilters, sortField, setSortField, selectedIds, selectedBusinessId, onSelect, onToggle, onExport, onExportSelected, onOpen, onCopyPhone }: { businesses: ScoredBusiness[]; filters: ProspectFilters; setFilters: (filters: ProspectFilters) => void; sortField: string; setSortField: (field: "score" | "rating" | "reviews" | "name") => void; selectedIds: string[]; selectedBusinessId?: string; onSelect: (id: string) => void; onToggle: (id: string) => void; onExport: () => void; onExportSelected: () => void; onOpen: (url: string | null) => void; onCopyPhone: (phone: string | null) => void }) {
  const categories = [...new Set(businesses.map((business) => business.category).filter(Boolean))] as string[];
  return <section className="panel table-panel"><div className="panel-heading"><div><p className="kicker">Active dataset</p><h2>Prospect table</h2></div><div className="table-actions"><button type="button" className="quiet-button" disabled={!selectedIds.length} onClick={onExportSelected}>Export selected ({selectedIds.length})</button><button type="button" className="dark-button" onClick={onExport}>Export filtered</button></div></div><div className="filters"><input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Search name, category, address..." /><select value={filters.potential} onChange={(event) => setFilters({ ...filters, potential: event.target.value as Potential | "all" })}><option value="all">All potential</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select><select value={filters.websiteStatus} onChange={(event) => setFilters({ ...filters, websiteStatus: event.target.value as ProspectFilters["websiteStatus"] })}><option value="all">All website status</option><option value="none">No website</option><option value="present">Website present</option><option value="unknown">Unknown</option></select><select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All categories</option>{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><select value={sortField} onChange={(event) => setSortField(event.target.value as "score" | "rating" | "reviews" | "name")}><option value="score">Sort: score</option><option value="rating">Sort: rating</option><option value="reviews">Sort: reviews</option><option value="name">Sort: name</option></select></div><div className="table-wrap"><table><thead><tr><th>Select</th><th>Business</th><th>Category</th><th>Website</th><th>Rating</th><th>Reviews</th><th>Potential</th><th>Reason</th></tr></thead><tbody>{businesses.map((business) => <tr key={business.businessId} className={selectedBusinessId === business.businessId ? "selected-row" : ""}><td><input aria-label={`Select ${business.name}`} type="checkbox" checked={selectedIds.includes(business.businessId)} onChange={() => onToggle(business.businessId)} /></td><td><button type="button" className="business-link" onClick={() => onSelect(business.businessId)}><strong>{business.name}</strong><small>{business.address ?? "Address unavailable"}</small></button></td><td>{business.category ?? "-"}</td><td><span className={`status-pill website-${business.websiteStatus}`}>{business.websiteStatus === "present" ? "Present" : business.websiteStatus === "none" ? "None" : "Unknown"}</span></td><td>{business.rating ?? "-"}</td><td>{business.reviewCount?.toLocaleString() ?? "-"}</td><td><span className={`potential-pill potential-${business.analysis.potential}`}>{business.analysis.potential} <b>{business.analysis.score}</b></span></td><td className="reason-cell">{business.analysis.reasons[0] ?? "No signal yet"}</td></tr>)}</tbody></table>{!businesses.length && <EmptyState />}</div>{selectedBusinessId && <DetailPanel business={businesses.find((business) => business.businessId === selectedBusinessId)} onOpen={onOpen} onCopyPhone={onCopyPhone} onClose={() => onSelect("")} />}</section>;
}

function DetailPanel({ business, onOpen, onCopyPhone, onClose }: { business?: ScoredBusiness; onOpen: (url: string | null) => void; onCopyPhone: (phone: string | null) => void; onClose: () => void }) {
  if (!business) return null;
  return <aside className="detail-panel"><div><p className="kicker">Business detail</p><h3>{business.name}</h3><p>{business.address ?? "Address unavailable"}</p></div><button type="button" className="close-button" onClick={onClose}>Close</button><div className="detail-grid"><span>Category<strong>{business.category ?? "-"}</strong></span><span>Rating<strong>{business.rating ?? "-"}</strong></span><span>Reviews<strong>{business.reviewCount?.toLocaleString() ?? "-"}</strong></span><span>Potential<strong>{business.analysis.potential} · {business.analysis.score}</strong></span></div><p className="detail-reason">{business.analysis.reasons.join(" · ") || "Belum ada indikator yang terpenuhi."}</p><div className="detail-actions"><button type="button" onClick={() => onOpen(business.mapsUrl)}>Open Google Maps</button><button type="button" disabled={!business.website} onClick={() => onOpen(business.website)}>Open website</button><button type="button" disabled={!business.phone} onClick={() => onCopyPhone(business.phone)}>Copy phone</button></div></aside>;
}

function Analytics({ summary }: { summary: ReturnType<typeof summarizeBusinesses> }) { return <section className="content-grid analytics-view"><div className="panel"><div className="panel-heading"><div><p className="kicker">Category analysis</p><h2>Where the dataset clusters</h2></div></div>{summary.categories.length ? summary.categories.map((category) => <Distribution key={category.name} label={category.name} value={category.count} total={summary.total} color="ink" />) : <EmptyState />}</div><div className="panel"><div className="panel-heading"><div><p className="kicker">Coverage</p><h2>Website availability</h2></div></div><Metric label="With website" value={summary.withWebsite} accent="sage" /><Metric label="Without website" value={summary.withoutWebsite} accent="coral" /><Metric label="Unknown" value={summary.total - summary.withWebsite - summary.withoutWebsite} accent="gold" /></div></section>; }
function Datasets({ datasets, activeDatasetId, onSelect, onDelete }: { datasets: Dataset[]; activeDatasetId?: string; onSelect: (id: string) => void; onDelete: () => void }) { return <section className="panel"><div className="panel-heading"><div><p className="kicker">Local storage</p><h2>Your datasets</h2></div>{activeDatasetId && <button className="quiet-button" type="button" onClick={onDelete}>Delete active</button>}</div>{datasets.length ? <div className="dataset-list">{datasets.map((dataset) => <button type="button" key={dataset.datasetId} className={dataset.datasetId === activeDatasetId ? "dataset-card selected" : "dataset-card"} onClick={() => onSelect(dataset.datasetId)}><span className="dataset-symbol">DS</span><span><strong>{dataset.name}</strong><small>{dataset.businesses.length} businesses · {dataset.location ?? "Location unknown"}</small></span><span className="dataset-arrow">→</span></button>)}</div> : <EmptyState />}</section>; }
function Settings({ value, onChange }: { value: string; onChange: (value: string) => void }) { return <section className="panel settings-panel"><p className="kicker">Scoring controls</p><h2>Make the signal yours.</h2><p className="panel-note">Masukkan kategori target dipisahkan koma. Perubahan langsung memengaruhi score dan recommendation dataset aktif.</p><label>Target categories<input value={value} onChange={(event) => onChange(event.target.value)} placeholder="Cafe, Restaurant, Hotel" /></label><div className="rule-list"><div><span className="rule-color coral" />No website <b>+40</b></div><div><span className="rule-color gold" />Target category <b>+20</b></div><div><span className="rule-color sage" />Phone available <b>+10</b></div><div><span className="rule-color ink" />Rating 4.0 / Reviews 100 / 500 <b>+10 each</b></div></div></section>; }
function Metric({ label, value, accent }: { label: string; value: number; accent: string }) { return <div className={`metric-card accent-${accent}`}><span>{label}</span><strong>{value.toLocaleString()}</strong></div>; }
function Distribution({ label, value, total, color }: { label: string; value: number; total: number; color: string }) { const percentage = total ? Math.round((value / total) * 100) : 0; return <div className="distribution"><div><span>{label}</span><b>{value} <small>{percentage}%</small></b></div><div className="bar"><i className={color} style={{ width: `${percentage}%` }} /></div></div>; }
function ProspectRow({ business }: { business: ScoredBusiness }) { return <div className="prospect-row"><div className="avatar">{business.name.slice(0, 1).toUpperCase()}</div><div className="prospect-info"><strong>{business.name}</strong><span>{business.category ?? "Business"} · {business.rating ?? "-"} rating</span></div><span className={`potential-pill potential-${business.analysis.potential}`}>{business.analysis.score}</span></div>; }
function EmptyState() { return <div className="empty-state"><span>—</span><p>Belum ada data pada view ini.</p><small>Import dataset dari extension untuk mulai menganalisis.</small></div>; }

export default App;
