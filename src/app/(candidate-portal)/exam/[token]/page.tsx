"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Question = {
  id: string;
  text: string;
  type: string;
  options: string[] | null;
  order: number;
  imageUrl: string | null;
};

type Violation = {
  type: "tab_switch" | "fullscreen_exit" | "copy_attempt";
  timestamp: string;
};

type ExamInfo = {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    durationMinutes: number;
    questionCount: number;
  };
  candidate: { firstName: string; lastName: string };
  status: string;
  startedAt: string | null;
};

const MAX_VIOLATIONS = 3;

export default function TokenExamPage() {
  const params = useParams();
  const token = params.token as string;

  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [violations, setViolations] = useState<Violation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{
    score: number;
    totalPoints: number;
    level: string | null;
  } | null>(null);
  const violationCountRef = useRef(0);

  useEffect(() => {
    async function loadExamInfo() {
      try {
        const res = await fetch(`/api/exam/${token}`);
        if (res.ok) {
          const data: ExamInfo = await res.json();
          setExamInfo(data);
          if (data.status === "COMPLETED") {
            setExamFinished(true);
          }
        } else {
          const err = await res.json();
          setError(err.error ?? "Sınav yüklenemedi");
        }
      } catch {
        setError("Bağlantı hatası");
      }
      setLoading(false);
    }
    loadExamInfo();
  }, [token]);

  const submitExam = useCallback(async () => {
    if (examFinished) return;
    setExamFinished(true);

    const answerList = Object.entries(answers).map(([questionId, answer]) => ({
      questionId,
      answer,
    }));

    try {
      const res = await fetch(`/api/exam/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerList, violations }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      console.error("[ExamPage]", err);
    }
  }, [answers, violations, token, examFinished]);

  useEffect(() => {
    if (!examStarted || examFinished) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          submitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [examStarted, examFinished, submitExam]);

  useEffect(() => {
    if (!examStarted || examFinished) return;

    function addViolation(type: Violation["type"]) {
      const v: Violation = { type, timestamp: new Date().toISOString() };
      setViolations((prev) => [...prev, v]);
      violationCountRef.current += 1;
      if (violationCountRef.current >= MAX_VIOLATIONS) {
        submitExam();
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) addViolation("tab_switch");
    }

    function handleFullscreenChange() {
      if (!document.fullscreenElement && examStarted) {
        addViolation("fullscreen_exit");
      }
    }

    function handleCopy(e: Event) {
      e.preventDefault();
      addViolation("copy_attempt");
    }

    function handleContextMenu(e: Event) {
      e.preventDefault();
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "a")
      ) {
        e.preventDefault();
        if (e.key === "c" || e.key === "x") addViolation("copy_attempt");
      }
      if (e.key === "F12" || (e.ctrlKey && e.shiftKey && e.key === "I")) {
        e.preventDefault();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [examStarted, examFinished, submitExam]);

  async function startExam() {
    try {
      const res = await fetch(`/api/exam/${token}/start`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setTimeLeft(data.durationMinutes * 60);
        setExamStarted(true);
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        const err = await res.json();
        setError(err.error ?? "Sınav başlatılamadı");
      }
    } catch {
      setError("Bağlantı hatası");
    }
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Sınav yükleniyor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sınav Erişilemedi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (examFinished) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sınav Tamamlandı</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result ? (
              <>
                {result.totalPoints > 0 && (
                  <p className="text-4xl font-bold">
                    {result.score}/{result.totalPoints}
                  </p>
                )}
                {result.level && (
                  <Badge className="text-base px-4 py-1">{result.level}</Badge>
                )}
                <p className="text-muted-foreground">
                  Cevaplarınız başarıyla kaydedildi.
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">
                Cevaplarınız kaydedildi. Sonuçlar değerlendirildikten sonra
                sizinle iletişime geçilecektir.
              </p>
            )}
            {violations.length > 0 && (
              <p className="text-sm text-destructive">
                {violations.length} ihlal kaydedildi.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examStarted && examInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{examInfo.assessment.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Merhaba{" "}
              <strong>
                {examInfo.candidate.firstName} {examInfo.candidate.lastName}
              </strong>
              ,
            </p>
            {examInfo.assessment.description && (
              <p className="text-sm text-muted-foreground">
                {examInfo.assessment.description}
              </p>
            )}
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Toplam {examInfo.assessment.questionCount} soru</p>
              <p>Süre: {examInfo.assessment.durationMinutes} dakika</p>
              <p className="font-medium text-foreground mt-3">Kurallar:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Sınav tam ekran modunda çözülecektir</li>
                <li>Sekme değiştirmek ihlal olarak kaydedilir</li>
                <li>Tam ekrandan çıkmak ihlal olarak kaydedilir</li>
                <li>{MAX_VIOLATIONS} ihlalde sınav otomatik sonlandırılır</li>
                <li>Metin kopyalama/yapıştırma engellenmiştir</li>
                <li>Süre dolduğunda sınav otomatik gönderilir</li>
              </ul>
            </div>
            <Button onClick={startExam} className="w-full" size="lg">
              Sınavı Başlat
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-muted/30 p-4 select-none"
      onSelectCapture={(e) => e.preventDefault()}
    >
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-background p-4 shadow">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Soru {currentIndex + 1} / {questions.length}
            </span>
            <span className="text-xs text-muted-foreground">
              {answeredCount}/{questions.length} cevaplandı
            </span>
          </div>
          <Badge
            variant={timeLeft < 60 ? "destructive" : "secondary"}
            className="text-lg px-4 py-1 font-mono"
          >
            {String(minutes).padStart(2, "0")}:
            {String(seconds).padStart(2, "0")}
          </Badge>
          {violations.length > 0 && (
            <Badge variant="destructive">
              {violations.length}/{MAX_VIOLATIONS} ihlal
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 rounded-lg bg-background p-3 shadow">
          {questions.map((q, i) => {
            const isAnswered = answers[q.id] !== undefined;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`flex h-8 w-8 items-center justify-center rounded text-xs font-medium transition-colors ${
                  i === currentIndex
                    ? "bg-primary text-primary-foreground"
                    : isAnswered
                      ? "bg-green-100 text-green-800"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {currentQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg whitespace-pre-line leading-relaxed">
                {currentQuestion.text}
              </CardTitle>
              {currentQuestion.imageUrl && (
                <div className="mt-3">
                  <img
                    src={currentQuestion.imageUrl}
                    alt="Soru görseli"
                    className="max-w-full h-auto rounded-lg border bg-white p-2"
                    draggable={false}
                  />
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {currentQuestion.options?.map((option, i) => (
                  <label
                    key={i}
                    className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                      answers[currentQuestion.id] === option
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={() =>
                        setAnswers((prev) => ({
                          ...prev,
                          [currentQuestion.id]: option,
                        }))
                      }
                      className="accent-primary"
                    />
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border bg-muted text-xs font-medium">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {option}
                    </span>
                  </label>
                ))}
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
          >
            Önceki
          </Button>

          <div className="flex gap-2">
            {currentIndex === questions.length - 1 ? (
              <Button
                onClick={() => {
                  if (
                    confirm(
                      `${answeredCount}/${questions.length} soruyu cevapladınız. Sınavı tamamlamak istiyor musunuz?`,
                    )
                  ) {
                    submitExam();
                  }
                }}
              >
                Sınavı Tamamla
              </Button>
            ) : (
              <Button onClick={() => setCurrentIndex((prev) => prev + 1)}>
                Sonraki
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
