import type { Person } from "../models/person.model.js";
import { prisma } from "../lib/prisma.js";
import type { CreatePersonDto, UpdatePersonDto } from "../schemas/person.schema.js";

export class PersonRepository {
  async findAll(): Promise<Person[]> {
    return prisma.person.findMany();
  }

  async findById(id: number): Promise<Person | null> {
    return prisma.person.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<Person | null> {
    return prisma.person.findUnique({ where: { email } });
  }

  async findByDni(dni: string): Promise<Person | null> {
    return prisma.person.findUnique({ where: { dni } });
  }

  async create(data: CreatePersonDto): Promise<Person> {
    return prisma.person.create({ data });
  }

  async update(id: number, data: UpdatePersonDto): Promise<Person> {
    return prisma.person.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Person> {
    return prisma.person.delete({ where: { id } });
  }
}
