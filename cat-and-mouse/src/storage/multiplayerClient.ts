import { GameState } from "../game/types";

export type RemoteGameResponse = {
  caseCode: string;
  game: GameState;
};

const cleanUrl = (serverUrl: string) => serverUrl.replace(/\/+$/, "");

export async function createRemoteGame(serverUrl: string, game: GameState): Promise<RemoteGameResponse> {
  const response = await fetch(`${cleanUrl(serverUrl)}/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game })
  });

  if (!response.ok) {
    throw new Error(`Could not create game (${response.status})`);
  }

  return (await response.json()) as RemoteGameResponse;
}

export async function fetchRemoteGame(serverUrl: string, caseCode: string): Promise<GameState> {
  const response = await fetch(`${cleanUrl(serverUrl)}/games/${caseCode.trim().toUpperCase()}`);

  if (!response.ok) {
    throw new Error(`Could not load case ${caseCode}`);
  }

  const payload = (await response.json()) as RemoteGameResponse;
  return payload.game;
}

export async function updateRemoteGame(serverUrl: string, caseCode: string, game: GameState): Promise<GameState> {
  const response = await fetch(`${cleanUrl(serverUrl)}/games/${caseCode.trim().toUpperCase()}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ game })
  });

  if (!response.ok) {
    throw new Error(`Could not sync case ${caseCode}`);
  }

  const payload = (await response.json()) as RemoteGameResponse;
  return payload.game;
}
