"use client";

import { useState, useTransition } from "react";
import { updateLeadStatus } from "@/app/admin/actions";

const COLUMNS = [
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "SITE_SURVEY_PENDING",
  "SITE_SURVEY_SCHEDULED",
  "SITE_SURVEY_COMPLETED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "ON_HOLD",
] as const;

type Status = (typeof COLUMNS)[number];
type Card = { id: string; name: string; leadNumber: string; status: Status };

export function PipelineBoard({ leads }: { leads: Card[] }) {
  const [items, setItems] = useState(leads);
  const [, start] = useTransition();

  function onDrop(status: Status, leadId: string) {
    setItems((prev) => prev.map((l) => (l.id === leadId ? { ...l, status } : l)));
    start(async () => {
      await updateLeadStatus(leadId, status);
    });
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-6">
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="w-64 shrink-0 rounded-2xl bg-white p-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            const id = e.dataTransfer.getData("text/plain");
            if (id) onDrop(col, id);
          }}
        >
          <h2 className="text-xs font-semibold uppercase text-muted">{col.replaceAll("_", " ")}</h2>
          <div className="mt-3 space-y-2">
            {items.filter((l) => l.status === col).map((l) => (
              <article
                key={l.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/plain", l.id)}
                className="cursor-grab rounded-xl border bg-mist p-3 text-sm"
              >
                <p className="font-semibold">{l.name}</p>
                <p className="text-xs text-muted">{l.leadNumber}</p>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
