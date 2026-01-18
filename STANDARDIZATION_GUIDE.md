# Standardization Guide for Implementing New Features

This guide outlines the standards and best practices to follow when implementing new features in the Typescript Starter project. Adhering to these guidelines ensures consistency, maintainability, and scalability of the codebase.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Naming Conventions](#naming-conventions)
3. [File Organization](#file-organization)
4. [Code Style](#code-style)
5. [Error Handling](#error-handling)
6. [Testing](#testing)
7. [Documentation](#documentation)
8. [API Design](#api-design)
9. [Dependencies](#dependencies)
10. [Examples from the Codebase](#examples-from-the-codebase)

## Project Structure

The project follows a modular structure where features are organized under the `src` directory. Each feature or domain should have its own directory under `src/api` with the following structure:

```
src/
  api/
    featureName/
      __tests__/
        featureName.test.ts
      featureNameController.ts
      featureNameModel.ts
      featureNameRepository.ts
      featureNameRouter.ts
      featureNameService.ts
```

## Naming Conventions

- **Files**: Use PascalCase for file names (e.g., `userController.ts`).
- **Directories**: Use camelCase for directory names (e.g., `userManagement`).
- **Variables and Functions**: Use camelCase (e.g., `getUserById`).
- **Classes and Interfaces**: Use PascalCase (e.g., `UserModel`, `IUserRepository`).
- **Constants**: Use UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`).

## File Organization

Each feature should be split into the following files:

1. **Model**: Defines the data structure and validation (e.g., `userModel.ts`).
2. **Repository**: Handles data access logic (e.g., `userRepository.ts`).
3. **Service**: Contains business logic (e.g., `userService.ts`).
4. **Controller**: Manages HTTP request/response (e.g., `userController.ts`).
5. **Router**: Defines API routes (e.g., `userRouter.ts`).

## Code Style

- Use TypeScript for type safety.
- Follow the Biome configuration for linting and formatting.
- Use `async/await` for asynchronous operations.
- Avoid using `any` type; prefer explicit types or generics.
- Use arrow functions for callbacks and anonymous functions.

## Error Handling

- Use the `ServiceResponse` model for consistent error handling.
- Implement middleware for global error handling (e.g., `errorHandler.ts`).
- Return appropriate HTTP status codes for different types of errors.

## Testing

- Write unit tests for each module and place them in the `__tests__` directory.
- Use Jest for testing.
- Aim for high test coverage, especially for critical paths.
- Mock external dependencies in tests.

## Documentation

- Document all public APIs using JSDoc comments.
- Update the `backend_api_documentation.md` file with new API endpoints.
- Use OpenAPI/Swagger for API documentation (e.g., `openAPIDocumentGenerator.ts`).

## API Design

- Follow RESTful principles for API design.
- Use consistent naming for endpoints (e.g., `/users` for CRUD operations on users).
- Implement rate limiting for public APIs (e.g., `rateLimiter.ts`).
- Use middleware for request logging (e.g., `requestLogger.ts`).

## Dependencies

- Use PNPM for package management.
- Keep dependencies up-to-date using Renovate.
- Avoid adding unnecessary dependencies; prefer built-in solutions or lightweight libraries.

## Examples from the Codebase

### User Model

The `userModel.ts` file defines the data structure and validation for the User entity:

```typescript
// src/api/user/userModel.ts

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export const createUser = (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
  return {
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...userData,
  };
};
```

### User Repository

The `userRepository.ts` file handles data access logic:

```typescript
// src/api/user/userRepository.ts

import { User } from './userModel';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
  update(id: string, user: Partial<User>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  async findAll(): Promise<User[]> {
    // Implementation here
  }

  async findById(id: string): Promise<User | null> {
    // Implementation here
  }

  async create(user: User): Promise<User> {
    // Implementation here
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    // Implementation here
  }

  async delete(id: string): Promise<boolean> {
    // Implementation here
  }
}
```

### User Service

The `userService.ts` file contains business logic:

```typescript
// src/api/user/userService.ts

import { User } from './userModel';
import { IUserRepository } from './userRepository';
import { ServiceResponse } from '../../common/models/serviceResponse';

export class UserService {
  constructor(private userRepository: IUserRepository) {}

  async getAllUsers(): Promise<ServiceResponse<User[]>> {
    try {
      const users = await this.userRepository.findAll();
      return ServiceResponse.success(users);
    } catch (error) {
      return ServiceResponse.error('Failed to fetch users');
    }
  }

  async getUserById(id: string): Promise<ServiceResponse<User | null>> {
    try {
      const user = await this.userRepository.findById(id);
      if (!user) {
        return ServiceResponse.notFound('User not found');
      }
      return ServiceResponse.success(user);
    } catch (error) {
      return ServiceResponse.error('Failed to fetch user');
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<User>> {
    try {
      const user = createUser(userData);
      const createdUser = await this.userRepository.create(user);
      return ServiceResponse.success(createdUser);
    } catch (error) {
      return ServiceResponse.error('Failed to create user');
    }
  }
}
```

### User Controller

The `userController.ts` file manages HTTP request/response:

```typescript
// src/api/user/userController.ts

import { Request, Response } from 'express';
import { UserService } from './userService';
import { ServiceResponse } from '../../common/models/serviceResponse';

export class UserController {
  constructor(private userService: UserService) {}

  async getAllUsers(req: Request, res: Response): Promise<void> {
    const response: ServiceResponse<User[]> = await this.userService.getAllUsers();
    res.status(response.statusCode).json(response);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const response: ServiceResponse<User | null> = await this.userService.getUserById(id);
    res.status(response.statusCode).json(response);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const userData = req.body;
    const response: ServiceResponse<User> = await this.userService.createUser(userData);
    res.status(response.statusCode).json(response);
  }
}
```

### User Router

The `userRouter.ts` file defines API routes:

```typescript
// src/api/user/userRouter.ts

import express from 'express';
import { UserController } from './userController';
import { UserService } from './userService';
import { UserRepository } from './userRepository';

const router = express.Router();
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.get('/', userController.getAllUsers.bind(userController));
router.get('/:id', userController.getUserById.bind(userController));
router.post('/', userController.createUser.bind(userController));

export default router;
```

### Health Check Router

The `healthCheckRouter.ts` file provides an example of a simple health check endpoint:

```typescript
// src/api/healthCheck/healthCheckRouter.ts

import express from 'express';
import { ServiceResponse } from '../../common/models/serviceResponse';

const router = express.Router();

router.get('/', (req, res) => {
  const response = ServiceResponse.success({ status: 'healthy' });
  res.status(response.statusCode).json(response);
});

export default router;
```

### Error Handling

The `errorHandler.ts` file provides global error handling:

```typescript
// src/common/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import { ServiceResponse } from '../models/serviceResponse';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error(err);
  const response = ServiceResponse.error('Internal Server Error');
  res.status(response.statusCode).json(response);
};
```

### Request Logging

The `requestLogger.ts` file provides middleware for request logging:

```typescript
// src/common/middleware/requestLogger.ts

import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  console.log(`${req.method} ${req.path}`);
  next();
};
```

### Service Response

The `serviceResponse.ts` file defines a consistent response structure:

```typescript
// src/common/models/serviceResponse.ts

export class ServiceResponse<T> {
  data: T | null;
  message: string;
  statusCode: number;
  success: boolean;

  private constructor(data: T | null, message: string, statusCode: number, success: boolean) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.success = success;
  }

  static success<T>(data: T): ServiceResponse<T> {
    return new ServiceResponse(data, 'Success', 200, true);
  }

  static error<T>(message: string, statusCode: number = 500): ServiceResponse<T> {
    return new ServiceResponse(null, message, statusCode, false);
  }

  static notFound<T>(message: string): ServiceResponse<T> {
    return new ServiceResponse(null, message, 404, false);
  }
}
```

## Conclusion

By following these standards and examples, you can ensure that your new features integrate seamlessly with the existing codebase. Consistency in structure, naming, and design patterns makes the codebase easier to maintain and extend.
