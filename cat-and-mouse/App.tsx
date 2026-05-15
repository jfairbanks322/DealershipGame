import React, { useEffect, useState } from "react";
import { Platform, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { FolderCard, Meter, NoirButton, Tag } from "./src/components/Noir";
import {
  applyDetectiveActions,
  applyMurdererChoices,
  createNewGame,
  getDetectiveActionCards,
  getMurdererDecisionCards,
  scoreFinalAccusation
} from "./src/game/gameEngine";
import { entryMethods, motives, relationships, weaponMethods } from "./src/game/gameData";
import { DetectiveAction, FinalAccusation, GameState, MurdererChoice, PlayerRole } from "./src/game/types";
import { createRemoteGame, fetchRemoteGame, updateRemoteGame } from "./src/storage/multiplayerClient";
import {
  clearGame,
  clearMultiplayerSession,
  loadGame,
  loadMultiplayerSession,
  MultiplayerSession,
  saveGame,
  saveMultiplayerSession
} from "./src/storage/gameStorage";
import { colors, spacing } from "./src/theme/theme";

type ScreenProps = {
  game: GameState;
  setGame: (game: GameState) => void;
  session: MultiplayerSession | null;
};

const getDefaultServerUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return window.location.origin;
  }

  return "http://localhost:8787";
};

const getInitialCaseCode = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return new URLSearchParams(window.location.search).get("case") ?? "";
  }

  return "";
};

const getJoinLink = (caseCode: string) => {
  if (!caseCode || Platform.OS !== "web" || typeof window === "undefined") {
    return "";
  }

  return `${window.location.origin}?case=${encodeURIComponent(caseCode)}`;
};

export default function App() {
  const [game, setGameState] = useState<GameState | null>(null);
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [hasSave, setHasSave] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    Promise.all([loadGame(), loadMultiplayerSession()]).then(([stored, storedSession]) => {
      setGameState(stored);
      setSession(storedSession);
      setHasSave(Boolean(stored));
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!session) {
      return undefined;
    }

    const poll = async () => {
      try {
        const remoteGame = await fetchRemoteGame(session.serverUrl, session.caseCode);
        setGameState(remoteGame);
        setHasSave(true);
        setSyncMessage(`Synced case ${session.caseCode}`);
        void saveGame(remoteGame);
      } catch (error) {
        setSyncMessage(error instanceof Error ? error.message : "Sync failed");
      }
    };

    void poll();
    const interval = setInterval(poll, 2500);
    return () => clearInterval(interval);
  }, [session]);

  const setGame = (nextGame: GameState) => {
    setGameState(nextGame);
    setHasSave(true);
    void saveGame(nextGame);
    if (session) {
      void updateRemoteGame(session.serverUrl, session.caseCode, nextGame)
        .then(() => setSyncMessage(`Synced case ${session.caseCode}`))
        .catch((error) => setSyncMessage(error instanceof Error ? error.message : "Sync failed"));
    }
  };

  const startNewGame = async () => {
    await clearMultiplayerSession();
    setSession(null);
    setGame(createNewGame());
  };
  const continueGame = async () => {
    const stored = await loadGame();
    if (stored) {
      setGameState(stored);
      setHasSave(true);
    }
  };

  const resetGame = async () => {
    await clearGame();
    await clearMultiplayerSession();
    setSession(null);
    setHasSave(false);
    setGameState(null);
  };

  const hostMultiplayerGame = async (serverUrl: string) => {
    const nextGame = createNewGame();
    const remote = await createRemoteGame(serverUrl, nextGame);
    const nextSession: MultiplayerSession = {
      serverUrl,
      caseCode: remote.caseCode,
      role: "murderer"
    };
    setSession(nextSession);
    setGameState(remote.game);
    setHasSave(true);
    setSyncMessage(`Created case ${remote.caseCode}`);
    await saveGame(remote.game);
    await saveMultiplayerSession(nextSession);
  };

  const joinMultiplayerGame = async (serverUrl: string, caseCode: string) => {
    const remoteGame = await fetchRemoteGame(serverUrl, caseCode);
    const nextSession: MultiplayerSession = {
      serverUrl,
      caseCode: caseCode.trim().toUpperCase(),
      role: "detective"
    };
    setSession(nextSession);
    setGameState(remoteGame);
    setHasSave(true);
    setSyncMessage(`Joined case ${nextSession.caseCode}`);
    await saveGame(remoteGame);
    await saveMultiplayerSession(nextSession);
  };

  if (!hydrated) {
    return (
      <AppFrame>
        <Text style={styles.title}>Cat and Mouse</Text>
        <Text style={styles.copy}>Opening the case file...</Text>
      </AppFrame>
    );
  }

  if (!game) {
    return (
      <AppFrame>
        <HomeScreen
          onNewGame={startNewGame}
          onContinue={continueGame}
          hasSave={hasSave}
          onHostMultiplayer={hostMultiplayerGame}
          onJoinMultiplayer={joinMultiplayerGame}
          syncMessage={syncMessage}
        />
      </AppFrame>
    );
  }

  const isWaitingForOtherPlayer = session && game.phase !== "results" && game.currentRole !== session.role;

  return (
    <AppFrame>
      {session ? <SyncBanner session={session} message={syncMessage} /> : null}
      {isWaitingForOtherPlayer ? <WaitingScreen game={game} session={session} onLeave={resetGame} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "roleAssignment" ? <RoleAssignmentScreen game={game} setGame={setGame} session={session} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "passDevice" ? <PassDeviceScreen game={game} setGame={setGame} session={session} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "murdererTurn" ? <MurdererTurnScreen game={game} setGame={setGame} session={session} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "detectiveTurn" ? <DetectiveTurnScreen game={game} setGame={setGame} session={session} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "caseFile" ? <CaseFileScreen game={game} setGame={setGame} session={session} /> : null}
      {!isWaitingForOtherPlayer && game.phase === "finalAccusation" ? <FinalAccusationScreen game={game} setGame={setGame} session={session} /> : null}
      {game.phase === "results" ? <ResultsScreen game={game} onReset={resetGame} /> : null}
    </AppFrame>
  );
}

