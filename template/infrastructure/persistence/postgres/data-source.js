import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity.js";
import { RefreshToken } from "./entities/refresh_token.entity.js";
import { TokenBlacklist } from "./entities/token_blacklist.entity.js";
import { SystemSettings } from "./entities/system_settings.entity.js";
import { AuditLog } from "./entities/audit_log.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken, TokenBlacklist, SystemSettings, AuditLog],
    migrations: [],
    subscribers: [],
});
