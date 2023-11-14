import PropTypes from "prop-types";
export default function Avatar({ userId, username , online}) {
  const colors = [
    { class: "bg-blue-300", color: "#7DD3FC" },
    { class: "bg-green-300", color: "#9AE6B4" },
    { class: "bg-yellow-300", color: "#FCD34D" },
    { class: "bg-purple-300", color: "#D8B4FE" },
    { class: "bg-pink-300", color: "#FBCFE8" },
    { class: "bg-indigo-300", color: "#C3DAFE" },
    { class: "bg-gray-300", color: "#E5E7EB" },
  ];

  const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex].color;
  return (
    <div className={"w-8 h-8 relative  rounded-full  flex items-center "+ color}>
     <svg xmlns="http://www.w3.org/2000/svg" fill={color} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={"w-full h-full p-4"+ color}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
</svg>

      {online && ( <div className="absolute w-3 h-3 bg-white bottom-0 right-0 rounded-full border border-black "></div> )}
      {!online && ( <div className="absolute w-3 h-3 bg-black bottom-0 right-0 rounded-full border border-white "></div> )}
    </div>
  );
}

Avatar.propTypes = {
    userId: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    online: PropTypes.bool.isRequired,
  };