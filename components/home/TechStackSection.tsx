"use client";

import Image from "next/image";
import { SectionHeader } from "../ui/section-header";

type Tool = { name: string; icon: string };
type Group = { label: string; tools: Tool[] };

const toolkit: Group[] = [
  {
    label: "Languages",
    tools: [
      { name: "TypeScript", icon: "/typescript.svg" },
      { name: "JavaScript", icon: "/javascript.svg" },
      { name: "Go", icon: "/go.svg" },
      { name: "Python", icon: "/python.svg" },
    ],
  },
  {
    label: "Frameworks",
    tools: [
      { name: "React", icon: "/react.svg" },
      { name: "Next.js", icon: "/nextdotjs.svg" },
      { name: "Node.js", icon: "/nodedotjs.svg" },
      { name: "Hono", icon: "/hono.svg" },
      { name: "Gin", icon: "/gin.svg" },
      { name: "FastAPI", icon: "/FastAPI.svg" },
      { name: "Tailwind CSS", icon: "/tailwindcss.svg" },
    ],
  },
  {
    label: "State & Forms",
    tools: [
      { name: "Redux", icon: "/redux.svg" },
      { name: "Zustand", icon: "/zustand.svg" },
      { name: "React Query", icon: "/reactquery.svg" },
      { name: "React Hook Form", icon: "/reacthookform.svg" },
    ],
  },
  {
    label: "AI & ML",
    tools: [{ name: "PyTorch", icon: "/pytorch.svg" }],
  },
  {
    label: "Data & Infrastructure",
    tools: [
      { name: "PostgreSQL", icon: "/postgresql.svg" },
      { name: "Drizzle", icon: "/drizzle.svg" },
      { name: "Docker", icon: "/docker.svg" },
      { name: "Linux", icon: "/linux.svg" },
      { name: "Git", icon: "/git.svg" },
    ],
  },
];

const allTools = toolkit.flatMap((g) => g.tools);
const half = Math.ceil(allTools.length / 2);
const rows = [allTools.slice(0, half), allTools.slice(half)];

export const TechStackSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <SectionHeader title="Toolkit" />
      </div>

      <div className="space-y-4 fade-x pause-on-hover">
        {rows.map((row, r) => (
          <div key={r} className="flex overflow-hidden">
            <ul
              className={`flex shrink-0 gap-4 pr-4 w-max ${r === 0 ? "animate-marquee" : "animate-marquee-reverse"}`}
              style={{ "--marquee-dur": `${row.length * 5}s` } as React.CSSProperties}
            >
              {/* Duplicated once so the loop is seamless */}
              {[...row, ...row].map((tool, i) => (
                <li
                  key={`${tool.name}-${i}`}
                  aria-hidden={i >= row.length}
                  className="glass rounded-2xl flex items-center gap-3 px-5 py-3.5"
                >
                  <span className="flex items-center justify-center size-8 rounded-xl bg-white/70 dark:bg-white/90">
                    <Image src={tool.icon} alt="" width={20} height={20} className="size-5 object-contain" />
                  </span>
                  <span className="font-semibold whitespace-nowrap">{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
};
