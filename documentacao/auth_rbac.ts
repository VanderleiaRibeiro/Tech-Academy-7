export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

export interface Permission {
  resource: "habits" | "users";
  actions: ("create" | "read" | "update" | "delete")[];
}

export const USER_PERMISSIONS: Permission[] = [
  { resource: "habits", actions: ["create", "read", "update", "delete"] },
  { resource: "users", actions: ["read", "update"] },
];
