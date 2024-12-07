export class DuplicateUserError extends Error {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`User with email ${email} not found`);
  }
}
