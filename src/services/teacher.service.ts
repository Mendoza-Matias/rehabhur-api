import { TeacherRepository } from "../repository/teacher.repository.js";
import { Teacher } from "../models/teacher.model.js";
import { CreateTeacherDto, ListTeachersQuery, UpdateTeacherDto } from "../schemas/teacher.schema.js";
import { AppError } from "../utils/AppError.js";
import { paginate, type PaginatedResponse } from "../utils/pagination.js";

export class TeacherService {
  constructor(private readonly repository: TeacherRepository) { }

  findAll(query: ListTeachersQuery = { page: 1, limit: 10 }): PaginatedResponse<Teacher> {
    const search = query.search?.toLowerCase();
    const teachers = this.repository.findAll().filter((teacher) => {
      if (!search) {
        return true;
      }

      return [teacher.name, teacher.last_name, teacher.email, teacher.dni]
        .some((value) => value.toLowerCase().includes(search));
    });

    return paginate(teachers, query);
  }

  findById(id: number): Teacher {
    return this.findOrThrow(id);
  }

  create(data: CreateTeacherDto): Teacher {
    return this.repository.create(data);
  }

  update(id: number, data: UpdateTeacherDto): Teacher {
    const teacher = this.repository.update(id, data);
    if (!teacher) {
      throw new AppError(404, "TEACHER_NOT_FOUND", "No se encontró el docente");
    }
    return teacher;
  }

  delete(id: number): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new AppError(404, "TEACHER_NOT_FOUND", "No se encontró el docente");
    }
  }

  private findOrThrow(id: number): Teacher {
    const teacher = this.repository.findById(id);
    if (!teacher) {
      throw new AppError(404, "TEACHER_NOT_FOUND", "No se encontró el docente");
    }
    return teacher;
  }
}
