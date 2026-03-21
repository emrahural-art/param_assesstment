import Link from "next/link";
import { notFound } from "next/navigation";
import { getAssessmentById } from "@/modules/assessments/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AssessmentSettings } from "@/components/assessments/assessment-settings";
import { QuestionManager } from "@/components/assessments/question-manager";
import { AssessmentInvite } from "@/components/assessments/assessment-invite";

const difficultyLabels: Record<string, string> = {
  EASY: "Kolay",
  MEDIUM: "Orta",
  HARD: "Zor",
};

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let assessment: Awaited<ReturnType<typeof getAssessmentById>> = null;

  try {
    assessment = await getAssessmentById(id);
  } catch {
    // DB not available
  }

  if (!assessment) return notFound();

  const totalPoints = assessment.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="space-y-6">
      <Link
        href="/assessments"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        &larr; Testler
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assessment.title}</h2>
          {assessment.description && (
            <p className="text-muted-foreground mt-1">
              {assessment.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={assessment.isActive ? "default" : "secondary"}>
            {assessment.isActive ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{assessment.questions.length}</p>
            <p className="text-sm text-muted-foreground">Soru</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{totalPoints}</p>
            <p className="text-sm text-muted-foreground">Toplam Puan</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">{assessment.durationMinutes} dk</p>
            <p className="text-sm text-muted-foreground">Süre</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-2xl font-bold">
              {difficultyLabels[assessment.difficulty]}
            </p>
            <p className="text-sm text-muted-foreground">Zorluk</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="questions">
        <TabsList>
          <TabsTrigger value="questions">Sorular</TabsTrigger>
          <TabsTrigger value="invite">Davet Gönder</TabsTrigger>
          <TabsTrigger value="settings">Ayarlar</TabsTrigger>
        </TabsList>

        <TabsContent value="questions">
          <QuestionManager
            assessmentId={assessment.id}
            initialQuestions={assessment.questions.map((q) => ({
              id: q.id,
              text: q.text,
              type: q.type,
              options: q.options as string[] | null,
              correctAnswer: q.correctAnswer,
              points: q.points,
              order: q.order,
            }))}
          />
        </TabsContent>

        <TabsContent value="invite">
          <AssessmentInvite assessmentId={assessment.id} />
        </TabsContent>

        <TabsContent value="settings">
          <AssessmentSettings
            assessment={{
              id: assessment.id,
              title: assessment.title,
              description: assessment.description ?? "",
              durationMinutes: assessment.durationMinutes,
              difficulty: assessment.difficulty,
              isActive: assessment.isActive,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
