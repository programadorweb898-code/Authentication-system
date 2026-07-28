import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity.js";
import { RefreshToken } from "./entities/refresh_token.entity.js";
import { TokenBlacklist } from "./entities/token_blacklist.entity.js";
import { SystemSettings } from "./entities/system_settings.entity.js";
import { AuditLog } from "./entities/audit_log.entity.js";
import { Product } from "./entities/product.entity.js";
import { CartItem } from "./entities/cartItem.entity.js";
import { Order } from "./entities/order.entity.js";
import { OrderItem } from "./entities/orderItem.entity.js";
import { Address } from "./entities/address.entity.js";
import { Store } from "./entities/store.entity.js";
import { ProductImage } from "./entities/productImage.entity.js";

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    logging: false,
    entities: [User, RefreshToken, TokenBlacklist, SystemSettings, AuditLog, Product, CartItem, Order, OrderItem, Address, Store, ProductImage],
    migrations: [],
    subscribers: [],
});
