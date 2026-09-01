import type { Icon } from "@phosphor-icons/react";
import {
  Fingerprint,
  Circuitry,
  GameController,
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
  Cube,
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
    id: "Electronics",
    index: "01",
    name: "Tesla Dept of Electronics",
    shortName: "electronics",
    tagline: "Circuits, signals, and silicon that bring ideas to life.",
    description:
      "Named for Nikola Tesla, this department drives electronics and IoT — building the embedded systems, wireless links, and automation that make hardware feel alive.",
    subAreas: [
      "Embedded Systems",
      "IoT & Wireless",
      "Power Electronics",
      "Automation",
    ],
    icon: Circuitry,
    accentGlyph: "silicon",
  },
  {
    id: "Games",
    index: "02",
    name: "Higinbotham Dept of Game Dev",
    shortName: "game dev",
    tagline: "Play, worlds, and the craft behind them.",
    description:
      "Honoring William Higinbotham, the father of video games, this department makes games end to end — design, code, art, sound, and story.",
    subAreas: [
      "Game Design",
      "Game Programming",
      "Game Art & Animation",
      "Sound & Storytelling",
    ],
    icon: GameController,
    accentGlyph: "joystick",
  },
  {
    id: "Linux",
    index: "03",
    name: "Torvalds Dept of Linux",
    shortName: "linux",
    tagline: "Open systems, kernels, and the command line.",
    description:
      "In the spirit of Linus Torvalds, this department lives in open source — mastering Linux, systems programming, shells, and the craft of the kernel.",
    subAreas: [
      "Linux & the Kernel",
      "Shell & Scripting",
      "Systems Programming",
      "Open Source",
    ],
    icon: Cpu,
    accentGlyph: "kernel",
  },
  {
    id: "Immersive",
    index: "04",
    name: "Sutherland Dept of Immersive Tech",
    shortName: "immersive tech",
    tagline: "Virtual worlds and the interfaces to enter them.",
    description:
      "Following Ivan Sutherland — the father of computer graphics — this department explores VR, AR, and 3D, shaping the next way we interact with machines.",
    subAreas: [
      "Virtual Reality",
      "Augmented Reality",
      "3D Graphics",
      "Haptics & Interfaces",
    ],
    icon: Cube,
    accentGlyph: "immersive",
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
