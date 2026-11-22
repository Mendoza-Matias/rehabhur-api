import { TeacherRepository } from "../repository/teacher.repository.js";
import { Teacher } from "../models/teacher.model.js";
import {
  CreateTeacherDto,
  ListTeachersQuery,
  UpdateTeacherDto,
} from "../schemas/teacher.schema.js";
import { AppError } from "../utils/AppError.js";
import { paginate, type PaginatedResponse } from "../utils/pagination.js";

export class TeacherService {
  constructor(private readonly repository: TeacherRepository) {}

  async findAll(): Promise<Teacher[]> {
    return this.repository.findAll();
  }

  async findById(id: number): Promise<Teacher> {
    const teacher = await this.repository.findById(id);
    if (!teacher) {
      throw new AppError(404, "TEACHER_NOT_FOUND", "No se encontró el docente");
    }
    return teacher;
  }

  async create(data: CreateTeacherDto): Promise<Teacher> {
    return this.repository.create(data);
  }

  async update(id: number, data: UpdateTeacherDto): Promise<Teacher> {
    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError(
          404,
          "TEACHER_NOT_FOUND",
          "No se encontró el docente",
        );
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError(
          404,
          "TEACHER_NOT_FOUND",
          "No se encontró el docente",
        );
      }
      throw error;
    }
  }
}
