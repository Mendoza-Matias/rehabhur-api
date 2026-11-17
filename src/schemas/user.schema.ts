import { z } from "zod";
import { roles } from "../models/role.model.js";
import { paginationQuerySchema } from "./pagination.schema.js";

export const listUsersQuerySchema = paginationQuerySchema.extend({
    search: z.string().trim().optional(),
    role: z.enum(roles).optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
