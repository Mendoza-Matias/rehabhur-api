import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "./app.js";

const ADMIN = { email: "admin@rehabhur.com", password: "Password123" };
const PACIENTE = { email: "paciente@rehabhur.com", password: "Password123" };

let sequence = 0;

const nextIdentity = (prefix: string) => {
    sequence += 1;
    return {
        email: `${prefix}.${Date.now()}.${sequence}@example.com`,
        dni: String(39_000_000 + sequence),
    };
};

const signin = (email: string, password: string) =>
    request(app).post("/api/v1/auth/signin").send({ email, password });

const logoutAndRefresh = async (refreshToken: string) =>
    request(app).post("/api/v1/auth/refresh-token").send({ refreshToken });

describe("Autenticación", () => {
    it("inicia sesión con el administrador de prueba sin exponer la contraseña", async () => {
        const response = await signin(ADMIN.email, ADMIN.password);

        expect(response.status).toBe(200);
        expect(response.body.user).toMatchObject({
            email: ADMIN.email,
            role: "admin",
        });
        expect(response.body.user).not.toHaveProperty("passwordHash");
        expect(response.body.accessToken).toEqual(expect.any(String));
        expect(response.body.refreshToken).toEqual(expect.any(String));
    });

    it("rechaza credenciales inválidas", async () => {
        const response = await signin(ADMIN.email, "ContraseñaIncorrecta1");

        expect(response.status).toBe(401);
        expect(response.body.error.code).toBe("INVALID_CREDENTIALS");
    });

    it("registra un paciente desde el endpoint público", async () => {
        const { email, dni } = nextIdentity("paciente.nuevo");
        const signup = await request(app)
            .post("/api/v1/auth/signup")
            .send({
                firstName: "Paciente",
                lastName: "Nuevo",
                dni,
                email,
                password: "Password123",
            });

        expect(signup.status).toBe(201);
        expect(signup.body.user).toMatchObject({ email, role: "paciente" });

        const session = await signin(email, "Password123");
        expect(session.status).toBe(200);
        expect(session.body.user.role).toBe("paciente");
    });

    it("ignora el rol enviado en el registro público y siempre crea pacientes", async () => {
        const { email, dni } = nextIdentity("paciente.con.rol");
        const signup = await request(app)
            .post("/api/v1/auth/signup")
            .send({
                firstName: "Paciente",
                lastName: "Con Rol",
                dni,
                email,
                password: "Password123",
                role: "admin",
            });

        expect(signup.status).toBe(201);
        expect(signup.body.user.role).toBe("paciente");
    });

    it("devuelve el perfil del usuario autenticado", async () => {
        const session = await signin(ADMIN.email, ADMIN.password);

        const response = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", `Bearer ${session.body.accessToken}`);

        expect(response.status).toBe(200);
        expect(response.body).toMatchObject({
            id: session.body.user.id,
            email: ADMIN.email,
            role: "admin",
        });
    });

    it("rechaza el perfil sin token o con un token inválido", async () => {
        const withoutToken = await request(app).get("/api/v1/auth/profile");
        expect(withoutToken.status).toBe(401);
        expect(withoutToken.body.error.code).toBe("UNAUTHORIZED");

        const invalidToken = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", "Bearer token-invalido");
        expect(invalidToken.status).toBe(401);
    });

    it("renueva los tokens y no permite reutilizar el refresh token anterior", async () => {
        const session = await signin(ADMIN.email, ADMIN.password);

        const refreshed = await logoutAndRefresh(session.body.refreshToken);
        expect(refreshed.status).toBe(200);
        expect(refreshed.body.accessToken).toEqual(expect.any(String));
        expect(refreshed.body.refreshToken).not.toBe(session.body.refreshToken);

        const reused = await logoutAndRefresh(session.body.refreshToken);
        expect(reused.status).toBe(401);
        expect(reused.body.error.code).toBe("INVALID_REFRESH_TOKEN");

        const profile = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", `Bearer ${refreshed.body.accessToken}`);
        expect(profile.status).toBe(200);
    });

    it("impide que un paciente cree usuarios", async () => {
        const session = await signin(PACIENTE.email, PACIENTE.password);
        const { email, dni } = nextIdentity("docente.prohibido");

        const response = await request(app)
            .post("/api/v1/users")
            .set("Authorization", `Bearer ${session.body.accessToken}`)
            .send({
                firstName: "Docente",
                lastName: "Prohibido",
                dni,
                email,
                password: "Password123",
                role: "docente",
            });

        expect(response.status).toBe(403);
        expect(response.body.error.code).toBe("FORBIDDEN");
    });

    it("permite al administrador crear un docente y ese docente puede iniciar sesión", async () => {
        const adminSession = await signin(ADMIN.email, ADMIN.password);
        const { email, dni } = nextIdentity("docente.nuevo");

        const created = await request(app)
            .post("/api/v1/users")
            .set("Authorization", `Bearer ${adminSession.body.accessToken}`)
            .send({
                firstName: "Docente",
                lastName: "Nuevo",
                dni,
                email,
                password: "Password123",
                role: "docente",
            });

        expect(created.status).toBe(201);
        expect(created.body).toMatchObject({ email, role: "docente" });

        const docenteSession = await signin(email, "Password123");
        expect(docenteSession.status).toBe(200);
        expect(docenteSession.body.user.role).toBe("docente");

        const profile = await request(app)
            .get("/api/v1/auth/profile")
            .set("Authorization", `Bearer ${docenteSession.body.accessToken}`);
        expect(profile.status).toBe(200);
        expect(profile.body.role).toBe("docente");

        const listUsers = await request(app)
            .get("/api/v1/users")
            .set("Authorization", `Bearer ${docenteSession.body.accessToken}`);
        expect(listUsers.status).toBe(403);
    });
});
