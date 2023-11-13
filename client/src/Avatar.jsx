import PropTypes from "prop-types";
export default function Avatar({ userId, username , online}) {
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
    <div className={"w-8 h-8 relative  rounded-full  flex items-center "+ color}>
      <div className="text-center w-full opacity-70">{username &&username[0]}</div>
      {online && ( <div className="absolute w-3 h-3 bg-green-400 bottom-0 right-0 rounded-full border border-white "></div> )}
      {!online && ( <div className="absolute w-3 h-3 bg-gray-400 bottom-0 right-0 rounded-full border border-white "></div> )}
    </div>
  );
}

Avatar.propTypes = {
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    online: PropTypes.bool.isRequired,
  };