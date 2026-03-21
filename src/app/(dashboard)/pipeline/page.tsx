import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PipelineBoard } from "@/components/pipeline/pipeline-board";

export default function PipelinePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline</h2>
        <Link href="/candidates">
          <Button variant="outline" size="sm">
            Tablo Görünümü
          </Button>
        </Link>
      </div>
      <PipelineBoard />
    </div>
  );
}
