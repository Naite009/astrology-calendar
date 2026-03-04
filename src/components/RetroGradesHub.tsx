import { useState } from "react";
import type { NatalChart } from "@/hooks/useNatalChart";
import { MercuryRetrogradeGuide } from "./MercuryRetrogradeGuide";
import { PlanetRetrogradeGuide } from "./PlanetRetrogradeGuide";

interface RetroGradesHubProps {
  allCharts: NatalChart[];
  primaryUserName?: string;
}

const PLANETS = [
  { id: "mercury", name: "Mercury", glyph: "☿", color: "from-amber-500/20 to-amber-600/20", border: "border-amber-500/50", active: "bg-amber-500 text-white" },
  { id: "venus", name: "Venus", glyph: "♀", color: "from-pink-500/20 to-pink-600/20", border: "border-pink-500/50", active: "bg-pink-500 text-white" },
  { id: "mars", name: "Mars", glyph: "♂", color: "from-red-500/20 to-red-600/20", border: "border-red-500/50", active: "bg-red-500 text-white" },
  { id: "jupiter", name: "Jupiter", glyph: "♃", color: "from-purple-500/20 to-purple-600/20", border: "border-purple-500/50", active: "bg-purple-500 text-white" },
  { id: "saturn", name: "Saturn", glyph: "♄", color: "from-stone-500/20 to-stone-600/20", border: "border-stone-500/50", active: "bg-stone-500 text-white" },
  { id: "uranus", name: "Uranus", glyph: "♅", color: "from-cyan-500/20 to-cyan-600/20", border: "border-cyan-500/50", active: "bg-cyan-600 text-white" },
  { id: "neptune", name: "Neptune", glyph: "♆", color: "from-blue-500/20 to-blue-600/20", border: "border-blue-500/50", active: "bg-blue-500 text-white" },
  { id: "pluto", name: "Pluto", glyph: "♇", color: "from-zinc-500/20 to-zinc-600/20", border: "border-zinc-500/50", active: "bg-zinc-600 text-white" },
];

export function RetroGradesHub({ allCharts, primaryUserName }: RetroGradesHubProps) {
  const [selectedPlanet, setSelectedPlanet] = useState("mercury");

  return (
    <div className="space-y-4">
      {/* Planet selector buttons */}
      <div className="flex flex-wrap gap-2 justify-center px-2 py-3 bg-background/50 backdrop-blur-sm rounded-xl border border-border/50">
        {PLANETS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedPlanet(p.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedPlanet === p.id
                ? p.active + " shadow-md"
                : `bg-gradient-to-r ${p.color} ${p.border} border text-foreground/70 hover:text-foreground hover:shadow-sm`
            }`}
          >
            <span className="text-base">{p.glyph}</span>
            <span className="hidden sm:inline">{p.name}</span>
          </button>
        ))}
      </div>

      {/* Render the selected planet's guide */}
      {selectedPlanet === "mercury" ? (
        <MercuryRetrogradeGuide allCharts={allCharts} primaryUserName={primaryUserName} />
      ) : (
        <PlanetRetrogradeGuide
          planet={PLANETS.find(p => p.id === selectedPlanet)?.name || "Venus"}
          allCharts={allCharts}
          primaryUserName={primaryUserName}
        />
      )}
    </div>
  );
}
