import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BookEase — Platform Reservasi Jasa & Janji Temu Online",
    short_name: "BookEase",
    description:
      "Platform reservasi digital dan manajemen janji temu online tanpa bentrok untuk bisnis jasa profesional di Indonesia.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
