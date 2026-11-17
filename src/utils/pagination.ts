import { paginationQuerySchema } from "../schemas/pagination.schema.js";
import { AppError } from "./AppError.js";

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export const paginate = <T>(
    items: T[],
    query: unknown = {},
): PaginatedResponse<T> => {
    const parsed = paginationQuerySchema.safeParse(query);

    if (!parsed.success) {
        throw new AppError(
            400,
            "INVALID_PAGINATION",
            "Los parámetros de paginación son inválidos",
            parsed.error.issues.map((issue) => ({
                attribute: issue.path.join("."),
                message: issue.message,
            })),
        );
    }

    const { page, limit } = parsed.data;
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
        data,
        meta: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
        },
    };
};
