export const roles = ["admin", "docente", "estudiante", "paciente"] as const;

export type Role = (typeof roles)[number];
