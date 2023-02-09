import { faker } from "@faker-js/faker";
import { prisma } from "../../src/config/database";

export async function createGame() {
  return prisma.gam;
}
