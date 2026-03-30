import Link from "next/link";
import { getListings } from "@/modules/listings/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { logger } from "@/lib/logger";

const statusLabels: Record<string, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  CLOSED: "Kapalı",
};

const statusVariants: Record<string, "default" | "secondary" | "destructive"> = {
  DRAFT: "secondary",
  PUBLISHED: "default",
  CLOSED: "destructive",
};

export default async function ListingsPage() {
  let listings: Awaited<ReturnType<typeof getListings>> = [];
  try {
    listings = await getListings();
  } catch (err) {
    logger.error("Failed to load listings", "listings.page", { error: String(err) });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">İlanlar</h2>
        <Link href="/listings/new">
          <Button>Yeni İlan Oluştur</Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Başlık</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Başvuru Sayısı</TableHead>
              <TableHead>Oluşturulma</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listings.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center text-muted-foreground py-8"
                >
                  Henüz ilan oluşturulmamış
                </TableCell>
              </TableRow>
            ) : (
              listings.map((listing) => (
                <TableRow key={listing.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="hover:underline"
                    >
                      {listing.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariants[listing.status]}>
                      {statusLabels[listing.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{listing._count.applications}</TableCell>
                  <TableCell>
                    {new Date(listing.createdAt).toLocaleDateString("tr-TR")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
