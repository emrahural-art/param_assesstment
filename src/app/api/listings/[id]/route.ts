import { NextResponse } from "next/server";
import { getListingById } from "@/modules/listings/queries";
import { updateListing, deleteListing } from "@/modules/listings/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const listing = await getListingById(id);
    if (!listing) {
      return NextResponse.json({ error: "İlan bulunamadı" }, { status: 404 });
    }
    return NextResponse.json(listing);
  } catch {
    return NextResponse.json(
      { error: "Veritabanı bağlantısı kurulamadı" },
      { status: 503 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    const updated = await updateListing(id, body);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "İlan güncellenemedi" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await deleteListing(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "İlan silinemedi" }, { status: 400 });
  }
}
