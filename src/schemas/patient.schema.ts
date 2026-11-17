import { z } from "zod";
import { paginationQuerySchema } from "./pagination.schema.js";

export const listPatientsQuerySchema = paginationQuerySchema.extend({
    search: z.string().trim().optional(),
});

export type ListPatientsQuery = z.infer<typeof listPatientsQuerySchema>;
