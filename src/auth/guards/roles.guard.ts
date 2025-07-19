import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ROLES_KEY } from "../../common/decorators/roles.decorator";
import * as fs from "fs";
import * as path from "path";
import { UserRole, PermissionRole } from "src/common/types";

@Injectable()
export class RolesGuard implements CanActivate {
  private customerPermissions: string[] = [];

  constructor(private reflector: Reflector) {
    const jsonPath = path.resolve(process.cwd(), "src/config/customer-permissions.json");
    const rawData = fs.readFileSync(jsonPath, "utf-8");
    const permissionMap = JSON.parse(rawData);
    this.customerPermissions = (permissionMap["CUSTOMER"] || []).map((p) => p.toUpperCase());
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<PermissionRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) return false;

    if (user.role === UserRole.ADMIN) {
      return true;
    }

    if (user.role === UserRole.CUSTOMER) {
      return requiredRoles.every((required) => {
        const permissionKey = `${required.module}_${required.permission}`.toUpperCase();
        return this.customerPermissions.includes(permissionKey);
      });
    }

    return false;
  }
}
