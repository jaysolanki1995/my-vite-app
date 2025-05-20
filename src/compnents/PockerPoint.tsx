import React, { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'poker-point-tracker-state';

interface Player {
  id: number;
  name: string;
  totalPoints: number;
}

interface Bets {
  [key: number]: number;
}

interface RoundHistoryEntry {
  round: number;
  bets: Bets;
  winnerId: number | null;
  cardOpened: number[];
}

export default function PokerPointTracker() {
  const [numPlayers, setNumPlayers] = useState<string>('');
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [setupCompleted, setSetupCompleted] = useState<boolean>(false);
  const [round, setRound] = useState<number>(1);
  const [bets, setBets] = useState<Bets>({});
  const [roundHistory, setRoundHistory] = useState<RoundHistoryEntry[]>([]);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [cardOpened, setCardOpened] = useState<number[]>([]);
  const [bettingStage, setBettingStage] = useState<number>(0); // 0: Pre-betting, 1: After 3 cards, 2: After 4th card, 3: After 5th card

  // Load saved state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedState) {
      try {
        const {
          numPlayers: savedNumPlayers,
          playerNames: savedPlayerNames,
          players: savedPlayers,
          setupCompleted: savedSetupCompleted,
          round: savedRound,
          bets: savedBets,
          roundHistory: savedRoundHistory,
          winnerId: savedWinnerId,
          cardOpened: savedCardOpened,
          bettingStage: savedBettingStage,
        } = JSON.parse(savedState);

        if (savedNumPlayers) setNumPlayers(savedNumPlayers);
        if (savedPlayerNames) setPlayerNames(savedPlayerNames);
        if (savedPlayers) setPlayers(savedPlayers);
        setSetupCompleted(!!savedSetupCompleted);
        if (savedRound) setRound(savedRound);
        if (savedBets) setBets(savedBets);
        if (savedRoundHistory) setRoundHistory(savedRoundHistory);
        if (savedWinnerId) setWinnerId(savedWinnerId);
        if (savedCardOpened) setCardOpened(savedCardOpened);
        if (savedBettingStage !== undefined) setBettingStage(savedBettingStage);
      } catch (err) {
        console.warn('Failed to load saved game state from localStorage:', err);
      }
    }
  }, []);

  // Save state to localStorage whenever relevant pieces update
  useEffect(() => {
    const stateToSave = {
      numPlayers,
      playerNames,
      players,
      setupCompleted,
      round,
      bets,
      roundHistory,
      winnerId,
      cardOpened,
      bettingStage,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
  }, [
    numPlayers,
    playerNames,
    players,
    setupCompleted,
    round,
    bets,
    roundHistory,
    winnerId,
    cardOpened,
    bettingStage,
  ]);

  const handleNumPlayersSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const n = parseInt(numPlayers, 10);
    if (isNaN(n) || n < 2) {
      alert('Please enter a valid number of players (at least 2).');
      return;
    }
    setPlayerNames(Array(n).fill(''));
  };

  const handleNameChange = (index: number, value: string) => {
    setPlayerNames(prevNames => {
      const copy = [...prevNames];
      copy[index] = value;
      return copy;
    });
  };

  const startGame = () => {
    const finalPlayers = playerNames.map((name, i) => ({
      id: i + 1,
      name: name.trim() === '' ? `Player ${i + 1}` : name.trim(),
      totalPoints: 1000,
    }));
    setPlayers(finalPlayers);
    setBets(finalPlayers.reduce((acc, p) => {
      acc[p.id] = 0; // Initial bet is 0
      return acc;
    }, {} as Bets));
    setSetupCompleted(true);
  };

  const handleBetChange = (playerId: number, amount: number) => {
    setBets(prev => {
      const newAmount = Math.max(0, prev[playerId] + amount);
      // Prevent betting more than player's totalPoints
      const player = players.find(p => p.id === playerId);
      if (player && newAmount > player.totalPoints) return prev;
      return { ...prev, [playerId]: newAmount };
    });
  };

  const canOpenCards = () => {
    if (bettingStage === 0) {
      // For first opening (flop), require all bets equal (legacy rule)
      const betValues = Object.values(bets);
      return betValues.length > 0 && betValues.every(bet => bet === betValues[0]);
    }
    // For subsequent openings (turn & river), no bet equality required
    return true;
  };

  const openCards = () => {
    if (!canOpenCards()) {
      alert('For first round, all bets must be equal to open the cards.');
      return;
    }
    if (bettingStage === 0) {
      setCardOpened([1, 2, 3]); // Open first 3 cards (flop)
      setBettingStage(1);
    } else if (bettingStage === 1) {
      setCardOpened(prev => [...prev, 4]); // Open 4th card (turn)
      setBettingStage(2);
    } else if (bettingStage === 2) {
      setCardOpened(prev => [...prev, 5]); // Open 5th card (river)
      setBettingStage(3);
    }
  };

  const finalizeRound = () => {
    if (!winnerId) {
      alert('Please select a winner before finalizing the round.');
      return;
    }
    // Calculate total bet excluding the winner's own bet
    const totalBet = Object.entries(bets).reduce((sum, [playerId, bet]) => {
      return parseInt(playerId, 10) === winnerId ? sum : sum + bet;
    }, 0);

    setPlayers(oldPlayers =>
      oldPlayers.map(p => {
        if (p.id === winnerId) {
          return { ...p, totalPoints: p.totalPoints + totalBet };
        } else {
          return { ...p, totalPoints: p.totalPoints - (bets[p.id] || 0) };
        }
      })
    );
    setRoundHistory(prev => [
      ...prev,
      {
        round,
        bets: { ...bets },
        winnerId,
        cardOpened: [...cardOpened],
      },
    ]);
    setRound(r => r + 1);
    setWinnerId(null);
    setBets(players.reduce((acc, p) => {
      acc[p.id] = 0; // Reset bets for the next round
      return acc;
    }, {} as Bets));
    setCardOpened([]);
    setBettingStage(0);
  };

  const clearStorageAndReset = () => {
    if (window.confirm('Are you sure you want to clear saved data and reset the game?')) {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      window.location.reload();
    }
  };

  if (!setupCompleted) {
    return (
      <div style={styles.container}>
        <h1 style={styles.title}>Poker Point Tracker Setup</h1>
        {!playerNames.length ? (
          <form onSubmit={handleNumPlayersSubmit} style={styles.form}>
            <label>
              Enter number of players (2 or more):
              <input
                type="number"
                min="2"
                value={numPlayers}
                onChange={e => setNumPlayers(e.target.value)}
                style={styles.input}
                required
              />
            </label>
            <button type="submit" style={styles.button}>
              Next
            </button>
            <button type="button" onClick={clearStorageAndReset} style={{ ...styles.button, marginTop: 10 }}>
              Clear Saved Data & Reset
            </button>
          </form>
        ) : (
          <form
            onSubmit={e => {
              e.preventDefault();
              startGame();
            }}
            style={styles.form}
          >
            <p>Enter player names:</p>
            {playerNames.map((_, index) => (
              <input
                key={index}
                type="text"
                placeholder={`Player ${index + 1} name`}
                value={playerNames[index]}
                onChange={e => handleNameChange(index, e.target.value)}
                style={styles.input}
                required
              />
            ))}
            <button type="submit" style={styles.button}>
              Start Game
            </button>
            <button type="button" onClick={clearStorageAndReset} style={{ ...styles.button, marginTop: 10 }}>
              Clear Saved Data & Reset
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Poker Point Tracking System</h1>
      <button
        type="button"
        onClick={clearStorageAndReset}
        style={{ ...styles.button, marginBottom: 15, width: 'auto' }}
      >
        Clear Saved Data & Reset
      </button>
      <div style={styles.infoRow}>
        <div>Round: {round}</div>
        <div>{cardOpened.length === 5 ? 'All cards opened!' : `Cards Opened: ${cardOpened.join(', ')}`}</div>
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th>Player</th>
            <th>Total Points</th>
            <th>Current Bet</th>
            <th>Adjust Bet</th>
            <th>Select Winner</th>
          </tr>
        </thead>
        <tbody>
          {players.map(player => (
            <tr key={player.id} style={winnerId === player.id ? styles.winnerRow : {}}>
              <td>{player.name}</td>
              <td>{player.totalPoints}</td>
              <td>{bets[player.id]}</td>
              <td>
                <button
                  style={styles.betButton}
                  onClick={() => handleBetChange(player.id, 100)}
                  disabled={player.totalPoints < (bets[player.id] || 0) + 100}
                >
                  +100
                </button>
                <button
                  style={styles.betButton}
                  onClick={() => handleBetChange(player.id, -100)}
                  disabled={(bets[player.id] || 0) <= 0}
                >
                  -100
                </button>
              </td>
              <td>
                <input
                  type="radio"
                  name="winner"
                  checked={winnerId === player.id}
                  onChange={() => setWinnerId(player.id)}
                  disabled={cardOpened.length < 5} // Winner can be selected only after all cards opened
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        style={styles.nextRoundButton}
        onClick={openCards}
      >
        Open Cards
      </button>
      {cardOpened.length === 5 && (
        <button
          style={styles.nextRoundButton}
          onClick={finalizeRound}
        >
          Finalize Round & Award Points
        </button>
      )}
      <div style={styles.historyContainer}>
        <h3>Round History (Last 5 rounds)</h3>
        {roundHistory.length === 0 && <p>No rounds played yet.</p>}
        {roundHistory.slice(-5).reverse().map(({ round, winnerId, bets, cardOpened }) => (
          <div key={round} style={styles.roundEntry}>
            <strong>Round {round}</strong>, Winner: {players.find(p => p.id === winnerId)?.name || 'N/A'}, Cards Opened: {cardOpened.join(',')}
            <br />
            Bets: {players.map(p => (
              <span key={p.id}>
                {p.name}: {bets[p.id]}{' '}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 900,
    margin: '30px auto',
    padding: 20,
    backgroundColor: '#1e1e2f',
    color: '#e0e0e0',
    borderRadius: 10,
    boxShadow: '0 0 15px rgba(0,0,0,0.5)',
  },
  title: {
    textAlign: 'center',
    color: '#ffcc00',
    marginBottom: 20,
    letterSpacing: '2px',
    fontSize: '2.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 15,
    maxWidth: 400,
    margin: '0 auto',
  },
  input: {
    padding: 10,
    fontSize: '1rem',
    borderRadius: 6,
    border: '1px solid #ccc',
    color: 'black'
  },
  button: {
    padding: 12,
    fontSize: '1.1rem',
    backgroundColor: '#ffcc00',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: 20,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: '1.2rem',
  },
  betButton: {
    margin: '0 5px',
    padding: '5px 10px',
    backgroundColor: '#007acc',
    border: 'none',
    borderRadius: 4,
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  nextRoundButton: {
    padding: '10px 20px',
    fontSize: '1rem',
    backgroundColor: '#ffcc00',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontWeight: 'bold',
    width: '100%',
    marginTop: 10,
    color: '#333',
    letterSpacing: '1.5px',
  },
  winnerRow: {
    backgroundColor: '#284b00',
    fontWeight: 'bold',
    color: '#d1e231',
  },
  historyContainer: {
    marginTop: 30,
    backgroundColor: '#2a2a3d',
    padding: 15,
    borderRadius: 6,
  },
  roundEntry: {
    marginBottom: 10,
  },
};
