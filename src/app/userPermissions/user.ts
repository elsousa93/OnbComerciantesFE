import { UserPermissions } from "./user-permissions";

export interface User {
  userName?: string,
  bankName?: string,
  bankLocation?: string,
  permissions?: UserPermissions,
  token?: string,
  authTime?: string,
  tenant?: string
}