function AppFrame({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="light" />
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.screen}>{children}</ScrollView>
    </SafeAreaView>
  );
}

function HomeScreen({
  onNewGame,
  onContinue,
  hasSave,
  onHostMultiplayer,
  onJoinMultiplayer,
  syncMessage
}: {
  onNewGame: () => void;
  onContinue: () => void;
  hasSave: boolean;
  onHostMultiplayer: (serverUrl: string) => Promise<void>;
  onJoinMultiplayer: (serverUrl: string, caseCode: string) => Promise<void>;
  syncMessage: string;
}) {
  const [serverUrl, setServerUrl] = useState(getDefaultServerUrl);
  const [caseCode, setCaseCode] = useState(getInitialCaseCode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Multiplayer action failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.stack}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Asynchronous Crime Board Strategy</Text>
        <Text style={styles.title}>Cat and Mouse</Text>
        <Text style={styles.copy}>
          One player builds the cover. One player tears at the edges. Every clue costs time, and every lie leaves a shape.
        </Text>
      </View>
      <View style={styles.redString} />
      <FolderCard title="Current Case" eyebrow="Local pass-and-play">
        <Text style={styles.copy}>
          Pass the device between private turns. The Murderer sees relationship and motive. The Detective sees only the case file.
        </Text>
      </FolderCard>
      <NoirButton label="New Game" onPress={onNewGame} />
      <NoirButton label="Continue Game" onPress={onContinue} variant="secondary" disabled={!hasSave} />
      <FolderCard title="LAN Multiplayer Test" eyebrow="Two devices">
        <Text style={styles.copy}>
          For Railway, leave the server URL as this site address. Host as Murderer, then send the case link or code to the Detective.
        </Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          value={serverUrl}
          onChangeText={setServerUrl}
          placeholder="http://192.168.1.25:8787"
          placeholderTextColor={colors.inkDim}
          style={styles.input}
        />
        <View style={styles.optionList}>
          <NoirButton label={busy ? "Working..." : "Host as Murderer"} disabled={busy} onPress={() => void run(() => onHostMultiplayer(serverUrl))} />
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            value={caseCode}
            onChangeText={setCaseCode}
            placeholder="CASE CODE"
            placeholderTextColor={colors.inkDim}
            style={styles.input}
          />
          <NoirButton
            label="Join as Detective"
            variant="secondary"
            disabled={busy || !caseCode.trim()}
            onPress={() => void run(() => onJoinMultiplayer(serverUrl, caseCode))}
          />
        </View>
        {syncMessage ? <Text style={styles.notice}>{syncMessage}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </FolderCard>
    </View>
  );
}

