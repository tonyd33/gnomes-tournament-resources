export default function Button(props) {
  const className = `${props.className} bg-black text-white font-medium rounded-md py-2 px-3 hover:bg-gray-800 shadow`;
  return <button {...props} className={className}/>
}
