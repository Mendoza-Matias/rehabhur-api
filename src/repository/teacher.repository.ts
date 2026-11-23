import { Teacher } from "../models/teacher.model.js";
import { prisma } from "../lib/prisma.js";
import {
  CreateTeacherDto,
  UpdateTeacherDto,
  ListTeachersQuery,
} from "../schemas/teacher.schema.js";

export class TeacherRepository {
  async findAll(skip: number, take: number, search?: string) {
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { last_name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { dni: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await Promise.all([
    prisma.teacher.findMany({ where, skip, take }),
    prisma.teacher.count({ where }),
  ]);

  return { data, total };
}


  async findByEmail(email: string): Promise<Teacher | null> {
    return prisma.teacher.findUnique({
      where: { email },
    });
  }

  async findByDni(dni: string): Promise<Teacher | null> {
    return prisma.teacher.findUnique({
      where: { dni },
    });
  }


  async findById(id: number): Promise<Teacher | null> {
    return prisma.teacher.findUnique({ where: { id } });
  }

  async create(data: CreateTeacherDto): Promise<Teacher> {
    return prisma.teacher.create({ data });
  }

  async update(id: number, data: UpdateTeacherDto): Promise<Teacher> {
    return prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Teacher> {
    return prisma.teacher.delete({ where: { id } });
  }
}
