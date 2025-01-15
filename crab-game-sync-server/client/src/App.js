import {useLocalStorage} from '@uidotdev/usehooks';
import {LOCAL_STORAGE_KEYS} from './lib/constants';
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
  const [connected, setConnected] = useState(false);

  const [manualMode] = useLocalStorage(
    LOCAL_STORAGE_KEYS.MANUAL_MODE, false
  );

  useEffect(() => {
    const onConnect = () => {
      console.log('Connected');
      setConnected(true);
    }
    const onDisconnect = () => {
      console.log('Disconnected');
      setConnected(false);
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

  const handlePollState = useCallback(() => {
    socket.emit('poll_state');
  }, []);

  const handleRemoteCommand = useCallback((command) => {
    socket.emit('remote_command', command);
  }, []);


  return (
    <GameStateProvider value={{
      gameState,
      pollState: handlePollState,
      remoteCommand: handleRemoteCommand,
      msgs,
      connected,
      _socket: socket,
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
