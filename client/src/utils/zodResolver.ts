import type { FieldErrors, FieldValues, Resolver } from 'react-hook-form';

interface ZodIssue {
  path: Array<string | number>;
  code: string;
  message: string;
}

type ZodSchema = {
  safeParse(
    data: unknown,
  ):
    | { success: true; data: unknown }
    | { success: false; error: { issues: ZodIssue[] } };
};

export function createZodResolver<T extends FieldValues>(schema: ZodSchema): Resolver<T> {
  return async (data, _context, _options) => {
    const result = schema.safeParse(data);
    if (result.success) {
      return { values: result.data as T, errors: {} };
    }
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }
    return { values: {} as Record<string, never>, errors: errors as unknown as FieldErrors<T> };
  };
}
