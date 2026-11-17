import type { Request, Response } from "express";
import { PersonService } from "../services/person.service.js";
import { PersonResponseDto, toPersonResponseDto } from "../dtos/person-response.dto.js";
import { listPersonsQuerySchema, type CreatePersonDto, type UpdatePersonDto } from "../schemas/person.schema.js";
import { parseListQuery } from "../middlewares/validate.js";
import type { PaginatedResponse } from "../utils/pagination.js";

export class PersonController {
  constructor(private readonly service: PersonService) {}

  findAll = (req: Request, res: Response<PaginatedResponse<PersonResponseDto>>): void => {
    const query = parseListQuery(listPersonsQuerySchema, req.query);
    const result = this.service.findAll(query);
    res.status(200).json({
      data: result.data.map(toPersonResponseDto),
      meta: result.meta,
    });
  };

  findById = (req: Request<{ id: string }>, res: Response<PersonResponseDto>): void => {
    const person = this.service.findById(Number(req.params.id));
    res.status(200).json(toPersonResponseDto(person));
  };

  create = (req: Request<{}, PersonResponseDto, CreatePersonDto>, res: Response<PersonResponseDto>): void => {
    const created = this.service.create(req.body);
    res.status(201).json(toPersonResponseDto(created));
  };

  update = (req: Request<{ id: string }, PersonResponseDto, UpdatePersonDto>, res: Response<PersonResponseDto>): void => {
    const updated = this.service.update(Number(req.params.id), req.body);
    res.status(200).json(toPersonResponseDto(updated));
  };

  delete = (req: Request<{ id: string }>, res: Response): void => {
    this.service.delete(Number(req.params.id));
    res.status(204).end();
  };
}
