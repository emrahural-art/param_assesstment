import { NextResponse } from "next/server";
import { getListings } from "@/modules/listings/queries";
import { createListing } from "@/modules/listings/service";
import { createListingSchema } from "@/modules/listings/schema";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json(listings);
  } catch (err) {
    logger.error("Failed to load listings", "api.listings.GET", { error: String(err) });
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createListingSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const listing = await createListing(parsed.data);
    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    logger.error("Failed to create listing", "api.listings.POST", { error: String(err) });
    return NextResponse.json(
      { error: "İlan oluşturulamadı" },
      { status: 400 }
    );
  }
}
