import AsyncStorage from "@react-native-async-storage/async-storage";
import { PlayerRole } from "../game/types";
import { GameState } from "../game/types";

const STORAGE_KEY = "cat-and-mouse.current-game";
const SESSION_KEY = "cat-and-mouse.multiplayer-session";

export type MultiplayerSession = {
  serverUrl: string;
  caseCode: string;
  role: PlayerRole;
};

export async function saveGame(game: GameState) {
  // SUPABASE_SYNC_POINT: replace or pair this local write with an upsert to a games table.
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(game));
}

export async function loadGame(): Promise<GameState | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as GameState) : null;
}

export async function clearGame() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export async function saveMultiplayerSession(session: MultiplayerSession) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export async function loadMultiplayerSession(): Promise<MultiplayerSession | null> {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as MultiplayerSession) : null;
}

export async function clearMultiplayerSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}
