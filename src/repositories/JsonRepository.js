import fs from "fs/promises";
import path from "path";

export class JsonRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const data = await fs.readFile(
        this.filePath,
        "utf-8"
      );

      return JSON.parse(data);
    } catch (error) {
      if (error.code === "ENOENT") {
        return {};
      }

      throw error;
    }
  }

  async write(data) {
    await fs.mkdir(
      path.dirname(this.filePath),
      { recursive: true }
    );

    await fs.writeFile(
      this.filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  }
}