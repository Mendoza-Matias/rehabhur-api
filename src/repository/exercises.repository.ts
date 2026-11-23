import { Exercise } from "../models/exercise.model.js";
import { prisma } from "../lib/prisma.js";
import {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../schemas/exercise.schema.js";

export class ExerciseRepository {
  async findByLinkVideo(linkVideo: string): Promise<Exercise | null> {
    return prisma.exercise.findUnique({ where: { linkVideo } });
  }

  async findByNameAndBodyRegion(
    name: string,
    bodyRegion: string,
  ): Promise<Exercise | null> {
    return prisma.exercise.findFirst({
      where: { name, bodyRegion },
    });
  }

  async findAll(): Promise<Exercise[]> {
    return prisma.exercise.findMany();
  }

  async findById(id: number): Promise<Exercise | null> {
    return prisma.exercise.findUnique({ where: { id } });
  }

  async create(data: CreateExerciseDto): Promise<Exercise> {
    return prisma.exercise.create({ data });
  }

  async update(id: number, data: UpdateExerciseDto): Promise<Exercise> {
    return prisma.exercise.update({
      where: { id },
      data,
    });
  }

  async delete(id: number): Promise<Exercise> {
    return prisma.exercise.delete({ where: { id } });
  }
}
