export class MemoryRepository {
  constructor() {
    this.data = [];
  }

  async read() {
    return this.data;
  }

  async write(data) {
    this.data = data;
  }
}