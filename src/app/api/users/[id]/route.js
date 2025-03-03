import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req, { params }) {
    try {
        const user = await prisma.user.findUnique({ where: { id: Number(params.id) } });
        if (!user) return Response.json({ error: "Пользователь не найден" }, { status: 404 });
        return Response.json(user);
    } catch (error) {
        return Response.json({ error: "Ошибка при получении пользователя" + error }, { status: 500 });
    }
}
