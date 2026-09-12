export function createFakeIndexedDb() {
  const stores: Record<string, Map<string, unknown>> = {};
  let failWrites = false;
  let failOpen = false;

  const getStore = (name: string) => {
    if (!stores[name]) stores[name] = new Map();
    return stores[name];
  };

  class Req {
    result: any;
    error: any = null;
    onsuccess: ((e?: unknown) => void) | null = null;
    onerror: ((e?: unknown) => void) | null = null;
    onupgradeneeded: ((e?: unknown) => void) | null = null;
    onblocked: ((e?: unknown) => void) | null = null;
    constructor(result?: any) {
      this.result = result;
    }
  }

  class Tx {
    oncomplete: (() => void) | null = null;
    onerror: ((e?: unknown) => void) | null = null;
    onabort: ((e?: unknown) => void) | null = null;
    error: any = null;
    objectStore(name: string) {
      return new Store(name, this);
    }
    complete() {
      queueMicrotask(() => this.oncomplete?.());
    }
    fail() {
      this.error = new Error("QuotaExceededError");
      queueMicrotask(() => this.onerror?.({ target: this }));
    }
  }

  class Store {
    constructor(private name: string, private tx: Tx) {}
    put(record: { id: string }) {
      const req = new Req();
      if (failWrites) {
        this.tx.fail();
      } else {
        getStore(this.name).set(record.id, record);
        queueMicrotask(() => req.onsuccess?.({ target: req }));
        this.tx.complete();
      }
      return req;
    }
    get(id: string) {
      const req = new Req();
      queueMicrotask(() => {
        req.result = getStore(this.name).get(id);
        req.onsuccess?.({ target: req });
      });
      return req;
    }
    delete(id: string) {
      const req = new Req();
      getStore(this.name).delete(id);
      queueMicrotask(() => req.onsuccess?.({ target: req }));
      this.tx.complete();
      return req;
    }
  }

  class Db {
    objectStoreNames = { contains: (name: string) => !!stores[name] };
    createObjectStore(name: string) {
      getStore(name);
      return new Store(name, new Tx());
    }
    transaction(_name: string, _mode?: string) {
      return new Tx();
    }
  }

  const indexedDB = {
    open(_name: string, _version: number) {
      const db = new Db();
      const req = new Req(db);
      queueMicrotask(() => {
        if (failOpen) {
          req.error = new Error("IndexedDB open failed");
          req.onerror?.({ target: req });
          return;
        }
        if (!stores.assets) req.onupgradeneeded?.({ target: req });
        req.onsuccess?.({ target: req });
      });
      return req;
    },
  };

  return {
    indexedDB,
    stores,
    setFailWrites(value: boolean) { failWrites = value; },
    setFailOpen(value: boolean) { failOpen = value; },
  };
}
