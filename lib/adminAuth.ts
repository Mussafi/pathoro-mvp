import "server-only";

const ADMIN_TOKEN_HEADER = "x-admin-token";

export function isAuthorizedAdminRequest(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const provided = request.headers.get(ADMIN_TOKEN_HEADER);
  return provided === expected;
}
