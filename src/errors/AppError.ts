export class AppError extends Error {
  private statusCode: number;
  constructor(statusCode: number, name?: string, message?: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = name;
  }
}