function RoleAssignmentScreen({ game, setGame }: ScreenProps) {
  const isMurderer = game.currentRole === "murderer";
  const beginTurn = () => setGame({ ...game, phase: isMurderer ? "murdererTurn" : "detectiveTurn" });

  return (
    <View style={styles.stack}>
      <Header game={game} title="Role Assignment" />
      <FolderCard title={isMurderer ? "You are the Murderer" : "You are the Detective"} eyebrow="Private reveal">
        {isMurderer ? (
          <>
            <Text style={styles.copy}>Protect your cover story, but remember: evidence can be managed, never erased.</Text>
            <View style={styles.rowWrap}>
              <Tag label={`Relationship: ${game.murdererRelationship}`} />
              <Tag label={`Motive: ${game.murdererMotive}`} />
            </View>
          </>
        ) : (
          <Text style={styles.copy}>
            The victim was found in a locked-up home with a story that feels too arranged. Build the case with limited actions and
            avoid chasing every shadow.
          </Text>
        )}
      </FolderCard>
      <NoirButton label={isMurderer ? "Plan the Cover" : "Start Investigation"} onPress={beginTurn} />
    </View>
  );
}

function PassDeviceScreen({ game, setGame }: ScreenProps) {
  const nextRole = game.currentRole;
  const nextPhase = nextRole === "murderer" ? "roleAssignment" : "detectiveTurn";
  return (
    <View style={styles.stack}>
      <Header game={game} title="Pass Device" />
      <FolderCard title={`Hand the phone to the ${roleLabel(nextRole)}`} eyebrow="Private information hidden">
        <Text style={styles.copy}>
          The previous player should stop reading here. The next screen contains information for the {roleLabel(nextRole)} only.
        </Text>
      </FolderCard>
      <NoirButton label={`I am the ${roleLabel(nextRole)}`} onPress={() => setGame({ ...game, phase: nextPhase })} />
      <NoirButton label="Open Case File" variant="quiet" onPress={() => setGame({ ...game, phase: "caseFile" })} />
    </View>
  );
}

function MurdererTurnScreen({ game, setGame, session }: ScreenProps) {
  const cards = getMurdererDecisionCards();
  const [selected, setSelected] = useState<Record<string, MurdererChoice>>({});
  const selectedChoices = Object.values(selected);
  const hasEntry = selectedChoices.some((choice) => choice.category === "entry");
  const hasMethod = selectedChoices.some((choice) => choice.category === "method");
  const canSubmit = selectedChoices.length >= 3 && hasEntry && hasMethod;

  const submit = () => {
    // SUPABASE_SYNC_POINT: persist this turn as immutable round input, then broadcast detective turn readiness.
    const nextGame = applyMurdererChoices(game, selectedChoices);
    setGame(session ? { ...nextGame, phase: "detectiveTurn" } : nextGame);
  };

  return (
    <View style={styles.stack}>
      <Header game={game} title="Murderer Turn" />
      <FolderCard title="Build the Cover" eyebrow="Choose 3-4 decisions">
        <Text style={styles.copy}>Each choice helps one part of the cover while leaving pressure somewhere else.</Text>
        <Text style={styles.notice}>Entry and method are required. Choose up to two more cover decisions.</Text>
      </FolderCard>
      {cards.map((card) => (
        <FolderCard key={card.id} title={card.title}>
          <View style={styles.optionList}>
            {card.choices.map((choice) => {
              const active = selected[card.id]?.id === choice.id;
              return (
                <ChoiceButton
                  key={choice.id}
                  active={active}
                  label={choice.label}
                  description={`${choice.description} Tradeoff: ${choice.tradeoff}`}
                  onPress={() => {
                    const next = { ...selected };
                    if (active) {
                      delete next[card.id];
                    } else if (Object.keys(next).length < 4 || next[card.id]) {
                      next[card.id] = choice;
                    }
                    setSelected(next);
                  }}
                />
              );
            })}
          </View>
        </FolderCard>
      ))}
      <NoirButton label={`Submit Cover (${selectedChoices.length}/4)`} onPress={submit} disabled={!canSubmit} />
    </View>
  );
}

