export const DEFAULT_MUSIC_TRACK = "constellations";

export const MUSIC_TRACKS = [
  { id: DEFAULT_MUSIC_TRACK, file: "constellations-v1.ogg", name: "La ronde des constellations", cost: 0 },
  { id: "neptune", file: "neptune-v1.ogg", name: "Les jardins de Neptune", cost: 400,
    description: "Une promenade en 6/8 pour flûte, harpe et violoncelle." },
  { id: "cometes", file: "cometes-v1.ogg", name: "Le train des comètes", cost: 400,
    description: "Une bossa nova au vibraphone, à la clarinette et à la guitare." },
] as const;

export type MusicTrackId = (typeof MUSIC_TRACKS)[number]["id"];
