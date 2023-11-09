export default function Avatar({ userId, username }) {
  const colors = [
   
    "bg-blue-300",
    "bg-green-300",
    "bg-yellow-300",
    "bg-purple-300",
    "bg-pink-300",
    "bg-indigo-300",
    "bg-gray-300",
  ];

  const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];
  return (
    <div className={"w-8 h-8  rounded-full  flex items-center "+ color}>
      <div className="text-center w-full opacity-70">{username[0]}</div>
    </div>
  );
}
