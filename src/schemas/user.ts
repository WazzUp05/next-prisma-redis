import { z } from "zod";

// Схема для создания пользователя
export const userSchema = z.object({
    name: z.string().min(2, "Имя слишком короткое"),
    email: z.string().regex(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/, "Некорректный email"),
    age: z.number().int().positive().optional(),
});

// Тип на основе схемы
export type UserSchema = z.infer<typeof userSchema>;
