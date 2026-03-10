"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Globe, Instagram, Linkedin, Mail, Phone, type LucideIcon } from "lucide-react";
import type { TeamContact, TeamMember } from "@/lib/parseTeam";

type TeamCardProps = {
  member: TeamMember;
};

const DEFAULT_TEAM_IMAGE = "/team/images/person.png";

const CONTACT_CONFIG: Record<TeamContact["type"], { label: string; icon: LucideIcon; toHref: (value: string) => string }> = {
  linkedin: { label: "LinkedIn", icon: Linkedin, toHref: (value) => value },
  phone: { label: "Phone", icon: Phone, toHref: (value) => `tel:${value.replace(/\s+/g, "")}` },
  portfolio: { label: "Portfolio", icon: Globe, toHref: (value) => value },
  instagram: { label: "Instagram", icon: Instagram, toHref: (value) => value },
  email: { label: "Email", icon: Mail, toHref: (value) => `mailto:${value}` },
};

const TeamCard = ({ member }: TeamCardProps) => {
  const imageCandidates = useMemo(() => {
    if (!member.hasImage) return [DEFAULT_TEAM_IMAGE];
    const basePath = `/team/images/${member.id}`;
    return [`${basePath}.png`, `${basePath}.jpg`, `${basePath}.jpeg`, `${basePath}.webp`, `${basePath}.avif`, `${basePath}.svg`, member.imagePath, DEFAULT_TEAM_IMAGE];
  }, [member.hasImage, member.id, member.imagePath]);

  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => setCandidateIndex(0), [imageCandidates]);

  const imageSrc = imageCandidates[candidateIndex] || DEFAULT_TEAM_IMAGE;

  return (
    <article className="interactive-card team-card premium-card rounded-[16px] w-full max-w-[26rem] mx-auto p-6 text-left flex flex-col group">
      <div className="team-photo-ring mx-auto sm:mx-0 relative h-28 w-28 rounded-full border border-primary/45 p-1.5">
        <div className="relative h-full w-full rounded-full overflow-hidden bg-slate-900/70">
          <Image
            src={imageSrc}
            alt={`${member.name} profile`}
            fill
            sizes="112px"
            className="object-cover object-top"
            loading="lazy"
            onError={() => setCandidateIndex((index) => Math.min(index + 1, imageCandidates.length - 1))}
          />
        </div>
      </div>

      <div className="mt-5 text-center sm:text-left">
        <h3 className="team-name text-2xl font-bold text-foreground transition-colors duration-300">{member.name}</h3>
        <p className="team-role-tag inline-flex items-center rounded-full border border-primary/25 px-2.5 py-0.5 text-primary text-xs font-mono tracking-wider mt-1 uppercase transition-colors duration-300">{member.role}</p>
        <div className="mt-3 h-px w-full bg-gradient-to-r from-primary/70 to-transparent" />
        <p className="text-muted-foreground text-sm leading-relaxed mt-4">{member.bio}</p>

        {(member.contacts?.length ?? 0) > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {(member.contacts ?? []).map((contact) => {
              const config = CONTACT_CONFIG[contact.type];
              const Icon = config.icon;
              return (
                <a
                  key={`${member.id}-${contact.type}-${contact.value}`}
                  href={config.toHref(contact.value)}
                  target={contact.type === "phone" || contact.type === "email" ? undefined : "_blank"}
                  rel={contact.type === "phone" || contact.type === "email" ? undefined : "noopener noreferrer"}
                  aria-label={`${member.name} ${config.label}`}
                  className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-primary/35 bg-primary/10 px-3 py-1.5 text-xs text-primary hover:bg-primary/20 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{config.label}</span>
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </article>
  );
};

export default TeamCard;
