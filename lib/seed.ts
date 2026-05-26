import type { AppData } from "./types";
import seedDataJson from "./seed-data.json";

export const seedData: AppData = seedDataJson as AppData;

export const cloneSeedData = (): AppData => JSON.parse(JSON.stringify(seedData));
