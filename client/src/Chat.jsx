import { useEffect, useState, useRef } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";


export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages= useRef()

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }
  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    console.log({ev,messageData})
    console.log(messageData);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if("text" in messageData){
        setMessages(prev => [...prev, {...messageData}])
    }
  }

  function sendMessage(ev) {
    ev.preventDefault();
    ws.send(JSON.stringify({
    
        recipient: selectedUserId,
        text: newMessageText,
    
    
    }));
    setNewMessageText("");
    setMessages(prev => [...prev, {text: newMessageText, sender: id, recipient: selectedUserId, id: Date.now()}])
   
  }

useEffect(() => {
    const div = divUnderMessages.current
    if(div){
    div.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
},[messages])

useEffect(() => {
    if(selectedUserId){
  axios.get('/messages/'+selectedUserId)}
},[selectedUserId])

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "id")
 
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3 ">
        <Logo />

        {Object.keys(onlinePeopleExclOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              "border-b border-gray-100 flex items-center gap-2 cursor-pointer " +
              (userId === selectedUserId ? "bg-blue-50" : "")
            }
          >
            {userId === selectedUserId && (
              <div className=" w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )}
            <div className="flex py-2 pl-4  gap-2 items-center">
              {" "}
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-50  w-2/3 p-2">
        <div className="flex-grow">
            {!selectedUserId && (
                <div className="flex items-center h-full justify-center">
                    <div className="text-gray-300"> &larr; Select a Person</div>
                    </div>
            )}
        </div>

        {!!selectedUserId && (
        

        <div className="overflow-y-scroll mb-4">
            {messagesWithoutDupes.map((message,index) => (
                <div  className={(message.sender == id ? 'text-right' : "text-left")}>
                <div key={index} className={" text-left inline-block p-2 m-2 rounded-md text-sm "+(message.sender == id ? 'bg-blue-500 text-white': "bg-white text-gray-500")} >
                  sender: {message.sender}<br/>
                  my id: {id} <br/>
                  {message.text}
                    </div>
                    </div>
                    
            ))} 
            <div ref={divUnderMessages} ></div>
             </div>  
         
        )}

{!!selectedUserId && (
 <form className="flex gap-2 " onSubmit={sendMessage}>
 <input
   type="text"
   value={newMessageText}
   onChange={(ev) => setNewMessageText(ev.target.value)}
   placeholder="type your message here"
   className="bg-white flex-grow border p-2 rounded-sm"
 />
 <button type="submit" className="bg-blue-500 text-white p-2 rounded-sm">
   <svg
     xmlns="http://www.w3.org/2000/svg"
     fill="none"
     viewBox="0 0 24 24"
     strokeWidth={1.5}
     stroke="currentColor"
     className="w-6 h-6"
   >
     <path
       strokeLinecap="round"
       strokeLinejoin="round"
       d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
     />
   </svg>
 </button>
</form>
)}        
       
      </div>
    </div>
  );
}
