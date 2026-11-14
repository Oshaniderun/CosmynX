// Generated from the upstream declarations. See README.md and the included license.
export declare type FlexibleDateTime = Date | number | AstroTime;
export declare const C_AUDAY = 173.1446326846693;
export declare const KM_PER_AU = 149597870.69098932;
export declare const AU_PER_LY = 63241.07708807546;
export declare const DEG2RAD = 0.017453292519943295;
export declare const HOUR2RAD = 0.26179938779914946;
export declare const RAD2DEG = 57.29577951308232;
export declare const RAD2HOUR = 3.819718634205488;
export declare const JUPITER_EQUATORIAL_RADIUS_KM = 71492;
export declare const JUPITER_POLAR_RADIUS_KM = 66854;
export declare const JUPITER_MEAN_RADIUS_KM = 69911;
export declare const IO_RADIUS_KM = 1821.6;
export declare const EUROPA_RADIUS_KM = 1560.8;
export declare const GANYMEDE_RADIUS_KM = 2631.2;
export declare const CALLISTO_RADIUS_KM = 2410.3;
export declare function MassProduct(body: Body): number;
export declare function AngleBetween(a: Vector, b: Vector): number;
export declare enum Body {
    Sun = "Sun",
    Moon = "Moon",
    Mercury = "Mercury",
    Venus = "Venus",
    Earth = "Earth",
    Mars = "Mars",
    Jupiter = "Jupiter",
    Saturn = "Saturn",
    Uranus = "Uranus",
    Neptune = "Neptune",
    Pluto = "Pluto",
    SSB = "SSB",
    EMB = "EMB",
    Star1 = "Star1",
    Star2 = "Star2",
    Star3 = "Star3",
    Star4 = "Star4",
    Star5 = "Star5",
    Star6 = "Star6",
    Star7 = "Star7",
    Star8 = "Star8"
}
export declare function DefineStar(body: Body, ra: number, dec: number, distanceLightYears: number): void;
export declare function PlanetOrbitalPeriod(body: Body): number;
export declare function DeltaT_EspenakMeeus(ut: number): number;
export declare type DeltaTimeFunction = (ut: number) => number;
export declare function DeltaT_JplHorizons(ut: number): number;
export declare function SetDeltaTFunction(func: DeltaTimeFunction): void;
export declare class AstroTime {
    date: Date;
    ut: number;
    tt: number;
    constructor(date: FlexibleDateTime);
    static FromTerrestrialTime(tt: number): AstroTime;
    toString(): string;
    AddDays(days: number): AstroTime;
}
export declare function MakeTime(date: FlexibleDateTime): AstroTime;
export interface EarthTiltInfo {
    tt: number;
    dpsi: number;
    deps: number;
    ee: number;
    mobl: number;
    tobl: number;
}
export declare function e_tilt(time: AstroTime): EarthTiltInfo;
export declare let CalcMoonCount: number;
export declare class LibrationInfo {
    elat: number;
    elon: number;
    mlat: number;
    mlon: number;
    dist_km: number;
    diam_deg: number;
    constructor(elat: number, elon: number, mlat: number, mlon: number, dist_km: number, diam_deg: number);
}
export declare function Libration(date: FlexibleDateTime): LibrationInfo;
export declare function SiderealTime(date: FlexibleDateTime): number;
export declare class Vector {
    x: number;
    y: number;
    z: number;
    t: AstroTime;
    constructor(x: number, y: number, z: number, t: AstroTime);
    Length(): number;
}
export declare class StateVector {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    t: AstroTime;
    constructor(x: number, y: number, z: number, vx: number, vy: number, vz: number, t: AstroTime);
}
export declare class Spherical {
    lat: number;
    lon: number;
    dist: number;
    constructor(lat: number, lon: number, dist: number);
}
export declare class EquatorialCoordinates {
    ra: number;
    dec: number;
    dist: number;
    vec: Vector;
    constructor(ra: number, dec: number, dist: number, vec: Vector);
}
export declare class RotationMatrix {
    rot: number[][];
    constructor(rot: number[][]);
}
export declare function MakeRotation(rot: number[][]): RotationMatrix;
export declare class HorizontalCoordinates {
    azimuth: number;
    altitude: number;
    ra: number;
    dec: number;
    constructor(azimuth: number, altitude: number, ra: number, dec: number);
}
export declare class EclipticCoordinates {
    vec: Vector;
    elat: number;
    elon: number;
    constructor(vec: Vector, elat: number, elon: number);
}
export declare function Horizon(date: FlexibleDateTime, observer: Observer, ra: number, dec: number, refraction?: string): HorizontalCoordinates;
export declare class Observer {
    latitude: number;
    longitude: number;
    height: number;
    constructor(latitude: number, longitude: number, height: number);
}
export declare function SunPosition(date: FlexibleDateTime): EclipticCoordinates;
export declare function Equator(body: Body, date: FlexibleDateTime, observer: Observer, ofdate: boolean, aberration: boolean): EquatorialCoordinates;
export declare function ObserverVector(date: FlexibleDateTime, observer: Observer, ofdate: boolean): Vector;
export declare function ObserverState(date: FlexibleDateTime, observer: Observer, ofdate: boolean): StateVector;
export declare function VectorObserver(vector: Vector, ofdate: boolean): Observer;
export declare function ObserverGravity(latitude: number, height: number): number;
export declare function Ecliptic(eqj: Vector): EclipticCoordinates;
export declare function GeoMoon(date: FlexibleDateTime): Vector;
export declare function EclipticGeoMoon(date: FlexibleDateTime): Spherical;
export declare function GeoMoonState(date: FlexibleDateTime): StateVector;
export declare function GeoEmbState(date: FlexibleDateTime): StateVector;
export declare class JupiterMoonsInfo {
    io: StateVector;
    europa: StateVector;
    ganymede: StateVector;
    callisto: StateVector;
    constructor(io: StateVector, europa: StateVector, ganymede: StateVector, callisto: StateVector);
}
export declare function JupiterMoons(date: FlexibleDateTime): JupiterMoonsInfo;
export declare function HelioVector(body: Body, date: FlexibleDateTime): Vector;
export declare function HelioDistance(body: Body, date: FlexibleDateTime): number;
export declare function CorrectLightTravel(func: (t: AstroTime) => Vector, time: AstroTime): Vector;
export declare function BackdatePosition(date: FlexibleDateTime, observerBody: Body, targetBody: Body, aberration: boolean): Vector;
export declare function GeoVector(body: Body, date: FlexibleDateTime, aberration: boolean): Vector;
export declare function BaryState(body: Body, date: FlexibleDateTime): StateVector;
export declare function HelioState(body: Body, date: FlexibleDateTime): StateVector;
export interface SearchOptions {
    dt_tolerance_seconds?: number;
    init_f1?: number;
    init_f2?: number;
    iter_limit?: number;
}
export declare function Search(f: (t: AstroTime) => number, t1: AstroTime, t2: AstroTime, options?: SearchOptions): AstroTime | null;
export declare function SearchSunLongitude(targetLon: number, dateStart: FlexibleDateTime, limitDays: number): AstroTime | null;
export declare function PairLongitude(body1: Body, body2: Body, date: FlexibleDateTime): number;
export declare function AngleFromSun(body: Body, date: FlexibleDateTime): number;
export declare function EclipticLongitude(body: Body, date: FlexibleDateTime): number;
export declare class IlluminationInfo {
    time: AstroTime;
    mag: number;
    phase_angle: number;
    helio_dist: number;
    geo_dist: number;
    gc: Vector;
    hc: Vector;
    ring_tilt?: number | undefined;
    phase_fraction: number;
    constructor(time: AstroTime, mag: number, phase_angle: number, helio_dist: number, geo_dist: number, gc: Vector, hc: Vector, ring_tilt?: number | undefined);
}
export declare function Illumination(body: Body, date: FlexibleDateTime): IlluminationInfo;
export declare function SearchRelativeLongitude(body: Body, targetRelLon: number, startDate: FlexibleDateTime): AstroTime;
export declare function MoonPhase(date: FlexibleDateTime): number;
export declare function SearchMoonPhase(targetLon: number, dateStart: FlexibleDateTime, limitDays: number): AstroTime | null;
export declare class MoonQuarter {
    quarter: number;
    time: AstroTime;
    constructor(quarter: number, time: AstroTime);
}
export declare function SearchMoonQuarter(dateStart: FlexibleDateTime): MoonQuarter;
export declare function NextMoonQuarter(mq: MoonQuarter): MoonQuarter;
export declare class AtmosphereInfo {
    pressure: number;
    temperature: number;
    density: number;
    constructor(pressure: number, temperature: number, density: number);
}
export declare function Atmosphere(elevationMeters: number): AtmosphereInfo;
export declare function SearchRiseSet(body: Body, observer: Observer, direction: number, dateStart: FlexibleDateTime, limitDays: number, metersAboveGround?: number): AstroTime | null;
export declare function SearchAltitude(body: Body, observer: Observer, direction: number, dateStart: FlexibleDateTime, limitDays: number, altitude: number): AstroTime | null;
export declare class HourAngleEvent {
    time: AstroTime;
    hor: HorizontalCoordinates;
    constructor(time: AstroTime, hor: HorizontalCoordinates);
}
export declare function SearchHourAngle(body: Body, observer: Observer, hourAngle: number, dateStart: FlexibleDateTime, direction?: number): HourAngleEvent;
export declare function HourAngle(body: Body, date: FlexibleDateTime, observer: Observer): number;
export declare class SeasonInfo {
    mar_equinox: AstroTime;
    jun_solstice: AstroTime;
    sep_equinox: AstroTime;
    dec_solstice: AstroTime;
    constructor(mar_equinox: AstroTime, jun_solstice: AstroTime, sep_equinox: AstroTime, dec_solstice: AstroTime);
}
export declare function Seasons(year: (number | AstroTime)): SeasonInfo;
export declare class ElongationEvent {
    time: AstroTime;
    visibility: string;
    elongation: number;
    ecliptic_separation: number;
    constructor(time: AstroTime, visibility: string, elongation: number, ecliptic_separation: number);
}
export declare function Elongation(body: Body, date: FlexibleDateTime): ElongationEvent;
export declare function SearchMaxElongation(body: Body, startDate: FlexibleDateTime): ElongationEvent;
export declare function SearchPeakMagnitude(body: Body, startDate: FlexibleDateTime): IlluminationInfo;
export declare enum ApsisKind {
    Pericenter = 0,
    Apocenter = 1
}
export declare class Apsis {
    time: AstroTime;
    kind: ApsisKind;
    dist_au: number;
    dist_km: number;
    constructor(time: AstroTime, kind: ApsisKind, dist_au: number);
}
export declare function SearchLunarApsis(startDate: FlexibleDateTime): Apsis;
export declare function NextLunarApsis(apsis: Apsis): Apsis;
export declare function SearchPlanetApsis(body: Body, startTime: FlexibleDateTime): Apsis;
export declare function NextPlanetApsis(body: Body, apsis: Apsis): Apsis;
export declare function InverseRotation(rotation: RotationMatrix): RotationMatrix;
export declare function CombineRotation(a: RotationMatrix, b: RotationMatrix): RotationMatrix;
export declare function IdentityMatrix(): RotationMatrix;
export declare function Pivot(rotation: RotationMatrix, axis: 0 | 1 | 2, angle: number): RotationMatrix;
export declare function VectorFromSphere(sphere: Spherical, time: FlexibleDateTime): Vector;
export declare function EquatorFromVector(vec: Vector): EquatorialCoordinates;
export declare function SphereFromVector(vector: Vector): Spherical;
export declare function HorizonFromVector(vector: Vector, refraction: string): Spherical;
export declare function VectorFromHorizon(sphere: Spherical, time: FlexibleDateTime, refraction: string): Vector;
export declare function Refraction(refraction: string, altitude: number): number;
export declare function InverseRefraction(refraction: string, bent_altitude: number): number;
export declare function RotateVector(rotation: RotationMatrix, vector: Vector): Vector;
export declare function RotateState(rotation: RotationMatrix, state: StateVector): StateVector;
export declare function Rotation_EQJ_ECL(): RotationMatrix;
export declare function Rotation_ECL_EQJ(): RotationMatrix;
export declare function Rotation_EQJ_EQD(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_EQJ_ECT(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_ECT_EQJ(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_EQD_EQJ(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_EQD_HOR(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_HOR_EQD(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_HOR_EQJ(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_EQJ_HOR(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_EQD_ECL(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_ECL_EQD(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_ECL_HOR(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_HOR_ECL(time: FlexibleDateTime, observer: Observer): RotationMatrix;
export declare function Rotation_EQJ_GAL(): RotationMatrix;
export declare function Rotation_GAL_EQJ(): RotationMatrix;
export declare function Rotation_ECT_EQD(time: FlexibleDateTime): RotationMatrix;
export declare function Rotation_EQD_ECT(time: FlexibleDateTime): RotationMatrix;
export declare class ConstellationInfo {
    symbol: string;
    name: string;
    ra1875: number;
    dec1875: number;
    constructor(symbol: string, name: string, ra1875: number, dec1875: number);
}
export declare function Constellation(ra: number, dec: number): ConstellationInfo;
export declare enum EclipseKind {
    Penumbral = "penumbral",
    Partial = "partial",
    Annular = "annular",
    Total = "total"
}
export declare class LunarEclipseInfo {
    kind: EclipseKind;
    obscuration: number;
    peak: AstroTime;
    sd_penum: number;
    sd_partial: number;
    sd_total: number;
    constructor(kind: EclipseKind, obscuration: number, peak: AstroTime, sd_penum: number, sd_partial: number, sd_total: number);
}
export declare function SearchLunarEclipse(date: FlexibleDateTime): LunarEclipseInfo;
export declare class GlobalSolarEclipseInfo {
    kind: EclipseKind;
    obscuration: number | undefined;
    peak: AstroTime;
    distance: number;
    latitude?: number | undefined;
    longitude?: number | undefined;
    constructor(kind: EclipseKind, obscuration: number | undefined, peak: AstroTime, distance: number, latitude?: number | undefined, longitude?: number | undefined);
}
export declare function NextLunarEclipse(prevEclipseTime: FlexibleDateTime): LunarEclipseInfo;
export declare function SearchGlobalSolarEclipse(startTime: FlexibleDateTime): GlobalSolarEclipseInfo;
export declare function NextGlobalSolarEclipse(prevEclipseTime: FlexibleDateTime): GlobalSolarEclipseInfo;
export declare class EclipseEvent {
    time: AstroTime;
    altitude: number;
    constructor(time: AstroTime, altitude: number);
}
export declare class LocalSolarEclipseInfo {
    kind: EclipseKind;
    obscuration: number;
    partial_begin: EclipseEvent;
    total_begin: EclipseEvent | undefined;
    peak: EclipseEvent;
    total_end: EclipseEvent | undefined;
    partial_end: EclipseEvent;
    constructor(kind: EclipseKind, obscuration: number, partial_begin: EclipseEvent, total_begin: EclipseEvent | undefined, peak: EclipseEvent, total_end: EclipseEvent | undefined, partial_end: EclipseEvent);
}
export declare function SearchLocalSolarEclipse(startTime: FlexibleDateTime, observer: Observer): LocalSolarEclipseInfo;
export declare function NextLocalSolarEclipse(prevEclipseTime: FlexibleDateTime, observer: Observer): LocalSolarEclipseInfo;
export declare class TransitInfo {
    start: AstroTime;
    peak: AstroTime;
    finish: AstroTime;
    separation: number;
    constructor(start: AstroTime, peak: AstroTime, finish: AstroTime, separation: number);
}
export declare function SearchTransit(body: Body, startTime: FlexibleDateTime): TransitInfo;
export declare function NextTransit(body: Body, prevTransitTime: FlexibleDateTime): TransitInfo;
export declare enum NodeEventKind {
    Invalid = 0,
    Ascending = 1,
    Descending = -1
}
export declare class NodeEventInfo {
    kind: NodeEventKind;
    time: AstroTime;
    constructor(kind: NodeEventKind, time: AstroTime);
}
export declare function SearchMoonNode(startTime: FlexibleDateTime): NodeEventInfo;
export declare function NextMoonNode(prevNode: NodeEventInfo): NodeEventInfo;
export declare class AxisInfo {
    ra: number;
    dec: number;
    spin: number;
    north: Vector;
    constructor(ra: number, dec: number, spin: number, north: Vector);
}
export declare function RotationAxis(body: Body, date: FlexibleDateTime): AxisInfo;
export declare function LagrangePoint(point: number, date: FlexibleDateTime, major_body: Body, minor_body: Body): StateVector;
export declare function LagrangePointFast(point: number, major_state: StateVector, major_mass: number, minor_state: StateVector, minor_mass: number): StateVector;
export declare class GravitySimulator {
    private originBody;
    private prev;
    private curr;
    constructor(originBody: Body, date: FlexibleDateTime, bodyStates: StateVector[]);
    get OriginBody(): Body;
    get Time(): AstroTime;
    Update(date: FlexibleDateTime): StateVector[];
    Swap(): void;
    SolarSystemBodyState(body: Body): StateVector;
    private InternalBodyState;
    private static CalcSolarSystem;
    private CalcBodyAccelerations;
    private static AddAcceleration;
    private Duplicate;
}
