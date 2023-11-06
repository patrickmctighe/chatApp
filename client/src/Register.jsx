
import { useState, useContext } from 'react';
import { UserContext } from './UserContext';
import axios from 'axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { setLoggedInUsername, setId } = useContext(UserContext);

  async function register(ev) {
    ev.preventDefault();

    try {
      const response = await axios.post('/register', { username, password });
      const { data } = response;
      setLoggedInUsername(username);
      setId(data.id);
    } catch (error) {
      console.error(error);
    }
  }



    return(
        <div className="bg-blue-50 h-screen flex items-center " onSubmit={register}>
            <form action="" className="w-64 mx-auto">

                <input value={username} 
                onChange={ev=> setUsername(ev.target.value)} 
                type="text" 
                placeholder="username" 
                className="block rounded-sm md-2 p-2 border"/>

                <input value={password} 
                onChange={ev=> setPassword(ev.target.value)} 
                type="password"
                placeholder="password" 
                className="block rounded-sm md-2 p-2 border"/>

                <button className="bg-blue-500 w-full text-white block rounded-sm p-2">Register</button>

            </form>
        </div>
    )
}