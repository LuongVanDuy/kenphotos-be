import { SetMetadata } from "@nestjs/common";
import { PermissionRole } from "../types";

export const ROLES_KEY = "permissions";

export const Roles = (...roles: PermissionRole[]) => SetMetadata(ROLES_KEY, roles);
