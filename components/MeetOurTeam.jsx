import CcmIcon, { CcmPageIntro } from "@/components/CcmIcon";

const TEAM_MEMBERS = [
  {
    id: "saurabh",
    name: "Saurabh Porwal",
    role: "Founder & Senior Insurance & Claim Consultant",
    phone: "9630901676",
    email: "claimantmitra@gmail.com",
    initials: "SP",
    avatarGradient: "from-indigo-600 via-violet-600 to-indigo-800",
  },
  {
    id: "poonam",
    name: "Poonam Chouhan",
    role: "Senior Claims Operation Manager",
    phone: "9098645524",
    email: "claimantmitra@gmail.com",
    initials: "PC",
    avatarGradient: "from-emerald-600 via-teal-600 to-emerald-800",
  },
  {
    id: "sarthak",
    name: "Sarthak Tiwari",
    role: "Customer Relation Manager",
    phone: "9630952765",
    email: "claimantmitra@gmail.com",
    initials: "ST",
    avatarGradient: "from-amber-500 via-orange-500 to-amber-700",
  },
  {
    id: "uma",
    name: "Uma Gardharav",
    role: "Operation & Legal Drafter",
    phone: "9098645524",
    email: "claimantmitra@gmail.com",
    initials: "UG",
    avatarGradient: "from-rose-500 via-pink-600 to-rose-700",
  },
  {
    id: "rohit",
    name: "Rohit Bhatia",
    role: "Partners Coordinator Manager",
    phone: "9630952765",
    initials: "RB",
    avatarGradient: "from-cyan-600 via-sky-600 to-cyan-800",
  },
  {
    id: "diksha",
    name: "Diksha Joshi",
    role: "Insurance Operation",
    phone: "9098645524",
    email: "claimantmitra@gmail.com",
    initials: "DJ",
    avatarGradient: "from-fuchsia-600 via-purple-600 to-fuchsia-800",
  },
];

function TeamMemberCard({ member }) {
  const telHref = `tel:+91${member.phone}`;

  return (
    <article className="ui-card-padded overflow-hidden !p-0">
      <div
        className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${member.avatarGradient}`}
      >
        <span
          className="absolute right-4 top-4 h-12 w-12 rounded-full bg-white/10"
          aria-hidden
        />
        <span
          className="absolute bottom-3 left-4 h-8 w-8 rounded-full bg-white/10"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20"
          aria-hidden
        >
          <CcmIcon name="user" size={72} className="text-white" />
        </span>
        <span className="relative text-3xl font-bold tracking-wide text-white drop-shadow-sm">
          {member.initials}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">{member.name}</h3>
          <p className="mt-1 text-sm leading-snug text-slate-600">{member.role}</p>
        </div>

        <div className="space-y-2 border-t border-slate-100 pt-3">
          <a
            href={telHref}
            className="flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900"
          >
            <CcmIcon name="phone" size={16} className="text-indigo-600" />
            <span>{member.phone}</span>
          </a>
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900 break-all"
            >
              <CcmIcon name="mail" size={16} className="shrink-0 text-indigo-600" />
              <span>{member.email}</span>
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export default function MeetOurTeam() {
  return (
    <div className="space-y-5">
      <CcmPageIntro icon="users" eyebrow="Team">
        People behind Claimant Mitra — reach out for help with your claim or policy.
      </CcmPageIntro>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {TEAM_MEMBERS.map((member) => (
          <TeamMemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
