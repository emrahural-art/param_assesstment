"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { EditCandidateDialog } from "./edit-candidate-dialog";

const companyInfo: Record<string, { name: string; logo: string }> = {
  PARAM: { name: "Param", logo: "/logos/param.svg" },
  PARAMTECH: { name: "ParamTech", logo: "/logos/paramtech.svg" },
  FINROTA: { name: "Finrota", logo: "/logos/finrota.svg" },
  KREDIM: { name: "Kredim", logo: "/logos/kredim.svg" },
  UNIVERA: { name: "Univera", logo: "/logos/univera.svg" },
};

type CandidateHeaderProps = {
  candidate: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
    position: string | null;
    department: string | null;
    status: string;
  };
};

export function CandidateHeader({ candidate }: CandidateHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h2 className="text-2xl font-bold">
          {candidate.firstName} {candidate.lastName}
        </h2>
        <p className="text-muted-foreground">{candidate.email}</p>
        {candidate.phone && (
          <p className="text-sm text-muted-foreground">{candidate.phone}</p>
        )}
        {(candidate.position || candidate.department) && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {[candidate.position, candidate.department]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {candidate.company && companyInfo[candidate.company] && (
          <Badge variant="outline" className="flex items-center gap-1.5 px-2.5 py-1">
            <Image
              src={companyInfo[candidate.company].logo}
              alt={companyInfo[candidate.company].name}
              width={14}
              height={14}
              className="shrink-0"
            />
            {companyInfo[candidate.company].name}
          </Badge>
        )}
        <Badge variant={candidate.status === "ACTIVE" ? "default" : "secondary"}>
          {candidate.status === "ACTIVE" ? "Aktif" : candidate.status}
        </Badge>
        <EditCandidateDialog candidate={candidate} />
      </div>
    </div>
  );
}
