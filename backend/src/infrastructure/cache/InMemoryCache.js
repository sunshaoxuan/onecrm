export class InMemoryCache {
  constructor() {
    this.map = new Map();
    this.version = Date.now();
  }

  getVersion() {
    return this.version;
  }

  get(key) {
    return this.map.get(key);
  }

  set(key, value) {
    this.map.set(key, value);
  }

  invalidate() {
    this.map.clear();
    this.version = Date.now();
  }
}

