import { Patient } from "../models/patient.model.js";
import { prisma } from "../lib/prisma.js";
import { CreatePatientDto, UpdatePatientDto } from "../schemas/patient.schema.js";

export class PatientRepository {
  async findAll(): Promise<Patient[]> {
    return prisma.patient.findMany();
  }

  async findById(id: number): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { email } });
  }

  async findByDni(dni: string): Promise<Patient | null> {
    return prisma.patient.findUnique({ where: { dni } });
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
