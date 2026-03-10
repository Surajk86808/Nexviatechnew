export type MarqueeLogoItem = {
  name: string;
  src: string;
};

export const LOGO_ITEMS: MarqueeLogoItem[] = [
  { name: "Aws", src: "/logo/aws.svg" },
  { name: "Ibm", src: "/logo/ibm.svg" },
  { name: "Nvidia", src: "/logo/nvidia.svg" },
  { name: "Openai", src: "/logo/openai.svg" },
  { name: "Stripe", src: "/logo/stripe.svg" },
  { name: "Yello", src: "/logo/yello.svg" },
];

export const CARD_IMAGES_BY_KEY: Record<string, string[]> = {
  "apex-e-commerce": [
    "/cards/Apex E-Commerce/Screenshot 2026-02-13 112321.png",
  ],
  "pulse-health-app": [
    "/cards/Pulse Health App/Screenshot 2026-02-13 125234.png",
  ],
  "yello-premier-league-live-player-auction-platform": [
    "/cards/Yello Premier League - Live Player Auction Platform/Screenshot 2026-02-13 211344.png",
    "/cards/Yello Premier League - Live Player Auction Platform/Screenshot 2026-02-13 211714.png",
  ],
};
