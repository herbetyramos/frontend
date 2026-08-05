

export class AuthTokenError extends Error {
  constructor() {
    super("Error with authentication token");
    this.name = "AuthTokenError"; // opcional, mas ajuda no debug
  }
}