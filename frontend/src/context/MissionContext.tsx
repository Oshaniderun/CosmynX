import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { LandingSite } from "../types/helios";

export interface MissionDates {
  startUtc: string;
  endUtc: string;
}

export interface CustomCoordinates {
  latitude_deg: number;
  longitude_deg: number;
}

export interface MissionContextType {
  /** The currently selected landing site across all HELIOS modules. */
  selectedSite: LandingSite | null;
  /** Setter for the active landing site. */
  setSelectedSite: (site: LandingSite | null) => void;
  /** Unified mission date window in UTC ISO 8601 format. */
  missionDates: MissionDates;
  /** Setter for mission date window. */
  setMissionDates: (dates: MissionDates) => void;
  /** Calculation step resolution in minutes (default: 60). */
  stepMinutes: number;
  /** Setter for calculation resolution. */
  setStepMinutes: (step: number) => void;
  /** Optional custom coordinates placed by the user. */
  customCoordinates: CustomCoordinates | null;
  /** Setter for custom coordinates. */
  setCustomCoordinates: (coords: CustomCoordinates | null) => void;
}

const DEFAULT_MISSION_DATES: MissionDates = {
  startUtc: "2026-11-20T00:00:00Z",
  endUtc: "2026-11-23T00:00:00Z",
};

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export interface MissionProviderProps {
  children: ReactNode;
  initialSite?: LandingSite | null;
  initialDates?: MissionDates;
}

export function MissionProvider({
  children,
  initialSite = null,
  initialDates = DEFAULT_MISSION_DATES,
}: MissionProviderProps) {
  const [selectedSite, setSelectedSite] = useState<LandingSite | null>(initialSite);
  const [missionDates, setMissionDates] = useState<MissionDates>(initialDates);
  const [stepMinutes, setStepMinutes] = useState<number>(60);
  const [customCoordinates, setCustomCoordinates] =
    useState<CustomCoordinates | null>(null);

  return (
    <MissionContext.Provider
      value={{
        selectedSite,
        setSelectedSite,
        missionDates,
        setMissionDates,
        stepMinutes,
        setStepMinutes,
        customCoordinates,
        setCustomCoordinates,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
}

/**
 * Hook to consume the shared HELIOS mission state.
 * Enables any module (Member 1–6) to synchronize with the selected site and dates.
 */
export function useMission(): MissionContextType {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error("useMission must be used within a MissionProvider");
  }
  return context;
}
