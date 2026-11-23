import { PatientRepository } from "../repository/patients.repository.js";
import { Patient } from "../models/patient.model.js";
import {
  CreatePatientDto,
  ListPatientsQuery,
  UpdatePatientDto,
} from "../schemas/patient.schema.js";
import { AppError } from "../utils/AppError.js";
import type { PaginatedResponse } from "../utils/pagination.js";

export class PatientService {
  constructor(private readonly repository: PatientRepository) {}

  async findAll(query: ListPatientsQuery): Promise<PaginatedResponse<Patient>> {
    const { data, total } = await this.repository.findAll(query);

    const totalPages = Math.ceil(total / query.limit);
    const meta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages,
      hasNextPage: query.page < totalPages,
      hasPreviousPage: query.page > 1,
    };

    return { data, meta };
  }

  async findById(id: number): Promise<Patient> {
    const patient = await this.repository.findById(id);
    if (!patient) {
      throw new AppError(404, "PATIENT_NOT_FOUND", "No se encontró el paciente");
    }
    return patient;
  }

  async create(data: CreatePatientDto): Promise<Patient> {
    return this.repository.create(data);
  }

  async update(id: number, data: UpdatePatientDto): Promise<Patient> {
    try {
      return await this.repository.update(id, data);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError(404, "PATIENT_NOT_FOUND", "No se encontró el paciente");
      }
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.repository.delete(id);
    } catch (error: any) {
      if (error.code === "P2025") {
        throw new AppError(404, "PATIENT_NOT_FOUND", "No se encontró el paciente");
      }
      throw error;
    }
  }
}