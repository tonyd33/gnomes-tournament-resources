import Button from '../components/Button';
import {FaTrash, FaSave, FaPlus} from 'react-icons/fa';
import {toast} from 'react-toastify';
import {useState, useCallback} from 'react';

export default function PlayerInfoInput({
  info = {},
  onSubmit,
  onDelete,
  isNewEntry = false,
}) {
  const entryId = info.entryId ?? -1;

  const clearOnSubmit = isNewEntry;
  const [name, setName] = useState(info.name ?? '');
  const [playerId, setPlayerId] = useState(info.playerId != null ? info.playerId.toString() : '');
  const [pictureName, setPictureName] = useState(info.pictureName ?? '');

  const handleNameInputChange = useCallback(e => {
    setName(e.target.value);
  }, []);
  const handlePlayerIdInputChange = useCallback(e => {
    setPlayerId(e.target.value);
  }, []);
  const handlePictureNameInputChange = useCallback(e => {
    setPictureName(e.target.value);
  }, []);

  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (playerId.length === 0) {
      toast.error("Expected id to be set")
      return;
    }

    onSubmit({...info, playerId, name, pictureName})

    if (clearOnSubmit) {
      setPlayerId('');
      setName('');
    }
  }, [name, info, onSubmit, clearOnSubmit, playerId, pictureName])

  const handleDelete = useCallback(() =>{
    onDelete(info.entryId);
  }, [onDelete, info]);


  return (
    <form
      className="flex flex-col items-center border border-stone-800 space-y-2 rounded p-2"
      onSubmit={handleSubmit}
    >
      <label className="inline-flex flex-col space-y-2">
        <span className="font-medium">Player ID</span>
        <input
          value={playerId}
          onChange={handlePlayerIdInputChange}
          className="rounded border"
        />
      </label>
      <label className="inline-flex flex-col space-y-2">
        <span className="font-medium">Name</span>
        <input
          value={name}
          onChange={handleNameInputChange}
          className="rounded border"
          type="name"
        />
      </label>
      <label className="inline-flex flex-col space-y-2">
        <span className="font-medium">Picture name</span>
        <input
          value={pictureName}
          onChange={handlePictureNameInputChange}
          className="rounded border"
          type="name"
        />
      </label>
      <div className="flex flex-row space-x-2">
        <Button onClick={handleSubmit}>
          {isNewEntry ? <FaPlus/> : <FaSave/>}
        </Button>
        {!isNewEntry ? (
          <Button onClick={handleDelete}><FaTrash/></Button>
        ) : null }
      </div>
    </form>
  )
}
