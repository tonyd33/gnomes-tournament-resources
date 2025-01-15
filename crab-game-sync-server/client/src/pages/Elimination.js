import {useMemo, useCallback} from 'react';
import {useGameState} from '../lib/gameStateContext';
import PlayerCard from '../components/PlayerCard';
import './Elimination.css';
import _ from 'lodash';


export default function EliminationPage() {
  const {gameState, playersInfo, manualMode} = useGameState();


  const getPlayerState = useCallback(playerId => {
    const playerState = (gameState?.Players ?? {})[playerId];

    if (playerState) {
      return {
        dead: !playerState.IsAlive,
      }
    } else {
      return {
        dead: true,
      }
    }
  }, [gameState?.Players])

  const players = useMemo(() => {
    const unpaddedPlayers = playersInfo ?? [];
    if (unpaddedPlayers.length < 40) {
      return [
        ...unpaddedPlayers.map(
          player => ({
            playerId: player.playerId,
            name: player.name,
            pictureURL: `${player.name}.png`,
            ...getPlayerState(player.playerId),
          })
        ),
        ..._.range(40 - unpaddedPlayers.length).map(
          i => ({
            playerId: i,
            name: undefined,
            pictureURL: undefined,
            dead: true
          })
        ),
      ]
    }
    return unpaddedPlayers;
  }, [getPlayerState, playersInfo]);


  return (
    <div className="elimination-page flex flex-row pt-48 pl-96 pb-20 pr-20">
      <div className="grid grid-cols-10 gap-x-5 gap-y-8 justify-center items-center place-items-center">
        {players.map((player) => (
          <PlayerCard
            key={player.playerId}
            manualMode={manualMode}
            {...player}
          />
        ))
        }
      </div>
    </div>
  )
}
