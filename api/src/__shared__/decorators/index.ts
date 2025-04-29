import { IPagination } from "../interfaces/pagination.interface";
import { IsOptional } from "class-validator";
import {
  applyDecorators,
  createParamDecorator,
  Delete,
  ExecutionContext,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiPropertyOptional,
  ApiPropertyOptions,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import {
  getArraySchema,
  getGenericErrorResponseSchema,
  getGenericResponseSchema,
  getPaginatedSchema,
} from "../utils/swagger.util";

/**
 * Generates a class with a random name that extends the given model.
 * This helps in avoiding naming conflicts when using the class in decorators.
 *
 * @param {any} model - The base model class to extend.
 * @returns {any} - A new class with a random name that extends the given model.
 */
function generateRandomModelClass(model: any): any {
  if (!model) return class {};
  const prefix = `${model.name}_`;
  const modelName = `${prefix}${Math.random().toString(36).substring(2, 15)}`;
  return {
    [modelName]: class extends model {},
  }[modelName];
}

export function ApiRequestBody(model: any) {
  const randomModel = generateRandomModelClass(model);
  return applyDecorators(ApiBody({ type: randomModel }));
}

export const PaginationParams = createParamDecorator(
  (_data, ctx: ExecutionContext): IPagination => {
    const req = ctx.switchToHttp().getRequest();
    return {
      page: +req?.query?.page || 0,
      size: +req?.query?.limit || 10,
    };
  },
);

/**
 * Custom implementation of @ApiQuery for paginated endpoints
 * @returns @ApiQuery
 */
export function Paginated() {
  return applyDecorators(
    ApiQuery({ name: "page", required: false }),
    ApiQuery({ name: "limit", required: false }),
  );
}

/**
 * Custom implementation of @ApiOperation
 * @param summary description of the operation
 * @returns @ApiOperation
 */
export function Operation(summary: string) {
  return applyDecorators(
    ApiOperation({
      summary,
    }),
  );
}

/**
 * Custom implementation of @ApiResponse for general responses
 * @param status status code
 * @param model optional model to be returned
 * @returns @ApiResponse
 */
export function Response(status: number, model?: any) {
  const randomModel = generateRandomModelClass(model);
  if (status < 300)
    return applyDecorators(
      ApiExtraModels(randomModel),
      ApiResponse({
        status,
        ...getGenericResponseSchema(randomModel),
      }),
      HttpCode(status),
    );
  else throw new TypeError("Status passed to decorator not a success status");
}

/**
 * Custom implementation of @ApiResponse for OK responses
 * @param model optional model to be returned
 * @returns @ApiResponse
 */
export function OkResponse(model?: any) {
  return Response(HttpStatus.OK, model);
}

/**
 * Custom implementation of @ApiResponse for POST responses
 * @param model optional model to be returned
 * @returns @ApiResponse
 */
export function CreatedResponse(model?: any) {
  return Response(HttpStatus.CREATED, model);
}

/**
 * Custom implementation of @ApiResponse for OK responses returning a paginated result
 * @param model model to be returned
 * @returns {ReturnType<typeof applyDecorators>} - The combined decorators for the response.
 */
export function PaginatedOkResponse(
  model: any,
): ReturnType<typeof applyDecorators> {
  const randomModel = generateRandomModelClass(model);
  return applyDecorators(
    ApiExtraModels(randomModel),
    ApiOkResponse({ ...getPaginatedSchema(randomModel) }),
  );
}

/**
 * Custom implementation of @ApiResponse for responses returning an array.
 * Generates a class with a random name that extends the given model to avoid naming conflicts.
 *
 * @param {HttpStatus} status - The HTTP status code for the response.
 * @param {any} model - The base model class to extend (optional).
 * @returns {ReturnType<typeof applyDecorators>} - The combined decorators for the response.
 */
export function ArrayResponse(
  status: HttpStatus,
  model?: any,
): ReturnType<typeof applyDecorators> {
  const randomModel = generateRandomModelClass(model);
  return applyDecorators(
    ApiResponse({ status, ...getArraySchema(randomModel) }),
  );
}

/**
 * Custom implementation of @ApiResponse for OK responses returning an array
 * @param model optional model to be returned
 * @returns @ApiResponse
 */
export function OkArrayResponse(model?: any) {
  return ArrayResponse(HttpStatus.OK, model);
}

/**
 * Custom implementation of @ApiResponse for POST responses returning an array
 * @param model optional model to be returned
 * @returns @ApiResponse
 */
export function CreatedArrayResponse(model?: any) {
  return ArrayResponse(HttpStatus.CREATED, model);
}

/**
 * Combines error decorator functions for swagger
 * @param errorResponses a list of error response decorator functions
 * @returns wrapper combining all the error decorators
 */
export function ErrorResponses(...errorResponses: any[]) {
  return applyDecorators(
    ApiResponse({
      description: "Error response schema.",
      ...getGenericErrorResponseSchema(),
    }),
    ...errorResponses.map((e) => e()),
  );
}

/**
 * Custom wrapper for @ApiUnauthorizedResponse
 */
export function UnauthorizedResponse(description?: string) {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: description || "Unauthorized",
    }),
  );
}

/**
 * Custom wrapper for @ApiForbiddenResponse
 */
export function ForbiddenResponse(description?: string) {
  return applyDecorators(
    ApiForbiddenResponse({
      description: description || "Forbidden resource",
    }),
  );
}

/**
 * Custom wrapper for @ApiBadRequestResponse
 */
export function BadRequestResponse(description?: string) {
  return applyDecorators(
    ApiBadRequestResponse({
      description: description || "Invalid request",
    }),
  );
}

/**
 * Custom wrapper for @ApiConflictResponse
 */
export function ConflictResponse(description?: string) {
  return applyDecorators(
    ApiConflictResponse({
      description: description || "Conflict",
    }),
  );
}

/**
 * Custom wrapper for @ApiNotFoundResponse
 */
export function NotFoundResponse(description?: string) {
  return applyDecorators(
    ApiNotFoundResponse({
      description: description || "Resource Not found",
    }),
  );
}

/**
 * Combines @ApiPropertyOptional and @IsOptional
 * @param options Options for @ApiPropertyOptional
 *
 */
export function OptionalProperty(options?: ApiPropertyOptions) {
  return applyDecorators(ApiPropertyOptional(options), IsOptional());
}

export function PostOperation(endpoint: string, summary: string) {
  return applyDecorators(
    Post(endpoint),
    ApiOperation({
      summary,
    }),
  );
}

export function GetOperation(endpoint: string, summary: string) {
  return applyDecorators(
    Get(endpoint),
    ApiOperation({
      summary,
    }),
  );
}

export function DeleteOperation(endpoint: string, summary: string) {
  return applyDecorators(
    Delete(endpoint),
    ApiOperation({
      summary,
    }),
  );
}

export function PatchOperation(endpoint: string, summary: string) {
  return applyDecorators(
    Patch(endpoint),
    ApiOperation({
      summary,
    }),
  );
}

export function PutOperation(endpoint: string, summary: string) {
  return applyDecorators(
    Put(endpoint),
    ApiOperation({
      summary,
    }),
  );
}
