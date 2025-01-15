import Button from '../components/Button';
import {useLocalStorage} from '@uidotdev/usehooks';
import {FaPaperPlane, FaChevronRight} from 'react-icons/fa';
import {FiRefreshCw} from 'react-icons/fi';
import {LOCAL_STORAGE_KEYS} from '../lib/constants';
import {useState, useCallback, useEffect, useRef} from 'react';
import {useGameState} from '../lib/gameStateContext'
import PlayerInfoInput from '../components/PlayerInfoInput';

export default function AdminPage() {
  const {
    gameState,
    pollState,
    msgs,
    remoteCommand,
    connected,
  } = useGameState();

  const [manualMode, setManualMode] = useLocalStorage(
    LOCAL_STORAGE_KEYS.MANUAL_MODE, false
  );
  const [playersInfo, setPlayersInfo] = useLocalStorage(
    LOCAL_STORAGE_KEYS.PLAYERS_INFO, []
  );

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 justify-items-start p-16 space-y-4 relative">
      <div className="absolute top-0 left-0 flex flex-row items-center space-x-4 p-4">
        <div className={`w-4 h-4 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}/>
        <span>{connected ? "Connected" : "Not connected"}</span>
      </div>
      <div className="flex flex-col space-y-4 w-full p-4 border">
        <h1 className="text-3xl font-bold text-center">Messages</h1>
        <ul className="grow h-64 overflow-y-auto">
          {msgs.slice(0, msgs.length - 1).map(msg => (
            <li key={msg.Timestamp}>{msg.Content}</li>
          ))}
          {msgs[msgs.length - 1] ? (
            <li ref={bottomRef}>{msgs[msgs.length - 1].Content}</li>
          ) : null}
        </ul>
        <div className="flex flex-row space-x-4 px-4 pb-4 items-center">
          <form onSubmit={handleSubmit} className="contents space-x-4">
            <label className="contents space-x-4">
              <span className="font-medium text-xl"><FaChevronRight/></span>
              <input
                value={command}
                onChange={handleInputChange}
                className="border border-stone-600 rounded grow px-4 min-h-8"
              />
            </label>
            <Button onClick={handleSubmit}><FaPaperPlane/></Button>
          </form>
          <Button onClick={pollState}><FiRefreshCw/></Button>
        </div>
      </div>
      <div className="flex flex-col space-y-4 w-full p-4 border">
        <h1 className="text-3xl font-bold text-center">Edit player info</h1>
        <div className="flex flex-row flex-wrap justify-evenly max-h-96 overflow-auto">
          {playersInfo.map(playerInfo => (
            <div className="m-2">
              <PlayerInfoInput
                key={playerInfo.entryId}
                info={playerInfo}
                onSubmit={handleUpdatePlayersInfo}
                onDelete={handleDeletePlayerInfo}
              />
            </div>
          ))}
          <div className="m-2">
            <PlayerInfoInput
              onSubmit={handleUpdatePlayersInfo}
              isNewEntry
            />
          </div>
        </div>
      </div>
      <div className="flex flex-col space-y-4 w-full p-4 border">
        <h1 className="text-3xl font-bold text-center">Player States</h1>
        <code className="whitespace-pre bg-stone-800 text-white p-4 rounded max-h-64 overflow-y-auto">
          {JSON.stringify(Object.values(gameState?.Players ?? {}), null, 2)}
        </code>
      </div >
      <div className="flex flex-col space-y-4 w-full p-4 border">
        <h1 className="text-3xl font-bold text-center">Miscellaneous</h1>
        <label className="inline-flex flex-row space-x-4">
          <span className="font-medium">Manual mode</span>
          <input
            type="checkbox"
            checked={manualMode}
            value={manualMode}
            onChange={handleManualModeChange}
          />
        </label>
      </div>
    </div>
  );
}
