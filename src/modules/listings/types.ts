import { type ListingStatus } from "@/generated/prisma/client";

export type CreateListingInput = {
  title: string;
  description?: string;
  requirements?: string;
};

export type UpdateListingInput = Partial<CreateListingInput> & {
  status?: ListingStatus;
};

export type { ListingStatus };
