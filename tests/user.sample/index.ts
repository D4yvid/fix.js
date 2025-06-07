export class UserCreationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export type User = { name: string };

const USERS: User[] = [];

/**
 * Create a new user
 *
 * @param name The new user name
 * @throws {UserCreationError} If the user is already created
 * @returns {number}
 */
export async function createUser(name: string) {
  if (USERS.find((user) => user.name == name)) {
    throw new UserCreationError("User already created");
  }

  return USERS.push({ name });
}
