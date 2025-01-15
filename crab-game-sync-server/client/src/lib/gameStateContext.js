import {createContext, useContext} from 'react';

const GameStateContext = createContext(null);

export const GameStateProvider = GameStateContext.Provider;

export const useGameState = () => useContext(GameStateContext);
