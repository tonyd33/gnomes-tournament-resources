import {useState, useCallback, useEffect, useRef} from 'react';
import {useGameState} from '../lib/gameStateContext'
import PlayerInfoInput from '../components/PlayerInfoInput';

export default function AdminPage() {
  const {
    gameState,
    pollState,
    msgs,
    remoteCommand,
    playersInfo,
    setPlayersInfo,
    manualMode,
    setManualMode
  } = useGameState();

  const [command, setCommand] = useState('');
  const handleInputChange = useCallback(e => {
    setCommand(e.target.value);
  }, []);
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    remoteCommand(command);
    setCommand('');
  }, [command, remoteCommand])

  const handleUpdatePlayersInfo = useCallback(playerInfo => {
    setPlayersInfo(prevInfos => {
      let found = false;
      const updatedPlayersInfo = [];
      for (const prevInfo of prevInfos) {
        if (prevInfo.entryId === playerInfo.entryId) {
          updatedPlayersInfo.push(playerInfo);
          found = true;
        } else {
          updatedPlayersInfo.push(prevInfo);
        }
      }
      if (!found) {
        updatedPlayersInfo.push({
          ...playerInfo,
          entryId: Math.floor(Math.random() * 10e9),
        });
      }

      return updatedPlayersInfo;
    })
  }, [setPlayersInfo]);

  const handleDeletePlayerInfo = useCallback((entryId) => {
    setPlayersInfo(prevInfos => prevInfos.filter(
      prevInfo => prevInfo.entryId !== entryId
    ))
  }, [setPlayersInfo]);

  const handleManualModeChange = useCallback(e => {
    console.log('setting manual mode to', e.target.checked);
    setManualMode(e.target.checked)
  }, [setManualMode])

  const bottomRef = useRef(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [msgs]);


  return (
    <div className="grid grid-cols-2 justify-evenly justify-items-start p-16 space-y-4">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-center">Messages</h1>
        <ul className="grow h-64 overflow-y-scroll">
          {msgs.slice(0, msgs.length - 1).map(msg => (
            <li key={msg.Timestamp}>{msg.Content}</li>
          ))}
          {msgs[msgs.length - 1] ? (
            <li ref={bottomRef}>{msgs[msgs.length - 1].Content}</li>
          ) : null}
        </ul>
        <form onSubmit={handleSubmit} className="flex flex-row space-x-4 px-4 pb-4 text-xl">
          <label className="flex flex-row space-x-4" htmlFor="command-input">
            Command
          </label>
          <input
            id="command-input"
            value={command}
            onChange={handleInputChange}
            className="border rounded-xl grow px-4"
          />
          <button onClick={handleSubmit}>Send</button>
          <button onClick={pollState}>Poll</button>
        </form>
      </div>
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold text-center">Edit player info</h1>
        <div className="flex flex-col space-y-4">
          {playersInfo.map(playerInfo => (
            <PlayerInfoInput
              key={playerInfo.entryId}
              info={playerInfo}
              onSubmit={handleUpdatePlayersInfo}
              onDelete={handleDeletePlayerInfo}
            />
          ))}
          <PlayerInfoInput
            onSubmit={handleUpdatePlayersInfo}
            isNewEntry
          />
        </div>
      </div>
      <div className="flex flex-col space-y-4 min-w-[500px]">
        <h1 className="text-3xl font-bold text-center">Player States</h1>
        <code className="whitespace-pre max-h-64 overflow-y-scroll">
          {JSON.stringify(Object.values(gameState?.Players ?? {}), null, 2)}
        </code>
      </div >
      <div className="flex flex-col space-y-4 min-w-[500px]">
        <h1 className="text-3xl font-bold text-center">Miscellaneous</h1>
        <div className="flex flex-row space-x-4">
          <label htmlFor="manual-mode-input">
            Manual mode
          </label>
          <input
            id="manual-mode-input"
            type="checkbox"
            checked={manualMode}
            value={manualMode}
            onChange={handleManualModeChange}
          />
        </div>
      </div>
    </div>
  );
}
