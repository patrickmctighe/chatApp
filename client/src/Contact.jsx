import Avatar from "./Avatar";
export default function Contact({ id, onClick, username, selected, online}) {
return(
    <div
    key={id}
    onClick={() => onClick(id)}
    className={
      "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
      (selected ? "bg-purple-100 border-t-2 border-purple-200" : "")
    }
  >
    {selected && (
      <div className=" w-1 bg-blue-500 h-12 rounded-r-md"></div>
    )}
    <div className="flex py-2 pl-4  gap-2 items-center">
      {" "}
      <Avatar online={online} username={username} userId={id} />
      <span className="text-gray-800">{username}</span>
    </div>
  </div>)
}