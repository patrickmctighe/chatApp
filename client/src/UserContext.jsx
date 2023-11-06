// UserContext.js
import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { response } from 'express';
import axios from 'axios';
export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
axios.get("/profile").then(response=>{
    console.log(response.data);
  },[]);
  return (
    <UserContext.Provider value={{ username, id, setLoggedInUsername: setUsername, setId }}>
      {children}
    </UserContext.Provider>
  );
  
}
  )}

UserContextProvider.propTypes = {
    children: PropTypes.node.isRequired,};