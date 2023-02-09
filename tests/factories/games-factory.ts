import { faker } from "@faker-js/faker";
import prisma from "../../src/config/database";

export async function createGame(consoleId: number) {
  return prisma.game.create({
    data: {
      title: faker.commerce.productName(),
      consoleId,
    }
  });
}
