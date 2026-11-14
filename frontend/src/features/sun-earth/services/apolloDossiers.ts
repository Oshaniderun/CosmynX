import type { LandingSite } from "../../../types/helios";

export interface ApolloDossier {
  id: string;
  mission: string;
  patchLabel: string;
  date: string;
  touchdownUtc: string;
  siteName: string;
  region: string;
  latitudeDeg: number;
  longitudeDeg: number;
  crew: {
    commander: string;
    lunarModulePilot: string;
    commandModulePilot: string;
  };
  spacecraft: {
    lunarModule: string;
    commandServiceModule: string;
  };
  stats: {
    evaCount: number;
    totalEvaDuration: string;
    sampleMassKg: number;
    maxDistanceTraveledMeters?: number;
    roverDistanceKm?: number;
  };
  description: string;
}

export const APOLLO_DOSSIERS: Record<string, ApolloDossier> = {
  apollo_11: {
    id: "apollo_11",
    mission: "Apollo 11",
    patchLabel: "Apollo 11 · First Human Lunar Touchdown",
    date: "July 20, 1969",
    touchdownUtc: "1969-07-20T20:17:40Z",
    siteName: "Tranquility Base (Mare Tranquillitatis)",
    region: "Mare Tranquillitatis",
    latitudeDeg: 0.67408,
    longitudeDeg: 23.47297,
    crew: {
      commander: 'Neil A. Armstrong',
      lunarModulePilot: 'Edwin E. "Buzz" Aldrin Jr.',
      commandModulePilot: "Michael Collins",
    },
    spacecraft: {
      lunarModule: "LM-5 Eagle",
      commandServiceModule: "CSM-107 Columbia",
    },
    stats: {
      evaCount: 1,
      totalEvaDuration: "2h 31m 40s",
      sampleMassKg: 21.55,
      maxDistanceTraveledMeters: 60,
    },
    description:
      'This is the site where American astronauts Neil Armstrong and Edwin "Buzz" Aldrin made the first human landing on the Moon on July 20, 1969. Armstrong and Aldrin landed here aboard the lunar module Eagle, while Michael Collins remained in orbit around the Moon in the command module Columbia. Armstrong and Aldrin conducted one Extra-Vehicular Activity (EVA) or "Moonwalk" on the lunar surface lasting 2 hours, 31 minutes 40 seconds, remaining within 60 meters of the lunar module. They collected 21.55 kg of lunar sample material for return to the Earth. In this LRO NAC view of the landing site, the descent stage of the Eagle is the largest man-made object visible. The dark tracks of the astronauts’ footprints extend out from it clustered primarily in 3 directions. To the northwest, the tracks extend to the location where the astronauts set up a TV camera. To the south, tracks extend to where a Lunar Ranging Retroreflector and the Passive Seismic Experiment Package were deployed. To the east, the tracks extend to the rim of Little West Crater. The landing site is in the southwest part of Mare Tranquilitatis, an area characterized by extensive deposits of mare basalt lava rock.',
  },
  apollo_12: {
    id: "apollo_12",
    mission: "Apollo 12",
    patchLabel: "Apollo 12 · Precision Touchdown & Surveyor 3 Visit",
    date: "November 19, 1969",
    touchdownUtc: "1969-11-19T06:54:35Z",
    siteName: "Ocean of Storms (Oceanus Procellarum)",
    region: "Oceanus Procellarum",
    latitudeDeg: -3.01239,
    longitudeDeg: -23.42157,
    crew: {
      commander: 'Charles "Pete" Conrad Jr.',
      lunarModulePilot: "Alan L. Bean",
      commandModulePilot: "Richard F. Gordon Jr.",
    },
    spacecraft: {
      lunarModule: "LM-6 Intrepid",
      commandServiceModule: "CSM-108 Yankee Clipper",
    },
    stats: {
      evaCount: 2,
      totalEvaDuration: "7h 45m 18s",
      sampleMassKg: 34.35,
      maxDistanceTraveledMeters: 417,
    },
    description:
      'Apollo 12 accomplished the first pinpoint landing on the lunar surface, touching down inside Oceanus Procellarum just 160 meters from the robotic Surveyor 3 spacecraft, which had landed on the Moon in April 1967. Astronauts Pete Conrad and Alan Bean completed two EVAs totaling over 7.5 hours. They examined and retrieved parts of the Surveyor 3 probe—including its TV camera—for return to Earth to study long-term environmental exposure to the harsh lunar vacuum, thermal swings, and micrometeoroid flux. The crew deployed the Apollo Lunar Surface Experiments Package (ALSEP), which remained operational and transmitted scientific data until 1977.',
  },
  apollo_14: {
    id: "apollo_14",
    mission: "Apollo 14",
    patchLabel: "Apollo 14 · Fra Mauro Highlands & Cone Crater",
    date: "February 5, 1971",
    touchdownUtc: "1971-02-05T09:18:11Z",
    siteName: "Fra Mauro Formation",
    region: "Fra Mauro Highlands",
    latitudeDeg: -3.6453,
    longitudeDeg: -17.47136,
    crew: {
      commander: "Alan B. Shepard Jr.",
      lunarModulePilot: "Edgar D. Mitchell",
      commandModulePilot: "Stuart A. Roosa",
    },
    spacecraft: {
      lunarModule: "LM-8 Antares",
      commandServiceModule: "CSM-110 Kitty Hawk",
    },
    stats: {
      evaCount: 2,
      totalEvaDuration: "9h 22m 31s",
      sampleMassKg: 42.8,
      maxDistanceTraveledMeters: 1450,
    },
    description:
      'Apollo 14 landed in the rugged Fra Mauro highlands, targeting the thick ejecta blanket produced by the colossal impact that excavated the Imbrium Basin billions of years ago. Commander Alan Shepard and Lunar Module Pilot Edgar Mitchell utilized the Modular Equipment Transporter (MET) handcart to haul geology tools and sample containers during an ambitious uphill trek toward the 300-meter-wide rim of Cone Crater. During two lunar surface excursions, the astronauts recovered 42.8 kg of rocks and impact breccias, deployed the ALSEP science network, and Shepard famously swung a makeshift six-iron to strike two golf balls into the lunar distance.',
  },
  apollo_15: {
    id: "apollo_15",
    mission: "Apollo 15",
    patchLabel: "Apollo 15 · First Lunar Rover & Hadley Rille",
    date: "July 30, 1971",
    touchdownUtc: "1971-07-30T22:16:29Z",
    siteName: "Hadley–Apennine Valley",
    region: "Hadley Rille / Montes Apenninus",
    latitudeDeg: 26.13222,
    longitudeDeg: 3.63386,
    crew: {
      commander: "David R. Scott",
      lunarModulePilot: "James B. Irwin",
      commandModulePilot: "Alfred M. Worden",
    },
    spacecraft: {
      lunarModule: "LM-10 Falcon",
      commandServiceModule: "CSM-112 Endeavour",
    },
    stats: {
      evaCount: 3,
      totalEvaDuration: "18h 33m 24s",
      sampleMassKg: 77.31,
      roverDistanceKm: 27.9,
    },
    description:
      'Apollo 15 marked the debut of the heavy "J-series" scientific exploration missions and introduced the Lunar Roving Vehicle (LRV). Landing in the dramatic valley bordered by the 4,500-meter peaks of the Montes Apenninus and the meandering canyon of Hadley Rille, astronauts David Scott and James Irwin drove 27.9 km across the surface over three EVAs. They discovered the legendary "Genesis Rock" (anorthosite sample 15415, dating back ~4.1 billion years to the Moon’s primordial crust) and conducted Galileo’s classic hammer-and-feather gravitational drop experiment in the lunar vacuum.',
  },
  apollo_16: {
    id: "apollo_16",
    mission: "Apollo 16",
    patchLabel: "Apollo 16 · Central Highlands Exploration",
    date: "April 21, 1972",
    touchdownUtc: "1972-04-21T07:27:35Z",
    siteName: "Descartes Highlands",
    region: "Cayley Plains / Stone Mountain",
    latitudeDeg: -8.97301,
    longitudeDeg: 15.49812,
    crew: {
      commander: "John W. Young",
      lunarModulePilot: "Charles M. Duke Jr.",
      commandModulePilot: "Thomas K. Mattingly II",
    },
    spacecraft: {
      lunarModule: "LM-11 Orion",
      commandServiceModule: "CSM-113 Casper",
    },
    stats: {
      evaCount: 3,
      totalEvaDuration: "20h 14m 14s",
      sampleMassKg: 95.71,
      roverDistanceKm: 26.7,
    },
    description:
      'Apollo 16 was the only mission targeted to the central lunar highlands, touching down on the Cayley Plains near the base of Stone Mountain. Prior to the mission, planetary scientists expected the Descartes formation to be composed of volcanic lava flows. However, during 20 hours of surface exploration using the Lunar Rover, John Young and Charlie Duke discovered that the highlands are overwhelmingly formed of impact-shattered breccias—a fundamental discovery that reshaped lunar geological science. The crew collected 95.7 kg of samples, including "Big Muley" (11.7 kg), the largest rock returned by Apollo.',
  },
  apollo_17: {
    id: "apollo_17",
    mission: "Apollo 17",
    patchLabel: "Apollo 17 · Taurus-Littrow & Orange Soil Discovery",
    date: "December 11, 1972",
    touchdownUtc: "1972-12-11T19:54:57Z",
    siteName: "Taurus–Littrow Valley",
    region: "Taurus–Littrow Valley",
    latitudeDeg: 20.1908,
    longitudeDeg: 30.77168,
    crew: {
      commander: "Eugene A. Cernan",
      lunarModulePilot: 'Harrison H. "Jack" Schmitt',
      commandModulePilot: "Ronald E. Evans",
    },
    spacecraft: {
      lunarModule: "LM-12 Challenger",
      commandServiceModule: "CSM-114 America",
    },
    stats: {
      evaCount: 3,
      totalEvaDuration: "22h 04m 00s",
      sampleMassKg: 110.52,
      roverDistanceKm: 35.7,
    },
    description:
      'Apollo 17 was the culminating human mission of the Apollo lunar program. Landing in the narrow Taurus–Littrow valley nestled between the North and South Massifs, Commander Eugene Cernan and professional geologist Harrison "Jack" Schmitt spent 75 hours on the Moon, completing three moonwalks totaling 22 hours. At Shorty Crater, Schmitt made the startling discovery of vibrant orange volcanic glass beads, providing definitive proof of explosive pyroclastic fire-fountaining in lunar antiquity. The crew returned 110.5 kg of geological samples and traversed 35.7 km in the Lunar Rover.',
  },
};

export function getApolloDossier(siteId: string): ApolloDossier | null {
  return APOLLO_DOSSIERS[siteId] ?? null;
}

export function apolloDossierToLandingSite(dossier: ApolloDossier): LandingSite {
  return {
    site_id: dossier.id,
    name: `${dossier.mission} (${dossier.region})`,
    region: dossier.region,
    latitude_deg: dossier.latitudeDeg,
    longitude_deg: dossier.longitudeDeg,
    description: dossier.description,
    elevation_m: null,
    source: "NASA LRO / Apollo Lunar Surface Journal",
    coordinate_type: "historical_touchdown",
  };
}
