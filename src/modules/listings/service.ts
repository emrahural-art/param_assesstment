import { db } from "@/lib/prisma";
import { type CreateListingInput, type UpdateListingInput } from "./types";

export async function createListing(input: CreateListingInput) {
  return db.listing.create({ data: input });
}

export async function updateListing(id: string, input: UpdateListingInput) {
  return db.listing.update({ where: { id }, data: input });
}

export async function deleteListing(id: string) {
  return db.listing.delete({ where: { id } });
}
