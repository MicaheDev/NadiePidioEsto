import { getLessonsList } from "@/lib/markdown.js";

export async function GET(context, next) {
  const { type, slug } = context.params;

  try {
    const lessons = await getLessonsList(type, slug);
    context.lessonsList = lessons;
    return next();
  } catch (error) {
    console.error("Error al obtener la lista de lecciones:", error);
    context.lessonsList = [];
    return next();
  }
}