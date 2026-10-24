/**
 * Curated Enterprise Avatar Color Generator
 * 
 * Generates harmonic, deterministic gradient backgrounds and high-contrast
 * text colors for user avatars based on name or ID, emulating Linear/Slack.
 */

const PALETTES = [
  {
    bg: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
    color: '#ffffff',
    border: 'rgba(99, 102, 241, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #059669 0%, #065f46 100%)',
    color: '#ffffff',
    border: 'rgba(16, 185, 129, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    color: '#ffffff',
    border: 'rgba(14, 165, 233, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
    color: '#ffffff',
    border: 'rgba(139, 92, 246, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #e11d48 0%, #9f1239 100%)',
    color: '#ffffff',
    border: 'rgba(244, 63, 94, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
    color: '#ffffff',
    border: 'rgba(245, 158, 11, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #0d9488 0%, #115e59 100%)',
    color: '#ffffff',
    border: 'rgba(20, 184, 166, 0.4)',
  },
  {
    bg: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
    color: '#ffffff',
    border: 'rgba(100, 116, 139, 0.4)',
  },
];

export function getAvatarStyle(firstName = '', lastName = '', id = 0) {
  const seed = `${firstName} ${lastName} ${id}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % PALETTES.length;
  const palette = PALETTES[index];

  return {
    background: palette.bg,
    color: palette.color,
    border: `1px solid ${palette.border}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  };
}
