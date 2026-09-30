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

export const navLinks = [
  { label: "Domains", href: "/#domains" },
  { label: "E&S", href: "/events" },
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
