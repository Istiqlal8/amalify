/**
 * Fixed multi-hue pastels for Beranda, independent of the chosen theme.
 * `ink` is dark enough for text on its own `tint` (>= 4.5:1).
 */
export const pastels = {
  rose: { tint: '#FDE2EE', ink: '#BE185D' },
  sky: { tint: '#DCEBFF', ink: '#1D4ED8' },
  peach: { tint: '#FFE6D1', ink: '#B03A0A' },
  mint: { tint: '#D6F5E6', ink: '#047857' },
  lavender: { tint: '#EAE2FF', ink: '#6D28D9' },
  lemon: { tint: '#FFF2C2', ink: '#8A5406' },
} as const;

export type Pastel = (typeof pastels)[keyof typeof pastels];
