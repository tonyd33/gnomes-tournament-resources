import {useState, useCallback} from 'react';

export default function PlayerCard({name, pictureURL, dead, manualMode}) {
  const [overrideDead, setOverrideDead] = useState(dead);

  const handleManualOverride = useCallback(() => {
    console.log(manualMode);
    if (manualMode) {
      setOverrideDead(d => !d)
    }
  }, [manualMode])

  return (
    <div
      onClick={handleManualOverride}
      className="flex flex-col p-2 bg-[#037881] rounded-2xl max-h-40 relative">
      {pictureURL ? (
        <img
          className={`rounded-tl-2xl rounded-tr-2xl ${overrideDead ? "brightness-50" : ""}`}
          src={pictureURL}
          alt={name}
          width={120}
          height={120}
        />
      ) : (
        <div className="w-[120px] h-[120px] bg-gray-500 rounded-tl-2xl rounded-tr-2xl"/>
      )}
      {overrideDead && (
        <img
          className="absolute left-[50%] -translate-x-[50%] top-[50%] -translate-y-[65%]"
          src={"cross.png"}
          alt="cross"
          width={90}
          height={90}
        />
      )}
      <span className="text-white font-bold text-2xl text-center min-h-9">{name}</span>
    </div>
  )
}
