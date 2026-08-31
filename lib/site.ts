import type { Icon } from "@phosphor-icons/react";
import {
  Fingerprint,
  Circuitry,
  GameController,
  Database,
  ShieldCheck,
  HardDrives,
  SealCheck,
  Cpu,
  Radio,
  TrafficSign,
  Palette,
  MusicNotes,
  Scroll,
  Dna,
  ChartLineUp,
  GraduationCap,
  GithubLogo,
  InstagramLogo,
  LinkedinLogo,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";

export type Domain = {
  id: string;
  index: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  subAreas: string[];
  icon: Icon;
  accentGlyph: string;
};

export const domains: Domain[] = [
  {
    id: "forensics",
    index: "01",
    name: "Cyber Forensics & Blockchain",
    shortName: "Cyber Forensics",
    tagline: "Evidence, chain of custody, and verifiable truth.",
    description:
      "We train the investigators and auditors of the digital world — recovering what others deleted and proving what others left behind.",
    subAreas: [
      "Network Forensics",
      "Digital Evidence Recovery",
      "Blockchain Security & Auditing",
    ],
    icon: Fingerprint,
    accentGlyph: "fingerprint",
  },
  {
    id: "electronics",
    index: "02",
    name: "Electronics and IoT",
    shortName: "Electronics & IoT",
    tagline: "Hardware that feels, senses, and responds.",
    description:
      "From bare silicon to connected products, we build the physical layer that makes software tangible.",
    subAreas: [
      "Embedded Systems",
      "Wireless Communication",
      "Automation & Control Systems",
    ],
    icon: Circuitry,
    accentGlyph: "silicon",
  },
  {
    id: "games",
    index: "03",
    name: "Game Development & Designing",
    shortName: "Game Development",
    tagline: "Worlds, play, and the craft behind them.",
    description:
      "We make games end to end — code, art, sound, and story — and we treat interaction design as engineering.",
    subAreas: [
      "Game Art & Animation",
      "Sound Design & Music Production",
      "Game Storytelling",
    ],
    icon: GameController,
    accentGlyph: "joystick",
  },
  {
    id: "informatics",
    index: "04",
    name: "Informatics",
    shortName: "Informatics",
    tagline: "Computing applied where it changes outcomes.",
    description:
      "The intersection of computation and domain science — from molecules to markets to classrooms.",
    subAreas: [
      "Bioinformatics",
      "Business Informatics",
      "Educational Informatics",
    ],
    icon: Database,
    accentGlyph: "network",
  },
];

export type Project = {
  id: string;
  domain: string;
  name: string;
  blurb: string;
  status: string;
  tags: string[];
  icon: Icon;
  // Public GitHub repo URL (shown in the revealed details), or null for a
  // muted/disabled GitHub chip.
  github: string | null;
};

export const projects: Project[] = [
  {
    id: "sentinelle",
    domain: "Cyber Forensics & Blockchain",
    name: "Sentinel-E",
    blurb:
      "Deepfake detection that flags synthetic media through biometric and temporal artifacts.",
    status: "In development",
    tags: ["Forensics", "AI", "TensorFlow"],
    icon: ShieldCheck,
    github: "https://github.com/jarvis-society/sentinelle",
  },
  {
    id: "abyss",
    domain: "Game Development & Designing",
    name: "Abyss Run",
    blurb:
      "A neon procedurally-generated endless runner with a synthesized synthwave score.",
    status: "Prototype",
    tags: ["Game Dev", "Unity", "Sound Design"],
    icon: GameController,
    github: "https://github.com/jarvis-society/abyss-run",
  },
  {
    id: "hive",
    domain: "Electronics and IoT",
    name: "Project Hive",
    blurb:
      "A campus-wide environmental sensing network streaming live telemetry to a dashboard.",
    status: "Prototype",
    tags: ["IoT", "ESP32", "Telemetry"],
    icon: Cpu,
    github: "https://github.com/jarvis-society/hive",
  },
  {
    id: "codonscope",
    domain: "Informatics",
    name: "CodonScope",
    blurb:
      "An approachable genomic sequence alignment visualiser for undergraduate labs.",
    status: "Research",
    tags: ["Bioinformatics", "Python", "Viz"],
    icon: Dna,
    github: "https://github.com/jarvis-society/codonscope",
  },
  {
    id: "glimmer",
    domain: "Game Development & Designing",
    name: "Glimmer",
    blurb:
      "A puzzle-platformer built around light refraction and hand-painted tilesets.",
    status: "In development",
    tags: ["Godot", "Puzzle", "Pixel Art"],
    icon: Palette,
    github: "https://github.com/jarvis-society/glimmer",
  },
  {
    id: "tetra",
    domain: "Electronics and IoT",
    name: "TETRA-Grid",
    blurb:
      "Self-healing mesh networking firmware for sensor arrays in remote deployments.",
    status: "Prototype",
    tags: ["Mesh", "LoRa", "Embedded"],
    icon: Circuitry,
    github: "https://github.com/jarvis-society/tetra-grid",
  },
  {
    id: "ledgerlens",
    domain: "Cyber Forensics & Blockchain",
    name: "LedgerLens",
    blurb:
      "On-chain forensics tool for tracing wallet activity and flagging laundering paths.",
    status: "Research",
    tags: ["Blockchain", "Audit", "Graph"],
    icon: Fingerprint,
    github: "https://github.com/jarvis-society/ledgerlens",
  },
  {
    id: "ephyr",
    domain: "Informatics",
    name: "Ephyr Notes",
    blurb:
      "An offline-first, graph-structured knowledgebase for research workflows.",
    status: "In development",
    tags: ["PWA", "Graph DB", "TypeScript"],
    icon: ChartLineUp,
    github: "https://github.com/jarvis-society/ephyr",
  },
  {
    id: "voidrunner",
    domain: "Game Development & Designing",
    name: "Voidrunner",
    blurb:
      "A combat flight sim with real-time aerodynamic modelling and dynamic weather.",
    status: "Prototype",
    tags: ["3D", "Physics", "Unreal"],
    icon: GameController,
    github: "https://github.com/jarvis-society/voidrunner",
  },
  {
    id: "birch",
    domain: "Electronics and IoT",
    name: "Project Birch",
    blurb:
      "A smart planter kit that tracks soil moisture, light and ambient audio to keep plants alive.",
    status: "Complete",
    tags: ["IoT", "Sensors", "App"],
    icon: Cpu,
    github: "https://github.com/jarvis-society/birch",
  },
];

// Preview an area icon mapping for potential use in cards.
export const subAreaIcons = {
  network: Radio,
  evidence: HardDrives,
  audit: SealCheck,
  embedded: Circuitry,
  wireless: Radio,
  automation: TrafficSign,
  art: Palette,
  sound: MusicNotes,
  storytelling: Scroll,
  bio: Dna,
  business: ChartLineUp,
  education: GraduationCap,
} as const;

export const navLinks = [
  { label: "Domains", href: "/#domains" },
  { label: "Projects", href: "/#projects" },
  { label: "About", href: "/#about" },
  { label: "Playground", href: "/playground" },
  { label: "Contact", href: "/#contact" },
];

export const socialLinks = [
  { label: "Linkedin", href: "https://www.linkedin.com/company/jarvis-club/", icon: LinkedinLogo },
  { label: "Instagram", href: "https://instagram.com/jarvis_iitm/", icon: InstagramLogo },
];

export const contactMeta = {
  email: "jarvis.society@study.iitm.ac.in",
  emailIcon: EnvelopeSimple,
};
