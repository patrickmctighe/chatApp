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
    <div className="bg-blue-50 h-screen flex items-center">
      <form onSubmit={handleSubmit} className="w-64 mx-auto">
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

        <button type="submit" className="bg-blue-500 w-full text-white block rounded-sm p-2">
          {isLoginOrRegister === "register" ? "Register" : "Login"}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "register" && (
            <div>
              Already a member?
              <button onClick={() => setIsLoginOrRegister("login")} href="">
                Login Here
              </button> 
            </div>
          )}
          {isLoginOrRegister === "login" && (
            <div>
              Not a member?
              <button onClick={() => setIsLoginOrRegister("register")} href="">
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

