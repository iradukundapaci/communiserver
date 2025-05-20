"use client";

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { useLoadUser } from "@/hooks/use-load-user";

import data from "./data.json";

export default function Page() {
  // Load the user data when the dashboard page mounts
  useLoadUser();
  return (
    <>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </>
  );
}
