export class AppError extends Error {
	statusCode: number;

	code?: string;

	details?: unknown;

	constructor(message: string, statusCode = 500, code?: string, details?: unknown) {
		super(message);
		this.name = "AppError";
		this.statusCode = statusCode;
		this.code = code;
		this.details = details;
	}

	static badRequest(message = "Bad request", details?: unknown) {
		return new AppError(message, 400, "BAD_REQUEST", details);
	}

	static unauthorized(message = "Unauthorized", details?: unknown) {
		return new AppError(message, 401, "UNAUTHORIZED", details);
	}

	static forbidden(message = "Forbidden", details?: unknown) {
		return new AppError(message, 403, "FORBIDDEN", details);
	}

	static notFound(message = "Resource not found", details?: unknown) {
		return new AppError(message, 404, "NOT_FOUND", details);
	}

	static conflict(message = "Conflict", details?: unknown) {
		return new AppError(message, 409, "CONFLICT", details);
	}

	static unprocessable(message = "Unprocessable entity", details?: unknown) {
		return new AppError(message, 422, "UNPROCESSABLE_ENTITY", details);
	}
}
