import { faker } from '@faker-js/faker';

export interface ProgramSeed {
  name: string;
  description: string;
}

/**
 * Builds a unique happy-path program payload for create/edit flows.
 * Faker ensures parallel-safe uniqueness; override fields when the AC needs fixed copy.
 */
export function buildProgram(overrides: Partial<ProgramSeed> = {}): ProgramSeed {
  const suffix = faker.string.alphanumeric(8);
  return {
    name: `QA Program ${suffix}`,
    description: faker.lorem.sentence(),
    ...overrides,
  };
}
