import {ToastContainer} from 'react-toastify';
import logo from './logo.svg';
import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom';
import {useEffect, useState, useCallback} from 'react';
import {io} from 'socket.io-client';
import {GameStateProvider} from './lib/gameStateContext';
import EliminationPage from './pages/Elimination';
import AdminPage from './pages/Admin';

const SIO_DOMAIN = process.env.SIO_DOMAIN ?? 'http://localhost:3000'
const socket = io(SIO_DOMAIN);

function App() {
  const [gameState, setGameState] = useState();
  const [msgs, setMsgs] = useState([]);

  const [manualMode, setManualMode] = useState(false);
  const [playersInfo, setPlayersInfo] = useState([]);

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected');
    }
    const onDisconnect = () => {
      console.log('Disconnected');
    }
    const onPong = () => {
      console.log('Received pong');
    }
    const onStateUpdate = (gameState) => {
      console.log('Received game state');
      console.log(gameState);
      if (!manualMode) {
        setGameState(gameState);
      }
    }
    const onChatMsg = (msg) => {
      console.log('Received chat message');
      console.log(msg);
      setMsgs(prevMsgs => [...prevMsgs, msg]);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('pong', onPong)
    socket.on('state_update', onStateUpdate);
    socket.on('chat_msg', onChatMsg);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('pong', onPong)
      socket.off('state_update', onStateUpdate);
      socket.off('chat_msg', onChatMsg);
    }
  }, [manualMode]);

  // retrieve the map from local storage on mount
  useEffect(() => {
    try {
      const items = JSON.parse(localStorage.getItem('playersInfo'));
      console.log('Retrieved playersInfo from localStorage');
      console.log(items);
      setPlayersInfo(items);
    } catch (err) {
      console.log('Initializing playersInfo to localStorage');
      localStorage.setItem('playersInfo', JSON.stringify([]));
      setPlayersInfo([]);
    }
  }, []);

  //retrieve manual mode
  useEffect(() => {
    try {
      const manualMode = JSON.parse(localStorage.getItem('manualMode'));
      console.log('Retrieved manualMode from localStorage');
      console.log(manualMode);
      setManualMode(manualMode);
    } catch (err) {
      console.log('Initializing manualMode to localStorage');
      localStorage.setItem('manualMode', JSON.stringify(false));
      setManualMode(false);
    }
  }, [])

  // update localStorage on change
  useEffect(() => {
    localStorage.setItem('playersInfo', JSON.stringify(playersInfo));
  }, [playersInfo])

  useEffect(() => {
    localStorage.setItem('manualMode', JSON.stringify(manualMode));
  }, [manualMode]);

  const handlePollState = useCallback(() => {
    socket.emit('poll_state');
  }, []);

  const handleRemoteCommand = useCallback((command) => {
    socket.emit('remote_command', command);
  }, [])


  return (
    <GameStateProvider value={{
      gameState,
      pollState: handlePollState,
      remoteCommand: handleRemoteCommand,
      _socket: socket,
      msgs,
      playersInfo,
      setPlayersInfo,
      manualMode,
      setManualMode
    }}>
      <BrowserRouter>
        <Routes path="/">
          <Route>
            <Route index element={<EliminationPage/>}/>
            <Route path="/rc" element={<AdminPage/>}/>
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer/>
    </GameStateProvider>
  );
}

export default App;
