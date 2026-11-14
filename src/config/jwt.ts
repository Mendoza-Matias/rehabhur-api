import "dotenv/config";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error("Falta configurar JWT_SECRET en el entorno");
}

const decodedSecret = Buffer.from(jwtSecret, "base64");

if (decodedSecret.length !== 32 || decodedSecret.toString("base64") !== jwtSecret) {
    throw new Error("JWT_SECRET debe ser una clave Base64 válida de 256 bits");
}

export const JWT_SECRET = jwtSecret;
