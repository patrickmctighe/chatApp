import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import Contact from "./Contact";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import { uniqBy } from "lodash";
import axios from "axios";

export default function Chat() {
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const { username, id, setUsername, setId } = useContext(UserContext);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
  const [offlinePeople, setOfflinePeople] = useState({});

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);

    ws.addEventListener("close", () => {
      console.log("Disconnected.");
    });

    ws.addEventListener("error", (error) => {
      console.error("WebSocket error:", error);
    });

    return () => {
      ws.removeEventListener("message", handleMessage);
      ws.close();
    };
  }, [selectedUserId]);
  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4040");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        console.log("Disconnected. Trying to reconnect.");
        connectToWs();
      }, 1000);
    });
  }
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);

    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  }

  function sendMessage(ev, file = null) {
    if (ev) ev.preventDefault();
    ws.send(
      JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText,
        file,
      })
    );
    if (file) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    } else {
      setNewMessageText("");
      setMessages((prev) => [
        ...prev,
        {
          text: newMessageText,
          sender: id,
          recipient: selectedUserId,
          _id: Date.now(),
        },
      ]);
    }
  }

  function logOut() {
    axios.post("/logout").then((res) => {
      console.log("res:", res);
      setWs(null);
      setUsername(null);
      setId(null);
    });
  }
  function sendFile(ev) {
    const reader = new FileReader();
    reader.readAsDataURL(ev.target.files[0]);
    reader.onload = () => {
      sendMessage(null, {
        name: ev.target.files[0].name,
        data: reader.result,
      });
    };
  }

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);
  useEffect(() => {
    axios.get("/people").then((res) => {
      const offlinePeopleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePeople).includes(p._id));
      const offlinePeople = {};
      offlinePeopleArr.forEach((p) => {
        offlinePeople[p._id] = p;
      });
      setOfflinePeople(offlinePeople);
    });
  }, [onlinePeople]);

  useEffect(() => {
    if (selectedUserId) {
      axios.get("/messages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  useEffect(() => {
    axios
      .get("/profile")
      .then((response) => {
        // Log the response to see its structure
        console.log("Profile response:", response.data);

        const { userId, username } = response.data;
        setId(userId);
        setUsername(username);
      })
      .catch((error) => {
        console.error("Error fetching profile data:", error);
      });
  }, []);

  useEffect(() => {
    connectToWs();

    return () => {
      // Cleanup WebSocket connection when component unmounts
      if (ws) {
        ws.close();
      }
    };
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[id];

  console.log("onlinePeople:", onlinePeople);

  const messagesWithoutDupes = uniqBy(messages, "_id");
  console.log("onlinePeopleExclOurUser:", onlinePeopleExclOurUser);
  console.log("offlinePeople:", offlinePeople);

  return (
    <div className="flex h-screen">
      <div className="bg-violet-50 w-1/3 flex flex-col">
        <div className="flex-grow">
          {" "}
          <Logo />
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>

        <div className="p-2 text-center border-t-2 border-violet-100 flex gap-3 items-center justify-center">
          <span className="flex gap-2"><p className="underline underline-offset-4 decoration-wavy decoration-1 ">Current User</p>:{username}</span>
          <button
            onClick={logOut}
            className="text-sm text-gray-800 bg-violet-300 py-1 px-2 rounded-sm"
          >
            {" "}
            Log Out
          </button>
        </div>
      </div>
      <div className="flex flex-col bg-purple-100  w-2/3 p-2">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex items-center h-full justify-center">
              <div className="text-gray-300"> &larr; Select a Person</div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          <div className="overflow-y-scroll mb-4">
            {messagesWithoutDupes.map((message) => (
              <div
                key={message._id}
                className={message.sender == id ? "text-right" : "text-left"}
              >
                <div
                  className={
                    " text-left inline-block p-2 m-2 rounded-md text-sm " +
                    (message.sender == id
                      ? "bg-violet-800 text-white border-2 border-gray-400"
                      : "bg-violet-200 text-gray-800 border-2 border-violet-300")
                  }
                >
                  {message.text}
                  {message.file && (
                    <div>
                      <a
                        href={
                            `http://localhost:4040/uploads/${message.file}`
                        }
                      >
                        {message.file}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={divUnderMessages}></div>
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
            <label className="bg-purple-300 p-2 text-gry-600 rounded-full cursor-pointer">
              <input type="file" className="hidden" onChange={sendFile} />
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
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-violet-500 text-white p-2 rounded-full"
            >
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
