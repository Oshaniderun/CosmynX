import { SearchLunarEclipse } from "../vendor/astronomy-runtime.js";

const minute = 60_000;

const stageDescriptions = [
  {
    label: "Before eclipse",
    shortLabel: "Before",
    sunlight: "Clear of Earth’s shadow",
    scene: "The Moon approaches Earth’s shadow while its sunlit face appears bright from Earth.",
    impact: "A site with a clear view of the Sun receives its usual direct sunlight.",
  },
  {
    label: "Entering the penumbra",
    shortLabel: "Dimming",
    sunlight: "Direct sunlight starts to fade",
    scene: "The Moon enters the penumbra, Earth’s outer shadow. The first change in brightness can be hard to see.",
    impact: "Earth starts to cover part of the solar disk as seen from affected sites, so their panels can receive less sunlight.",
  },
  {
    label: "Partial eclipse · entering the umbra",
    shortLabel: "Partial entry",
    sunlight: "Direct sunlight lost at some sites",
    scene: "A dark edge moves across the Moon as it enters the umbra, the inner shadow where Earth blocks the entire solar disk.",
    impact: "Sites inside the umbra lose direct sunlight first. Other sites can still receive some light as the shadow advances.",
  },
  {
    label: "Totality",
    shortLabel: "Totality",
    sunlight: "Direct sunlight blocked",
    scene: "The entire Moon is in the umbra. Sunlight filtered through Earth’s atmosphere gives the Moon its copper glow.",
    impact: "A solar-powered lander would need stored energy or another power source for essential systems. The surface can cool quickly.",
  },
  {
    label: "Partial eclipse · leaving the umbra",
    shortLabel: "Partial exit",
    sunlight: "Direct sunlight returns at some sites",
    scene: "A bright edge reappears as the Moon starts to leave the umbra.",
    impact: "Direct sunlight returns first to sites that have left the inner shadow and still have the Sun above their horizon.",
  },
  {
    label: "Leaving the penumbra",
    shortLabel: "Brightening",
    sunlight: "Direct sunlight strengthens",
    scene: "The Moon has left the umbra. The slight dimming fades as it crosses the outer shadow.",
    impact: "Earth covers less of the solar disk, so available sunlight gradually recovers wherever the Sun is visible.",
  },
  {
    label: "After eclipse",
    shortLabel: "After",
    sunlight: "Clear of Earth’s shadow",
    scene: "The Moon leaves the penumbra and resumes its usual brightness.",
    impact: "Site lighting again depends on the Sun’s position and any terrain in the way. Illuminated solar panels can recharge batteries if there is surplus power.",
  },
];

function eclipse(label: string, year: number, month: number) {
  const result = SearchLunarEclipse(new Date(Date.UTC(year, month - 1, 1)));
  const peak = result.peak.date.getTime();
  const padding = Math.ceil(result.sd_penum + 8);
  const boundaries = [
    -padding, -result.sd_penum, -result.sd_partial, -result.sd_total,
    result.sd_total, result.sd_partial, result.sd_penum, padding,
  ].map((offset) => Math.round(peak + offset * minute));
  return {
    label,
    start: boundaries[0],
    end: boundaries[boundaries.length - 1],
    stages: stageDescriptions.map((description, index) => ({
      ...description,
      start: boundaries[index],
      end: boundaries[index + 1],
    })),
  };
}

export const lunarEclipses = [
  eclipse("14 March 2025", 2025, 3),
  eclipse("7 September 2025", 2025, 9),
];

export type LunarEclipse = (typeof lunarEclipses)[number];

export function eclipseStage(event: LunarEclipse, time: number) {
  return event.stages.find((stage) => time < stage.end) ?? event.stages[event.stages.length - 1];
}
