export type Pageable = {
  limit?: number;
  offset?: number;
};

export type Direction = "asc" | "desc";

export interface Sort {
  [key: string]: Direction | Sort;
}

export enum SuccessType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  READ = "read",
  LIST = "list",
  RESTORE = "restore",
}

export enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export interface PermissionRole {
  module: string;
  permission: string;
}

export enum UserStatus {
  DEACTIVATED = 0,
  ACTIVATED = 1,
  REJECTED = 2,
}

export enum Module {
  USER = "USER",
  MEDIA = "MEDIA",
  POST = "POST",
}

export enum Permission {
  READ = "READ",
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  IMPORT = "IMPORT",
  EXPORT = "EXPORT",
  RESTORE = "RESTORE",
}
