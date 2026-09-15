import { getLessonData, getLessonsList } from "@/lib/markdown.js";

export async function GET(context, next) {
  const { type, slug, lessonId } = context.params;

  // Filtro de seguridad rápido para ignorar peticiones automáticas de Chrome o archivos extraños
  if (!lessonId || lessonId.endsWith('.json') || lessonId.startsWith('.')) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const [lesson, lessons] = await Promise.all([
      getLessonData(type, slug, lessonId),
      getLessonsList(type, slug)
    ]);

    context.lesson = lesson;
    context.lessons = lessons;

    return next();
  } catch (error) {
    console.error("Error cargando lección:", error);
    return new Response("Lección no encontrada", { status: 404 });
  }
}