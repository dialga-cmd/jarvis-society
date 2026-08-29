"use client";

import { Particles, ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine, ISourceOptions } from "@tsparticles/engine";

const init = async (engine: Engine) => {
  await loadSlim(engine);
};

const options: ISourceOptions = {
  fullScreen: {
    enable: false,
    zIndex: 0,
  },
  fpsLimit: 60,
  detectRetina: true,
  background: {
    color: {
      value: "transparent",
    },
  },
  particles: {
    number: {
      value: 46,
      density: {
        enable: true,
        width: 1400,
        height: 900,
      },
    },
    color: {
      value: "#5A7CA6",
    },
    shape: {
      type: "circle",
    },
    opacity: {
      value: { min: 0.2, max: 0.5 },
    },
    size: {
      value: { min: 1, max: 2.6 },
    },
    links: {
      enable: true,
      distance: 130,
      color: "#5A7CA6",
      opacity: 0.16,
      width: 1,
    },
    move: {
      enable: true,
      speed: 0.55,
      direction: "none",
      random: true,
      straight: false,
      outModes: {
        default: "out",
      },
    },
  },
  interactivity: {
    events: {
      onHover: {
        enable: true,
        mode: "grab",
      },
    },
    modes: {
      grab: {
        distance: 140,
        links: {
          opacity: 0.35,
        },
      },
    },
  },
};

export function AmbientNetwork() {
  return (
    <ParticlesProvider init={init}>
      <Particles
        id="hero-network"
        className="absolute inset-0 h-full w-full"
        options={options}
      />
    </ParticlesProvider>
  );
}
