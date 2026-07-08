export interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string>;
}

export class ApiError extends Error {
  errors?: Record<string, string>;

  constructor(message: string, errors?: Record<string, string>) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
  }
}

export const parseApiError = async (res: Response, fallback: string): Promise<ApiError> => {
  try {
    const data: ApiErrorBody = await res.json();
    return new ApiError(data.message || fallback, data.errors);
  } catch {
    return new ApiError(fallback);
  }
};
