import { Patient } from "../models/patient.model.js";
import { prisma } from "../lib/prisma.js";
import {
  CreatePatientDto,
  UpdatePatientDto,
  ListPatientsQuery,
} from "../schemas/patient.schema.js";

export class PatientRepository {
  async findAll(query: ListPatientsQuery) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

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
      prisma.patient.findMany({ where, skip, take: limit }),
      prisma.patient.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: number): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { id } });
  }

  async create(data: CreatePatientDto): Promise<Patient> {
    return prisma.patient.create({ data });
  }

  async update(id: number, data: UpdatePatientDto): Promise<Patient> {
    return prisma.patient.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Patient> {
    return prisma.patient.delete({ where: { id } });
  }
}
