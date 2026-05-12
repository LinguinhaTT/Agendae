import { ChevronLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AvailabilityManager } from "@/components/admin/availability-manager";
import { getAdminContext } from "@/lib/data/admin";
import { getMemberWithAvailability } from "@/lib/data/team";

interface Props {
  params: Promise<{ memberId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { memberId } = await params;
  const { establishment } = await getAdminContext();
  const data = await getMemberWithAvailability(memberId, establishment.id);
  return { title: data ? `${data.member.display_name} — Disponibilidade` : "Disponibilidade" };
}

export default async function MemberAvailabilityPage({ params }: Props) {
  const { memberId } = await params;
  const { establishment } = await getAdminContext();
  const data = await getMemberWithAvailability(memberId, establishment.id);

  if (!data) notFound();

  const { member, rules, timeOffs } = data;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      {/* Back link */}
      <Link
        href="/admin/equipe"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Equipe
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-lg font-bold text-primary">
            {member.display_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-black">{member.display_name}</h1>
          <p className="text-sm text-muted-foreground">Disponibilidade e folgas</p>
        </div>
      </div>

      <AvailabilityManager
        memberId={memberId}
        memberName={member.display_name}
        initialRules={rules}
        initialTimeOffs={timeOffs}
      />
    </div>
  );
}
