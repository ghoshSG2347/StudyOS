export type TestUser = {
  subject: string;
  email: string;
  name?: string;
};

export class MockConvexDatabase {
  tables: Map<string, Map<string, any>> = new Map();
  storage: Map<string, { size: number; contentType?: string }> = new Map();
  private idCounter = 1;

  constructor() {
    this.reset();
  }

  reset() {
    this.tables.clear();
    this.storage.clear();
    this.idCounter = 1;
    const tableNames = [
      "profiles",
      "syllabuses",
      "syllabusNodes",
      "nodeNotes",
      "materials",
      "uploadIntents",
      "libraryResources",
      "userPreferences",
    ];
    for (const name of tableNames) {
      this.tables.set(name, new Map());
    }
  }

  addStorageFile(storageId: string, meta: { size: number; contentType?: string }) {
    this.storage.set(storageId, meta);
  }

  createContext(user: TestUser | null = null) {
    const db = {
      insert: async (table: string, doc: any) => {
        if (!this.tables.has(table)) {
          this.tables.set(table, new Map());
        }
        const id = `${table}_${this.idCounter++}`;
        const stored = { ...doc, _id: id, _creationTime: Date.now() };
        this.tables.get(table)!.set(id, stored);
        return id;
      },

      get: async (id: string) => {
        for (const [_, tableMap] of this.tables.entries()) {
          if (tableMap.has(id)) {
            return JSON.parse(JSON.stringify(tableMap.get(id)));
          }
        }
        return null;
      },

      patch: async (id: string, patch: any) => {
        for (const [_, tableMap] of this.tables.entries()) {
          if (tableMap.has(id)) {
            const current = tableMap.get(id);
            const updated = { ...current, ...patch };
            tableMap.set(id, updated);
            return;
          }
        }
        throw new Error(`Document with ID ${id} not found.`);
      },

      delete: async (id: string) => {
        for (const [_, tableMap] of this.tables.entries()) {
          if (tableMap.has(id)) {
            tableMap.delete(id);
            return;
          }
        }
      },

      query: (table: string) => {
        const tableMap = this.tables.get(table) ?? new Map();
        let rows = Array.from(tableMap.values()).map((r) => JSON.parse(JSON.stringify(r)));

        return {
          withIndex: (indexName: string, filterFn?: (q: any) => any) => {
            if (filterFn) {
              const conditions: Array<{ field: string; value: any }> = [];
              const q = {
                eq: (field: string, value: any) => {
                  conditions.push({ field, value });
                  return q;
                },
              };
              filterFn(q);
              rows = rows.filter((row) =>
                conditions.every((c) => row[c.field] === c.value)
              );
            }

            return {
              order: (direction: "asc" | "desc") => {
                rows.sort((a, b) => {
                  const at = a._creationTime ?? 0;
                  const bt = b._creationTime ?? 0;
                  return direction === "desc" ? bt - at : at - bt;
                });
                return {
                  collect: async () => rows,
                  first: async () => rows[0] ?? null,
                };
              },
              collect: async () => rows,
              first: async () => rows[0] ?? null,
              unique: async () => {
                if (rows.length === 0) return null;
                if (rows.length > 1) {
                  throw new Error(`Expected at most 1 document in unique query for ${table}, found ${rows.length}`);
                }
                return rows[0];
              },
            };
          },
          order: (direction: "asc" | "desc") => {
            rows.sort((a, b) => {
              const at = a._creationTime ?? 0;
              const bt = b._creationTime ?? 0;
              return direction === "desc" ? bt - at : at - bt;
            });
            return {
              collect: async () => rows,
              first: async () => rows[0] ?? null,
            };
          },
          collect: async () => rows,
          first: async () => rows[0] ?? null,
          unique: async () => {
            if (rows.length === 0) return null;
            if (rows.length > 1) {
              throw new Error(`Expected at most 1 document in unique query for ${table}, found ${rows.length}`);
            }
            return rows[0];
          },
        };
      },

      system: {
        get: async (storageId: string) => {
          if (!this.storage.has(storageId)) return null;
          const s = this.storage.get(storageId)!;
          return {
            _id: storageId,
            _creationTime: Date.now(),
            size: s.size,
            contentType: s.contentType,
          };
        },
      },
    };

    const storage = {
      generateUploadUrl: async () => "https://storage.convex.cloud/api/upload/test-upload-url",
      getUrl: async (storageId: string) => {
        if (!this.storage.has(storageId)) return null;
        return `https://storage.convex.cloud/api/storage/${storageId}`;
      },
      delete: async (storageId: string) => {
        this.storage.delete(storageId);
      },
    };

    const auth = {
      getUserIdentity: async () => (user ? { ...user } : null),
    };

    return {
      db,
      storage,
      auth,
      runQuery: async (fn: any, args: any) => {
        if (typeof fn === "function" && fn._handler) {
          return await fn._handler({ db, storage, auth }, args);
        }
        return null;
      },
    };
  }
}

