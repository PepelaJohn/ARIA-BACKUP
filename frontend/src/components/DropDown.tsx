import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import React from "react";
type Solution = {
  icon: string;
  title: string;
  description: string;
};

const solutions: Solution[] = [
  {
    icon: "🚐",
    title: "Microtransit",
    description:
      "Enhance your transit network with highly configurable and flexible shared mobility.",
  },
  {
    icon: "🌆",
    title: "Citymapper for Cities",
    description:
      "Build stronger transit networks with an award-winning MaaS app and comprehensive passenger insights.",
  },
  {
    icon: "🦽",
    title: "Paratransit",
    description:
      "Provide cost effective, compliant services that exceed rider expectations.",
  },
  {
    icon: "🏢",
    title: "Corporate & Campus Shuttles",
    description:
      "Streamline your employees’ commutes and improve intra-campus mobility.",
  },
  {
    icon: "🎓",
    title: "Student Transit",
    description:
      "Reduce costs and deliver peace of mind with software and turnkey operations that streamline student transit.",
  },
  {
    icon: "❤️",
    title: "Health Transportation",
    description:
      "Help patients access quality care — without worrying about traveling to appointments.",
  },
  {
    icon: "📅",
    title: "Planning, Scheduling, & Consulting",
    description: "The single tool for your continuous planning needs.",
  },
];
export function HoverCardDemo({ children }: { children: React.ReactNode }) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{children}</HoverCardTrigger>
      <HoverCardContent className="w-full !border-none !bg-transparent">
        <div className="bg-black text-white  flex flex-col items-center py-12 px-6">
          <div className="max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutions.map((solution, index) => (
              <div
                key={index}
                className="flex hover:bg-gray-800 p-3 rounded-sm cursor-pointer items-start space-x-4"
              >
                <span className="text-2xl">{solution.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold">{solution.title}</h3>
                  <p className="text-gray-400">{solution.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <a href="#" className="text-indigo-400 hover:text-indigo-300">
              All Solutions
            </a>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
