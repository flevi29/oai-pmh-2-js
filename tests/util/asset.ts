import { readFile } from "node:fs/promises";

const baseAssetsPath = new URL("../assets/", import.meta.url);

export async function getAsset(path: string) {
  return await readFile(new URL(path, baseAssetsPath));
}

export async function getAssets(paths: string[]) {
  return await Promise.all(paths.map(getAsset));
}
