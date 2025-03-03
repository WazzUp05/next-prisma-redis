import { PrismaClient } from "@prisma/client";
import redis from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { User } from "@/types/user";
import { userSchema } from "@/schemas/user";
import { handleError } from "@/middleware/errorHandler";

const prisma = new PrismaClient();

// Функция для очистки кеша
async function clearCache(): Promise<void> {
    const keys = await redis.keys("users:*");
    if (keys.length > 0) {
        await redis.del(...keys);
        console.log("🗑 Кеш пользователей очищен");
    }
}

// GET запрос (пагинация, поиск, кеш)
export async function GET(req: NextRequest): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(req.url);
        const name = searchParams.get("name") || undefined;
        const age = searchParams.get("age") ? Number(searchParams.get("age")) : undefined;
        const page = Number(searchParams.get("page")) || 1;
        const limit = Number(searchParams.get("limit")) || 5;
        const skip = (page - 1) * limit;

        const cacheKey = `users:page=${page}:limit=${limit}:name=${name || "any"}:age=${age || "any"}`;

        const cachedUsers = await redis.get(cacheKey);
        if (cachedUsers) {
            console.log("✅ Данные из кеша Redis");
            return NextResponse.json(JSON.parse(cachedUsers) as User[]);
        }

        const where: any = {};
        if (name) where.name = { contains: name, mode: "insensitive" };
        if (age) where.age = age;

        const users = await prisma.user.findMany({ where, skip, take: limit });

        await redis.set(cacheKey, JSON.stringify(users), "EX", 60);
        console.log("🛠 Данные загружены из БД и записаны в кеш Redis");

        return NextResponse.json(users);
    } catch (error) {
        return handleError(error);
    }
}

// POST запрос (создание пользователя)
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        console.log("📥 Данные запроса:", JSON.stringify(body, null, 2)); // Логируем входные данные

        const validatedData = userSchema.parse(body);

        const newUser = await prisma.user.create({
            data: validatedData,
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("❌ Ошибка валидации:", error); // Логируем ошибку
        return handleError(error);
    }
}

// PUT запрос (обновление пользователя)
export async function PUT(req: NextRequest): Promise<NextResponse> {
    try {
        const { id, name, email, age } = (await req.json()) as User;
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { name, email, age },
        });

        await clearCache();
        return NextResponse.json(updatedUser);
    } catch (error) {
        return handleError(error);
    }
}

// DELETE запрос (удаление пользователя)
export async function DELETE(req: NextRequest): Promise<NextResponse> {
    try {
        const { id } = (await req.json()) as { id: number };
        await prisma.user.delete({ where: { id } });

        await clearCache();
        return NextResponse.json({ message: "Пользователь удален" });
    } catch (error) {
        return handleError(error);
    }
}
