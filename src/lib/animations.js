export const ANIMATION_VARIANTS = [
  // 1. The Classic (Current)
  {
    photo: "animate-in zoom-in-[2] duration-[800ms] ease-out fill-mode-both",
    selectedText: "animate-in slide-in-from-bottom-10 duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in slide-in-from-bottom-10 duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-bottom-10 duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in slide-in-from-bottom-16 fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 2. Spin and Drop
  {
    photo: "animate-in spin-in-180 zoom-in duration-[800ms] ease-out fill-mode-both",
    selectedText: "animate-in slide-in-from-top-10 fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in slide-in-from-top-10 fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-top-10 fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in zoom-in fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 3. Slide from Sides
  {
    photo: "animate-in slide-in-from-left-[100%] fade-in duration-[800ms] ease-out fill-mode-both",
    selectedText: "animate-in slide-in-from-right-[100%] fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in slide-in-from-left-[100%] fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-right-[100%] fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in slide-in-from-bottom-[100%] fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 4. Fade Sequence
  {
    photo: "animate-in fade-in duration-1000 ease-in-out fill-mode-both",
    selectedText: "animate-in fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 5. Quick Pop
  {
    photo: "animate-in zoom-in-[0.1] duration-700 ease-out fill-mode-both",
    selectedText: "animate-in slide-in-from-bottom-24 duration-500 delay-[300ms] fill-mode-both",
    nameText: "animate-in slide-in-from-bottom-24 duration-500 delay-[400ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-bottom-24 duration-500 delay-[500ms] fill-mode-both",
    teamBadge: "animate-in zoom-in-[3] fade-in duration-500 delay-[700ms] fill-mode-both"
  },
  // 6. Explode from Center
  {
    photo: "animate-in zoom-in-[0] fade-in duration-1000 ease-out fill-mode-both",
    selectedText: "animate-in zoom-in-[0] fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in zoom-in-[0] fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in zoom-in-[0] fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in zoom-in-[0] fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 7. Slam Down
  {
    photo: "animate-in zoom-in-[5] fade-in duration-300 ease-in fill-mode-both",
    selectedText: "animate-in slide-in-from-top-[100%] duration-300 delay-[400ms] fill-mode-both",
    nameText: "animate-in slide-in-from-top-[100%] duration-300 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-top-[100%] duration-300 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in slide-in-from-bottom-[100%] duration-300 delay-[800ms] fill-mode-both"
  },
  // 8. Rotate Sequence
  {
    photo: "animate-in spin-in-90 fade-in duration-[800ms] ease-out fill-mode-both",
    selectedText: "animate-in spin-in-[-90] fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in spin-in-[90] fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in spin-in-[-90] fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in spin-in-[180] fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 9. Sweep In
  {
    photo: "animate-in slide-in-from-bottom-[100%] slide-in-from-left-[100%] fade-in duration-700 fill-mode-both",
    selectedText: "animate-in slide-in-from-top-[100%] slide-in-from-right-[100%] fade-in duration-500 delay-[400ms] fill-mode-both",
    nameText: "animate-in slide-in-from-bottom-[100%] slide-in-from-left-[100%] fade-in duration-500 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-top-[100%] slide-in-from-right-[100%] fade-in duration-500 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in zoom-in fade-in duration-500 delay-[800ms] fill-mode-both"
  },
  // 10. Shrink and Reveal
  {
    photo: "animate-in zoom-in-[1.5] fade-in duration-1000 ease-in-out fill-mode-both",
    selectedText: "animate-in zoom-in-[1.5] fade-in duration-700 delay-[400ms] fill-mode-both",
    nameText: "animate-in zoom-in-[1.5] fade-in duration-700 delay-[500ms] fill-mode-both text-shadow-glow",
    chestNoText: "animate-in zoom-in-[1.5] fade-in duration-700 delay-[600ms] fill-mode-both",
    teamBadge: "animate-in slide-in-from-bottom-24 fade-in duration-700 delay-[800ms] fill-mode-both"
  },
  // 11. Scrolling Card
  {
    photo: "animate-in slide-in-from-bottom-[100%] fade-in duration-[800ms] ease-out fill-mode-both",
    selectedText: "animate-in slide-in-from-bottom-[100%] fade-in duration-700 delay-[200ms] ease-out fill-mode-both",
    nameText: "animate-in slide-in-from-bottom-[100%] fade-in duration-700 delay-[300ms] ease-out fill-mode-both text-shadow-glow",
    chestNoText: "animate-in slide-in-from-bottom-[100%] fade-in duration-700 delay-[400ms] ease-out fill-mode-both",
    teamBadge: "animate-in slide-in-from-bottom-[100%] fade-in duration-700 delay-[500ms] ease-out fill-mode-both"
  }
];
