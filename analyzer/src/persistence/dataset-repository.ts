import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Dataset, BusinessRecord } from "../domain/schema";
import { deduplicateBusinesses, mergeBusinesses } from "../domain/deduplication";

interface GMapDatabase extends DBSchema {
  datasets: {
    key: string;
    value: Dataset;
    indexes: { "by-collectedAt": string };
  };
}

export interface DatasetRepository {
  listDatasets(): Promise<Dataset[]>;
  getDataset(datasetId: string): Promise<Dataset | undefined>;
  saveDataset(dataset: Dataset): Promise<void>;
  deleteDataset(datasetId: string): Promise<void>;
  mergeDataset(datasetId: string, records: BusinessRecord[]): Promise<Dataset>;
}

const databaseName = "gmap-prospect-analyzer";

async function getDatabase(): Promise<IDBPDatabase<GMapDatabase>> {
  return openDB<GMapDatabase>(databaseName, 1, {
    upgrade(database) {
      const store = database.createObjectStore("datasets", { keyPath: "datasetId" });
      store.createIndex("by-collectedAt", "collectedAt");
    },
  });
}

export class IndexedDbDatasetRepository implements DatasetRepository {
  async listDatasets(): Promise<Dataset[]> {
    const database = await getDatabase();
    return database.getAll("datasets");
  }

  async getDataset(datasetId: string): Promise<Dataset | undefined> {
    const database = await getDatabase();
    return database.get("datasets", datasetId);
  }

  async saveDataset(dataset: Dataset): Promise<void> {
    const database = await getDatabase();
    await database.put("datasets", { ...dataset, businesses: deduplicateBusinesses(dataset.businesses) });
  }

  async deleteDataset(datasetId: string): Promise<void> {
    const database = await getDatabase();
    await database.delete("datasets", datasetId);
  }

  async mergeDataset(datasetId: string, records: BusinessRecord[]): Promise<Dataset> {
    const existing = await this.getDataset(datasetId);
    if (!existing) throw new Error("Dataset tidak ditemukan.");
    const byId = new Map(existing.businesses.map((business) => [business.businessId, business]));
    for (const record of records) {
      const current = byId.get(record.businessId);
      byId.set(record.businessId, current ? mergeBusinesses(current, record) : record);
    }
    const merged = { ...existing, businesses: [...byId.values()] };
    await this.saveDataset(merged);
    return merged;
  }
}