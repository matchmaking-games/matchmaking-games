import { z } from "zod";

export const statusProjetoSchema = z.enum(['em_andamento', 'concluido', 'pausado']);

export const engineProjetoSchema = z.enum([
  'unity', 'unreal', 'godot', 'gamemaker', 'construct', 'rpg_maker',
  'defold', 'cocos', 'pygame', 'custom', 'renpy', 'heaps', 'bevy',
  'flax', 'cryengine', 'source_2', 'gdevelop', 'solar2d', 'bitsy',
  'pico_8', 'adventure_game_studio', 'openfl', 'monogame', 'stride', 'outro',
]);

export const plataformaProjetoSchema = z.enum([
  'pc_windows', 'pc_linux', 'pc_macos', 'mobile_android', 'mobile_ios',
  'console_playstation_4', 'console_playstation_5', 'console_xbox_one',
  'console_xbox_series', 'console_nintendo_switch', 'web_browser',
  'vr_meta_quest', 'vr_steamvr', 'vr_psvr', 'ar_core', 'ar_kit',
  'arcade', 'cloud_gaming', 'handheld_retro', 'outro',
]);

export const generoProjetoSchema = z.enum([
  'acao', 'aventura', 'rpg', 'estrategia', 'simulacao', 'esportes',
  'corrida', 'puzzle', 'plataforma', 'terror', 'ficcao_cientifica',
  'casual', 'idle', 'tower_defense', 'battle_royale', 'mmo',
  'visual_novel', 'metroidvania', 'roguelike', 'roguelite', 'soulslike',
  'sandbox', 'sobrevivencia', 'musical', 'luta', 'tiro_fps', 'tiro_tps',
  'card_game', 'party_game', 'educativo', 'hack_and_slash', 'stealth',
  'point_and_click', 'walking_simulator', 'bullet_hell', 'shoot_em_up',
  'beat_em_up', 'jrpg', 'wrpg', 'tactical_rpg', 'dungeon_crawler',
  'arpg', 'rts', 'tbs', 'grand_strategy', '4x', 'auto_battler',
  'tycoon', 'life_sim', 'farming_sim', 'god_game', 'immersive_sim',
  'survivors_like', 'hidden_object', 'social_deduction', 'trivia',
  'pinball', 'ritmo', 'fmv', 'terror_psicologico', 'survival_horror',
  'moba', 'clicker', 'deckbuilder', 'metajogo', 'noir', 'fantasia',
  'cyberpunk', 'steampunk', 'outro',
]);
