import Link from "next/link";
import { getPublishedListings } from "@/modules/listings/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function JobsPage() {
  let listings: Awaited<ReturnType<typeof getPublishedListings>> = [];
  try {
    listings = await getPublishedListings();
  } catch {
    // DB not available
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Açık Pozisyonlar</h1>
        <p className="mt-2 text-muted-foreground">
          Kariyer fırsatlarımızı inceleyin ve size uygun pozisyona başvurun.
        </p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Şu anda açık pozisyon bulunmamaktadır.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {listings.map((listing) => (
            <Card key={listing.id} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{listing.title}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(listing.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary">Açık</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {listing.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {listing.description}
                  </p>
                )}
                <Link href={`/apply/${listing.id}`}>
                  <Button>Başvur</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
