import type { Request, Response } from "express";

import type { UserResponseDto } from "../dtos/user-response.dto.js";
import type { CreateUserDto } from "../schemas/auth.schema.js";
import { listUsersQuerySchema } from "../schemas/user.schema.js";
import { UserService } from "../services/user.service.js";
import { parseListQuery } from "../middlewares/validate.js";
import type { PaginatedResponse } from "../utils/pagination.js";

export class UserController {
    constructor(private readonly service: UserService) { }

    findAll = (
        req: Request,
        res: Response<PaginatedResponse<UserResponseDto>>
    ): void => {
        const query = parseListQuery(listUsersQuerySchema, req.query);
        res.status(200).json(this.service.findAll(query));
    };

    create = async (
        req: Request<{}, UserResponseDto, CreateUserDto>,
        res: Response<UserResponseDto>
    ): Promise<void> => {
        const created = await this.service.create(req.body);
        res.status(201).json(created);
    };
}
