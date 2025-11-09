/**
 * Game Lobby Component
 * Shows available games and allows creating/joining
 */

import { useEffect, useState } from "react";
import { apiClient } from "../utils/api-client";
import "./Lobby.css";

interface Game {
  id: string;
  name: string;
  status: string;
  players: Array<{ username: string }>;
  settings: { maxPlayers: number };
}

interface LobbyProps {
  onJoinGame: (gameId: string) => void;
}

export function Lobby({ onJoinGame }: LobbyProps) {
  const [games, setGames] = useState<Game[]>([]);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [gameName, setGameName] = useState("");

  const loadGames = async () => {
    try {
      setLoading(true);
      const [allGames, playerGames] = await Promise.all([
        apiClient.listGames(),
        apiClient.getMyGames(),
      ]);
      setGames(allGames.games);
      setMyGames(playerGames.games);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
    const interval = setInterval(loadGames, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await apiClient.createGame(gameName || "New Game");
      setGameName("");
      setShowCreate(false);
      onJoinGame(result.game.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    }
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      await apiClient.joinGame(gameId);
      onJoinGame(gameId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
    }
  };

  const handleLogout = () => {
    apiClient.logout();
  };

  if (loading && games.length === 0) {
    return <div className="lobby-loading">Loading games...</div>;
  }

  return (
    <div className="lobby-container">
      <header className="lobby-header">
        <h1>Political Sphere</h1>
        <button onClick={handleLogout} className="btn-secondary">
          Logout
        </button>
      </header>

      {error && (
        <div role="alert" className="error">
          {error}
        </div>
      )}

      <div className="lobby-content">
        <section className="lobby-section">
          <div className="section-header">
            <h2>My Games</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
              {showCreate ? "Cancel" : "Create Game"}
            </button>
          </div>

          {showCreate && (
            <form onSubmit={handleCreateGame} className="create-game-form">
              <input
                type="text"
                placeholder="Game name"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="form-input"
                autoFocus
              />
              <button type="submit" className="btn-primary">
                Create
              </button>
            </form>
          )}

          {myGames.length === 0 ? (
            <p className="empty-state">You haven't joined any games yet.</p>
          ) : (
            <div className="game-list">
              {myGames.map((game) => (
                <div key={game.id} className="game-card my-game">
                  <h3>{game.name}</h3>
                  <p>
                    Players: {game.players.length}/{game.settings.maxPlayers}
                  </p>
                  <p className="game-status">Status: {game.status}</p>
                  <button onClick={() => onJoinGame(game.id)} className="btn-primary">
                    {game.status === "waiting" ? "Enter Lobby" : "Resume Game"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="lobby-section">
          <h2>Available Games</h2>
          {games.length === 0 ? (
            <p className="empty-state">No games available. Create one to get started!</p>
          ) : (
            <div className="game-list">
              {games
                .filter((game) => game.status === "waiting")
                .map((game) => (
                  <div key={game.id} className="game-card">
                    <h3>{game.name}</h3>
                    <p>
                      Players: {game.players.length}/{game.settings.maxPlayers}
                    </p>
                    <button onClick={() => handleJoinGame(game.id)} className="btn-primary">
                      Join Game
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
