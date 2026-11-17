import type { Request, Response } from "express";

import type { UserResponseDto } from "../dtos/user-response.dto.js";
import type { CreateUserDto } from "../schemas/auth.schema.js";
import { UserService } from "../services/user.service.js";

export class UserController {
    constructor(private readonly service: UserService) { }

    findAll = (
        _req: Request,
        res: Response<UserResponseDto[]>
    ): void => {
        res.status(200).json(this.service.findAll());
    };

    create = async (
        req: Request<{}, UserResponseDto, CreateUserDto>,
        res: Response<UserResponseDto>
    ): Promise<void> => {
        const created = await this.service.create(req.body);
        res.status(201).json(created);
    };
}
