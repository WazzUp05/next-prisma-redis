import { ZodError } from "zod";
import { NextResponse } from "next/server";

// Функция обработки ошибок
export function handleError(error: unknown): NextResponse {
    if (error instanceof ZodError) {
        return NextResponse.json({ error: "Ошибка валидации", details: error.format() }, { status: 400 });
    }

    if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "Неизвестная ошибка" }, { status: 500 });
}
