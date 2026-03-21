import { db } from "@/lib/prisma";

export async function getListings() {
  return db.listing.findMany({
    include: { _count: { select: { applications: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getListingById(id: string) {
  return db.listing.findUnique({
    where: { id },
    include: {
      applications: {
        include: { candidate: true },
        orderBy: { appliedAt: "desc" },
      },
    },
  });
}

export async function getPublishedListings() {
  return db.listing.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
  });
}
