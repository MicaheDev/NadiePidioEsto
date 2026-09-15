import { getCollectionList } from "@/lib/markdown.js";

export async function getGlobalNav() {
  const [courses, tutorials] = await Promise.all([
    getCollectionList("courses"),
    getCollectionList("tutorials")
  ]);

  return { courses, tutorials };
}