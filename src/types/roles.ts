export const Role = {
  USER: "User",
  ADMIN: "Admin",
}


export type Role = keyof typeof Role;