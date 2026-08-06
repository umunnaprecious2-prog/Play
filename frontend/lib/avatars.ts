export type AvatarOption = {
  slug: string;
  label: string;
  emoji: string;
  ring: string;
};

export const AVATAR_OPTIONS: AvatarOption[] = [
  { slug: "boy-explorer", label: "Boy", emoji: "🧑", ring: "ring-sky-400 bg-sky-50" },
  { slug: "girl-explorer", label: "Girl", emoji: "👧", ring: "ring-sunrise-400 bg-sunrise-50" },
];

export function avatarEmoji(avatarSlug: string | null | undefined): string {
  return AVATAR_OPTIONS.find((option) => option.slug === avatarSlug)?.emoji ?? "⭐";
}