function DetectiveTurnScreen({ game, setGame, session }: ScreenProps) {
  const cards = getDetectiveActionCards();
  const [selected, setSelected] = useState<Record<string, DetectiveAction>>({});
  const [lastRevealCount, setLastRevealCount] = useState<number | null>(null);
  const selectedActions = Object.values(selected);
  const canSubmit = selectedActions.length >= 3;

  const submit = () => {
    // SUPABASE_SYNC_POINT: sync detective actions, revealed clues, and public meters to the shared game row.
    const nextGame = applyDetectiveActions(game, selectedActions);
    setLastRevealCount(nextGame.discoveredClues.length - game.discoveredClues.length);
    setGame(nextGame.phase === "finalAccusation" ? nextGame : { ...nextGame, phase: session ? "murdererTurn" : "caseFile" });
  };

  return (
    <View style={styles.stack}>
      <Header game={game} title="Detective Turn" />
      <FolderCard title="Limited Investigation" eyebrow="Choose 3-4 actions">
        <Text style={styles.copy}>You cannot inspect everything. Pick a theory, pressure it, and live with what you left behind.</Text>
        {lastRevealCount !== null ? <Text style={styles.notice}>{lastRevealCount} new clue(s) added to the file.</Text> : null}
      </FolderCard>
      {cards.map((card) => (
        <FolderCard key={card.id} title={card.title}>
          <View style={styles.optionList}>
            {card.actions.map((action) => {
              const active = selected[action.id]?.id === action.id;
              return (
                <ChoiceButton
                  key={action.id}
                  active={active}
                  label={action.label}
                  description={action.description}
                  onPress={() => {
                    const next = { ...selected };
                    if (active) {
                      delete next[action.id];
                    } else if (Object.keys(next).length < 4) {
                      next[action.id] = action;
                    }
                    setSelected(next);
                  }}
                />
              );
            })}
          </View>
        </FolderCard>
      ))}
      <NoirButton label={`Submit Actions (${selectedActions.length}/4)`} onPress={submit} disabled={!canSubmit} />
      <NoirButton label="Open Case File" variant="quiet" onPress={() => setGame({ ...game, phase: "caseFile" })} />
    </View>
  );
}

