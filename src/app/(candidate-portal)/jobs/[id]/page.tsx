import Link from "next/link";
import { notFound } from "next/navigation";
import { getListingById } from "@/modules/listings/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let listing: Awaited<ReturnType<typeof getListingById>> = null;

  try {
    listing = await getListingById(id);
  } catch {
    // DB not available
  }

  if (!listing) return notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link
        href="/jobs"
        className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Tüm Pozisyonlar
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-2xl">{listing.title}</CardTitle>
            <Badge variant="secondary">
              {listing.status === "PUBLISHED" ? "Açık" : listing.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Yayın tarihi:{" "}
            {new Date(listing.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {listing.description && (
            <div>
              <h3 className="mb-2 font-semibold">Pozisyon Açıklaması</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          )}

          {listing.requirements && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 font-semibold">Aranan Nitelikler</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {listing.requirements}
                </p>
              </div>
            </>
          )}

          <Separator />

          <Link href={`/apply/${listing.id}`}>
            <Button size="lg" className="w-full">
              Bu Pozisyona Başvur
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
