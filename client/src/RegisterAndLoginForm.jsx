import { useState, useContext, useEffect } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("login");

  const { setUsername:setLoggedInUsername, setId } = useContext(UserContext);

  // useEffect(() => {
  //   const storedUsername = localStorage.getItem('username');
  //   const storedId = localStorage.getItem('id');
  //   if (storedUsername && storedId) {
  //     setLoggedInUsername(storedUsername);
  //     setId(storedId);
  //   }
  // }, []);

  axios.defaults.withCredentials = true;

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === "register" ? "register" : "login";
    const { data } = await axios.post(url,{username,password});
    setLoggedInUsername(username);
    setId(data.id);
    // Store the user's login state in local storage
    // localStorage.setItem('username', username);
    // localStorage.setItem('id', data.id);
  }
  return (
    <div className="bg-violet-50 h-screen flex flex-col justify-center gap-10 items-center">
           <img className="w-1/6 h-1/8" src="/chatr2.png" alt="" />
      <form onSubmit={handleSubmit} className="w-64 flex flex-col items-center gap-2 mx-auto">
        <input
          value={username}
          name="username"
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="username"
          className="block rounded-sm md-2 p-2 border"
        />

        <input
          value={password}
          name="password"
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="password"
          className="block rounded-sm md-2 p-2 border"
        />

        <button type="submit" className="bg-violet-200 w-1/2  text-grey-400 block rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center   mt-2">
          {isLoginOrRegister === "register" && (
            <div className="">
              Already a member?
              <button className="ml-1" onClick={() => setIsLoginOrRegister("login")} href="">
                <p className=" underline underline-offset-4 decoration-double">Login Here</p>
              </button> 
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div className="flex gap-2"> 
              Not a member??
              <button className="ml-1"onClick={() => setIsLoginOrRegister("register")} href="">
               <p  className=" underline underline-offset-4 decoration-double"> Register</p>
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

