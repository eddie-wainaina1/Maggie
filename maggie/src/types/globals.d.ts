export {};

// Create a type for the roles
export type Roles = "admin" | "buyer";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}
