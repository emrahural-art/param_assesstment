"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { features } from "@/lib/features-env";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
};

type EducationEntry = {
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
};

type ExperienceEntry = {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  description: string;
};

export default function ApplyPage() {
  const params = useParams();
  const jobId = params.jobId as string;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [listing, setListing] = useState<Listing | null>(null);

  const [education, setEducation] = useState<EducationEntry[]>([
    { school: "", degree: "", field: "", graduationYear: "" },
  ]);
  const [experience, setExperience] = useState<ExperienceEntry[]>([
    { company: "", title: "", startDate: "", endDate: "", description: "" },
  ]);

  useEffect(() => {
    fetch(`/api/listings/${jobId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setListing(data))
      .catch(() => {});
  }, [jobId]);

  function addEducation() {
    setEducation((prev) => [
      ...prev,
      { school: "", degree: "", field: "", graduationYear: "" },
    ]);
  }

  function removeEducation(index: number) {
    setEducation((prev) => prev.filter((_, i) => i !== index));
  }

  function updateEducation(
    index: number,
    field: keyof EducationEntry,
    value: string
  ) {
    setEducation((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function addExperience() {
    setExperience((prev) => [
      ...prev,
      { company: "", title: "", startDate: "", endDate: "", description: "" },
    ]);
  }

  function removeExperience(index: number) {
    setExperience((prev) => prev.filter((_, i) => i !== index));
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceEntry,
    value: string
  ) {
    setExperience((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const cvData = {
      education: education.filter((ed) => ed.school.trim() !== ""),
      experience: experience.filter((ex) => ex.company.trim() !== ""),
      skills: (formData.get("skills") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      coverLetter: formData.get("coverLetter") as string,
    };

    try {
      const company = formData.get("company") as string;
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.get("firstName"),
          lastName: formData.get("lastName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          company: company || undefined,
          listingId: jobId,
          cvData,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Başvuru gönderilemedi");
      }

      const resumeFile = formData.get("resume") as File;
      if (resumeFile && resumeFile.size > 0) {
        const data = await res.json();
        const uploadForm = new FormData();
        uploadForm.append("file", resumeFile);
        uploadForm.append("candidateId", data.candidateId);
        await fetch("/api/upload/resume", {
          method: "POST",
          body: uploadForm,
        });
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Başvuru sırasında bir hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">
              Başvurunuz Alındı
            </CardTitle>
            <CardDescription>
              Başvurunuz başarıyla iletildi. En kısa sürede sizinle iletişime
              geçeceğiz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {features.candidateJobs && (
              <Link href="/jobs">
                <Button variant="outline">Diğer Pozisyonları İncele</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      {features.candidateJobs ? (
        <Link
          href="/jobs"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; Açık Pozisyonlar
        </Link>
      ) : null}

      {listing && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <Badge variant="secondary" className="mt-2">
            Başvuru Formu
          </Badge>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Kişisel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kişisel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Ad *</Label>
                <Input id="firstName" name="firstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Soyad *</Label>
                <Input id="lastName" name="lastName" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                pattern="(\+90\s?)?0?5\d{2}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}"
                title="Geçerli bir telefon numarası giriniz (örn: 05XX XXX XX XX)"
                placeholder="05XX XXX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Grup Şirketi</Label>
              <select
                id="company"
                name="company"
                className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                defaultValue=""
              >
                <option value="">Seçiniz (opsiyonel)</option>
                <option value="PARAM">Param</option>
                <option value="PARAMTECH">ParamTech</option>
                <option value="FINROTA">Finrota</option>
                <option value="KREDIM">Kredim</option>
                <option value="UNIVERA">Univera</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Param grup şirketlerinde çalışıyorsanız veya başvuruyorsanız belirtiniz.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Eğitim Bilgileri */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Eğitim Bilgileri</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                + Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {education.map((edu, index) => (
              <div key={index} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Eğitim {index + 1}
                  </span>
                  {education.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-destructive h-auto p-1"
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Okul</Label>
                    <Input
                      value={edu.school}
                      onChange={(e) =>
                        updateEducation(index, "school", e.target.value)
                      }
                      placeholder="Üniversite adı"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Derece</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        updateEducation(index, "degree", e.target.value)
                      }
                      placeholder="Lisans, Yüksek Lisans..."
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bölüm</Label>
                    <Input
                      value={edu.field}
                      onChange={(e) =>
                        updateEducation(index, "field", e.target.value)
                      }
                      placeholder="Bilgisayar Mühendisliği"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mezuniyet Yılı</Label>
                    <Input
                      value={edu.graduationYear}
                      onChange={(e) =>
                        updateEducation(index, "graduationYear", e.target.value)
                      }
                      type="number"
                      placeholder="2024"
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* İş Deneyimi */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">İş Deneyimi</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                + Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.map((exp, index) => (
              <div key={index} className="space-y-3">
                {index > 0 && <Separator />}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Deneyim {index + 1}
                  </span>
                  {experience.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                      className="text-destructive h-auto p-1"
                    >
                      Kaldır
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Şirket</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(index, "company", e.target.value)
                      }
                      placeholder="Şirket adı"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Pozisyon</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) =>
                        updateExperience(index, "title", e.target.value)
                      }
                      placeholder="Frontend Developer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Başlangıç</Label>
                    <Input
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(index, "startDate", e.target.value)
                      }
                      type="month"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Bitiş</Label>
                    <Input
                      value={exp.endDate}
                      onChange={(e) =>
                        updateExperience(index, "endDate", e.target.value)
                      }
                      type="month"
                      placeholder="Devam ediyorsa boş bırakın"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Açıklama</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      updateExperience(index, "description", e.target.value)
                    }
                    rows={2}
                    placeholder="Görev ve sorumluluklar..."
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Yetenekler & CV */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ek Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skills">Yetenekler</Label>
              <Input
                id="skills"
                name="skills"
                placeholder="React, TypeScript, Node.js (virgülle ayırın)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resume">CV (PDF)</Label>
              <Input id="resume" name="resume" type="file" accept=".pdf" />
              <p className="text-xs text-muted-foreground">
                Maksimum 5 MB, sadece PDF formatı
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Ön Yazı</Label>
              <Textarea
                id="coverLetter"
                name="coverLetter"
                rows={4}
                placeholder="Kendinizi kısaca tanıtın..."
              />
            </div>
          </CardContent>
        </Card>

        {/* KVKK + Gönder */}
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="consent"
                name="consent"
                required
                className="mt-1"
              />
              <Label htmlFor="consent" className="text-sm leading-relaxed">
                Kişisel verilerimin, başvuru sürecinin yürütülmesi amacıyla 6698
                sayılı KVKK kapsamında işlenmesini kabul ediyorum. *
              </Label>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
