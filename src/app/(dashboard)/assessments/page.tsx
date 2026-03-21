import Link from "next/link";
import { getAssessments } from "@/modules/assessments/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const difficultyLabels: Record<string, string> = {
  EASY: "Kolay",
  MEDIUM: "Orta",
  HARD: "Zor",
};

const difficultyColors: Record<string, "default" | "secondary" | "destructive"> = {
  EASY: "secondary",
  MEDIUM: "default",
  HARD: "destructive",
};

export default async function AssessmentsPage() {
  let assessments: Awaited<ReturnType<typeof getAssessments>> = [];
  try {
    assessments = await getAssessments();
  } catch {
    // DB not available
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Testler</h2>
        <Link href="/assessments/new">
          <Button>Yeni Test Oluştur</Button>
        </Link>
      </div>

      {assessments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Henüz test oluşturulmamış
            </p>
            <Link href="/assessments/new">
              <Button variant="outline">İlk Testi Oluştur</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assessments.map(
            (assessment: {
              id: string;
              title: string;
              description: string | null;
              difficulty: string;
              durationMinutes: number;
              isActive: boolean;
              questions: unknown[];
            }) => (
              <Link
                key={assessment.id}
                href={`/assessments/${assessment.id}`}
                className="block"
              >
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-1">
                        {assessment.title}
                      </CardTitle>
                      <Badge variant={difficultyColors[assessment.difficulty]}>
                        {difficultyLabels[assessment.difficulty]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {assessment.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {assessment.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{assessment.questions.length} soru</span>
                      <span>{assessment.durationMinutes} dk</span>
                    </div>
                    <Badge
                      variant={assessment.isActive ? "default" : "secondary"}
                    >
                      {assessment.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
