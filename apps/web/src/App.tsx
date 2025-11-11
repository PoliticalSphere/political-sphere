/**
 * Main App Component
 * Handles routing between Login, Lobby, and Game screens
 */

import { useEffect, useState } from 'react';

import GameBoard from './components/GameBoard';
import { Lobby } from './components/Lobby';
import { Login } from './components/Login';
import { apiClient } from './utils/api-client';
import './App.css';

type Screen = 'login' | 'lobby' | 'game';

export function App() {
  const [screen, setScreen] = useState<Screen>('login');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    if (apiClient.isAuthenticated()) {
      setScreen('lobby');
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    setScreen('lobby');
  };

  const handleJoinGame = async (gameId: string) => {
    try {
      const result = await apiClient.getGame(gameId);
      setGame(result.game);
      setCurrentGameId(gameId);
      setScreen('game');
    } catch (error) {
      console.error('Failed to load game:', error);
      alert('Failed to load game');
    }
  };

  const handleLeaveGame = () => {
    setCurrentGameId(null);
    setGame(null);
    setScreen('lobby');
  };

  const handleProposalSubmit = async (proposal: any) => {
    if (!currentGameId) return;

    try {
      const result = await apiClient.sendAction(currentGameId, 'propose', {
        title: proposal.title,
        description: proposal.description,
        proposerId: 'current', // Will be set by backend
      });
      setGame(result.game);
    } catch (error) {
      console.error('Failed to submit proposal:', error);
      alert('Failed to submit proposal');
    }
  };

  const handleVote = async (action: any) => {
    if (!currentGameId) return;

    try {
      const result = await apiClient.sendAction(currentGameId, action.type, action.payload);
      setGame(result.game);
    } catch (error) {
      console.error('Failed to vote:', error);
      alert('Failed to vote');
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (screen === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (screen === 'lobby') {
    return <Lobby onJoinGame={handleJoinGame} />;
  }

  if (screen === 'game' && game) {
    return (
      <div className="app-game">
        <header className="game-header">
          <h1>{game.name}</h1>
          <button type="button" onClick={handleLeaveGame} className="btn-secondary">
            Leave Game
          </button>
        </header>
        <GameBoard
          gameId={currentGameId}
          proposals={game.proposals || []}
          onProposalSubmit={handleProposalSubmit}
          onVote={handleVote}
        />
      </div>
    );
  }

  return <div>Error: Invalid state</div>;
}
