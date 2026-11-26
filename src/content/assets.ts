export interface AssetEntry {
  id: string;
  label: string;
  expectedFilename: string;
  url: string;
  kind: 'logo' | 'game-icon' | 'screenshot' | 'og-image' | 'illustration';
  fallbackKey: 'candygame-logo' | 'brain-challenge' | 'color-world' | 'generic-game';
}

/**
 * Central asset registry for CandyGame.
 */
export const STUDIO_ASSETS: Record<string, AssetEntry> = {
  logo: {
    id: 'studio-logo',
    label: 'CandyGame Studio Logo',
    expectedFilename: 'Candy_Team_Game_Studio_Logo_c7b30204.webp',
    url: './assets/aistudio/Candy_Team_Game_Studio_Logo_c7b30204.webp',
    kind: 'logo',
    fallbackKey: 'candygame-logo',
  },
  brainChallengeIcon: {
    id: 'brain-challenge-icon',
    label: 'Brain Challenge Game Icon',
    expectedFilename: 'Kawaii_Brain_Puzzle_Icon-Photoroom_d3e2b289.png',
    url: './assets/aistudio/Kawaii_Brain_Puzzle_Icon-Photoroom_d3e2b289.png',
    kind: 'game-icon',
    fallbackKey: 'brain-challenge',
  },
  colorWorldIcon: {
    id: 'color-world-icon',
    label: 'Color World Game Icon',
    expectedFilename: 'gyf-Photoroom_3378e090.png',
    url: './assets/aistudio/gyf-Photoroom_3378e090.png',
    kind: 'game-icon',
    fallbackKey: 'color-world',
  },
  pillarErgonomics: {
    id: 'pillar-ergonomics',
    label: 'Tactile Mobile Ergonomics Illustration',
    expectedFilename: 'pillar_ergonomics_1795677108435.jpg',
    url: './src/assets/images/pillar_ergonomics_1795677108435.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  pillarVisualIdentity: {
    id: 'pillar-visual-identity',
    label: 'Expressive Visual Identity Illustration',
    expectedFilename: 'pillar_visual_identity_1795677109221.jpg',
    url: './src/assets/images/pillar_visual_identity_1795677109221.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  pillarReplayability: {
    id: 'pillar-replayability',
    label: 'Focused Replayability Illustration',
    expectedFilename: 'pillar_replayability_1795677109473.jpg',
    url: './src/assets/images/pillar_replayability_1795677109473.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutStudioStory: {
    id: 'about-studio-story',
    label: 'Our Studio Story Illustration',
    expectedFilename: 'about_studio_story_1795677109027.jpg',
    url: './src/assets/images/about_studio_story_1795677109027.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutMissionVision: {
    id: 'about-mission-vision',
    label: 'Mission Illustration',
    expectedFilename: 'about_mission_vision_1795677109801.jpg',
    url: './src/assets/images/about_mission_vision_1795677109801.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutVision: {
    id: 'about-vision',
    label: 'Vision Illustration',
    expectedFilename: 'about_vision_1795678955304.jpg',
    url: './src/assets/images/about_vision_1795678955304.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutValueClarity: {
    id: 'about-value-clarity',
    label: 'Player-First Clarity Illustration',
    expectedFilename: 'about_value_clarity_1795677110888.jpg',
    url: './src/assets/images/about_value_clarity_1795677110888.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutValueCraft: {
    id: 'about-value-craft',
    label: 'Creative Craftsmanship Illustration',
    expectedFilename: 'about_value_craft_1795677111493.jpg',
    url: './src/assets/images/about_value_craft_1795677111493.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
  aboutValueEngineering: {
    id: 'about-value-engineering',
    label: 'Dependable Engineering Illustration',
    expectedFilename: 'about_value_engineering_1795677112020.jpg',
    url: './src/assets/images/about_value_engineering_1795677112020.jpg',
    kind: 'illustration',
    fallbackKey: 'generic-game',
  },
};
