import { z } from "zod";

export const paginationQuerySchema = z.object({
    page: z.coerce
        .number()
        .int("La página debe ser un número entero")
        .positive("La página debe ser mayor a 0")
        .default(1),
    limit: z.coerce
        .number()
        .int("El límite debe ser un número entero")
        .positive("El límite debe ser mayor a 0")
        .max(100, "El límite no puede superar 100")
        .default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
