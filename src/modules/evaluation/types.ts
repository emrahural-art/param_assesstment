export type PersonalityAnswer = {
  questionText: string;
  value: number;
};

export type CandidateReportCard = {
  candidateId: string;
  fullName: string;
  email: string;
  applications: {
    listingTitle: string;
    stage: string;
    appliedAt: string;
  }[];
  assessmentResults: {
    assessmentTitle: string;
    score: number | null;
    totalPoints: number | null;
    completedAt: string | null;
    violations: unknown[];
    personalityAnswers: PersonalityAnswer[];
  }[];
  notes: {
    authorName: string;
    content: string;
    rating: number | null;
    createdAt: string;
  }[];
  averageRating: number | null;
};

export type ShortlistEntry = {
  candidateId: string;
  fullName: string;
  assessmentScore: number | null;
  assessmentTotal: number | null;
  averageRating: number | null;
  stage: string;
};