function CaseFileScreen({ game, setGame, session }: ScreenProps) {
  const returnLabel = session
    ? game.currentRole === session.role
      ? `Return to ${roleLabel(session.role)} Turn`
      : "Back to Waiting"
    : game.currentRole === "murderer"
      ? "Pass to Murderer"
      : "Return to Detective";
  const returnPhase = session
    ? game.currentRole === "murderer"
      ? "murdererTurn"
      : "detectiveTurn"
    : game.currentRole === "murderer"
      ? "passDevice"
      : "detectiveTurn";
  return (
    <View style={styles.stack}>
      <Header game={game} title="Case File" />
      <FolderCard title="Public Board" eyebrow="Known information only">
        <View style={styles.meterStack}>
          <Meter label="Suspicion" value={game.suspicionMeter} />
          <Meter label="Timeline Confidence" value={game.timelineConfidence} tone="blue" />
        </View>
      </FolderCard>
      <FolderCard title="Relationship Possibilities">
        <View style={styles.rowWrap}>{game.relationshipPossibilities.map((item) => <Tag key={item} label={item} />)}</View>
      </FolderCard>
      <FolderCard title="Discovered Clues" eyebrow={`${game.discoveredClues.length} filed`}>
        {game.discoveredClues.length ? (
          <View style={styles.optionList}>
            {game.discoveredClues.map((clue) => (
              <View key={clue.id} style={styles.clue}>
                <Text style={styles.clueKind}>{clue.kind}</Text>
                <Text style={styles.optionTitle}>{clue.title}</Text>
                <Text style={styles.optionBody}>{clue.body}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.copy}>No clues discovered yet. The board is waiting for its first pin.</Text>
        )}
      </FolderCard>
      {game.roundNumber >= game.maxRounds && game.currentRole === "detective" ? (
        <NoirButton label="Make Final Accusation" onPress={() => setGame({ ...game, phase: "finalAccusation" })} />
      ) : (
        <NoirButton label={returnLabel} onPress={() => setGame({ ...game, phase: returnPhase })} />
      )}
    </View>
  );
}

function FinalAccusationScreen({ game, setGame }: ScreenProps) {
  const [accusation, setAccusation] = useState<FinalAccusation>({
    relationship: "",
    motive: "",
    entryMethod: "",
    weaponMethod: ""
  });

  const complete = Boolean(accusation.relationship && accusation.motive && accusation.entryMethod && accusation.weaponMethod);

  return (
    <View style={styles.stack}>
      <Header game={game} title="Final Accusation" />
      <FolderCard title="Name the Theory" eyebrow="Accuracy plus evidence decides the outcome">
        <Text style={styles.copy}>Select the relationship, motive, entry method, and weapon or method. A strong case can still earn a partial solve.</Text>
      </FolderCard>
      <PickerGroup title="Relationship" options={relationships} value={accusation.relationship} onPick={(relationship) => setAccusation({ ...accusation, relationship })} />
      <PickerGroup title="Motive" options={motives} value={accusation.motive} onPick={(motive) => setAccusation({ ...accusation, motive })} />
      <PickerGroup title="Entry Method" options={entryMethods} value={accusation.entryMethod} onPick={(entryMethod) => setAccusation({ ...accusation, entryMethod })} />
      <PickerGroup title="Weapon or Method" options={weaponMethods} value={accusation.weaponMethod} onPick={(weaponMethod) => setAccusation({ ...accusation, weaponMethod })} />
      <NoirButton label="Submit Accusation" disabled={!complete} onPress={() => setGame(scoreFinalAccusation(game, accusation))} />
    </View>
  );
}

function ResultsScreen({ game, onReset }: { game: GameState; onReset: () => void }) {
  const result = game.result;
  if (!result) {
    return null;
  }

  return (
    <View style={styles.stack}>
      <Header game={game} title="Results" />
      <FolderCard title={resultTitle(result.outcome)} eyebrow={`Case score ${result.score}/100`}>
        <Text style={styles.copy}>{result.summary}</Text>
      </FolderCard>
      <FolderCard title="What Happened">
        <View style={styles.optionList}>
          <Text style={styles.copy}>Relationship: {game.murdererRelationship}</Text>
          <Text style={styles.copy}>Motive: {game.murdererMotive}</Text>
          <Text style={styles.copy}>Entry: {game.entryMethod}</Text>
          <Text style={styles.copy}>Method: {game.weaponMethod}</Text>
        </View>
      </FolderCard>
      <FolderCard title="Strategic Recap">
        {result.recap.map((item) => (
          <Text key={item} style={styles.copy}>- {item}</Text>
        ))}
      </FolderCard>
      <FolderCard title="Key Missed Clues">
        {result.missedClues.map((clue) => (
          <View key={clue.id} style={styles.clue}>
            <Text style={styles.optionTitle}>{clue.title}</Text>
            <Text style={styles.optionBody}>{clue.missedReason ?? clue.body}</Text>
          </View>
        ))}
      </FolderCard>
      <NoirButton label="Start New Case" onPress={onReset} />
    </View>
  );
}

function SyncBanner({ session, message }: { session: MultiplayerSession; message: string }) {
  const joinLink = getJoinLink(session.caseCode);

  return (
    <FolderCard title={`Case ${session.caseCode}`} eyebrow="LAN multiplayer">
      <View style={styles.rowWrap}>
        <Tag label={`You: ${roleLabel(session.role)}`} />
        <Tag label={session.serverUrl} />
      </View>
      {joinLink ? <Text style={styles.copy}>Detective join link: {joinLink}</Text> : null}
      {message ? <Text style={styles.notice}>{message}</Text> : null}
    </FolderCard>
  );
}

function WaitingScreen({ game, session, onLeave }: { game: GameState; session: MultiplayerSession; onLeave: () => void }) {
  return (
    <View style={styles.stack}>
      <Header game={game} title="Waiting" />
      <FolderCard title={`Waiting for the ${roleLabel(game.currentRole)}`} eyebrow={`You are the ${roleLabel(session.role)}`}>
        <Text style={styles.copy}>
          This device will update automatically when the other player submits their turn. You can keep the public case file visible while
          you wait.
        </Text>
      </FolderCard>
      <FolderCard title="Public Board" eyebrow="Safe to view">
        <View style={styles.meterStack}>
          <Meter label="Suspicion" value={game.suspicionMeter} />
          <Meter label="Timeline Confidence" value={game.timelineConfidence} tone="blue" />
        </View>
      </FolderCard>
      <FolderCard title="Latest Clues" eyebrow={`${game.discoveredClues.length} filed`}>
        {game.discoveredClues.length ? (
          <View style={styles.optionList}>
            {game.discoveredClues.slice(-3).map((clue) => (
              <View key={clue.id} style={styles.clue}>
                <Text style={styles.clueKind}>{clue.kind}</Text>
                <Text style={styles.optionTitle}>{clue.title}</Text>
                <Text style={styles.optionBody}>{clue.body}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.copy}>No public clues have been discovered yet.</Text>
        )}
      </FolderCard>
      <NoirButton label="Leave Multiplayer Case" variant="quiet" onPress={onLeave} />
    </View>
  );
}

function PickerGroup<T extends string>({
  title,
  options,
  value,
  onPick
}: {
  title: string;
  options: T[];
  value: T | "";
  onPick: (value: T) => void;
}) {
  return (
    <FolderCard title={title}>
      <View style={styles.rowWrap}>
        {options.map((option) => (
          <NoirButton key={option} label={option} variant={value === option ? "primary" : "quiet"} onPress={() => onPick(option)} />
        ))}
      </View>
    </FolderCard>
  );
}

function ChoiceButton({ active, label, description, onPress }: { active: boolean; label: string; description: string; onPress: () => void }) {
  return (
    <View style={[styles.option, active && styles.optionActive]}>
      <NoirButton label={label} variant={active ? "primary" : "secondary"} onPress={onPress} />
      <Text style={styles.optionBody}>{description}</Text>
    </View>
  );
}

function Header({ game, title }: { game: GameState; title: string }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.kicker}>Round {game.roundNumber} of {game.maxRounds}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <Text style={styles.rolePill}>{roleLabel(game.currentRole)}</Text>
    </View>
  );
}

function roleLabel(role: PlayerRole) {
  return role === "murderer" ? "Murderer" : "Detective";
}

function resultTitle(outcome: string) {
  if (outcome === "detective-win") {
    return "Detective Win";
  }
  if (outcome === "partial-solve") {
    return "Partial Solve";
  }
  return "Murderer Win";
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
    backgroundColor: colors.background,
    minHeight: "100%",
    gap: spacing.lg
  },
  stack: {
    gap: spacing.lg
  },
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.xl
  },
  kicker: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
    textTransform: "uppercase"
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: "900",
    lineHeight: 46
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  headerTitle: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: "900"
  },
  rolePill: {
    color: colors.ink,
    backgroundColor: colors.redDark,
    borderColor: colors.lineStrong,
    borderWidth: 1,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 7,
    fontSize: 12,
    fontWeight: "900"
  },
  copy: {
    color: colors.inkMuted,
    fontSize: 15,
    lineHeight: 22
  },
  notice: {
    color: colors.green,
    fontSize: 14,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  error: {
    color: colors.red,
    fontSize: 14,
    fontWeight: "800",
    marginTop: spacing.sm
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.board,
    color: colors.ink,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    marginTop: spacing.sm
  },
  redString: {
    height: 2,
    backgroundColor: colors.red,
    transform: [{ rotate: "-2deg" }],
    opacity: 0.8
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  optionList: {
    gap: spacing.sm
  },
  option: {
    gap: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.card,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 8
  },
  optionActive: {
    borderColor: colors.lineStrong,
    backgroundColor: "#281a1d"
  },
  optionTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900"
  },
  optionBody: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 19
  },
  clue: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomColor: colors.line,
    borderBottomWidth: 1
  },
  clueKind: {
    color: colors.amber,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  meterStack: {
    gap: spacing.md
  }
});
