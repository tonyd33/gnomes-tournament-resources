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
  const submitText = !isNewEntry ? "Update" : "Add";

  const [name, setName] = useState(info.name ?? '');
  const [playerId, setPlayerId] = useState(info.playerId != null ? info.playerId.toString() : '');

  const handleNameInputChange = useCallback(e => {
    setName(e.target.value);
  }, []);
  const handlePlayerIdInputChange = useCallback(e => {
    setPlayerId(e.target.value);
  }, [])
  const handleSubmit = useCallback(e => {
    e.preventDefault();
    if (playerId == null) {
      toast.error("Expected id to be set")
      return;
    }

    onSubmit({...info, playerId, name})

    if (clearOnSubmit) {
      setPlayerId('');
      setName('');
    }
  }, [name, info, onSubmit, clearOnSubmit, playerId])

  const handleDelete = useCallback(() =>{
    onDelete(info.entryId);
  }, [onDelete, info]);

  const inputIdPrefix = `player-input-${entryId}`


  return (
    <form
      className="flex flex-row space-x-4"
      onSubmit={handleSubmit}
    >
      <label htmlFor={`${inputIdPrefix}-id`}>
        Player Id
      </label>
      <input
        id={`${inputIdPrefix}-id`}
        value={playerId}
        onChange={handlePlayerIdInputChange}
        className="rounded border"
      />
      <label htmlFor={`${inputIdPrefix}-name`}>
        Name
      </label>
      <input
        id={`${inputIdPrefix}-name`}
        value={name}
        onChange={handleNameInputChange}
        className="rounded border"
        type="name"
      />
      <button onClick={handleSubmit}>{submitText}</button>
      {!isNewEntry ? (
        <button onClick={handleDelete}>Delete</button>
      ) : null }
    </form>
  )
}
