import { createContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [username, setUsername] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    axios.get("/profile").then(response => {
      // Log the response to see its structure
      console.log("Profile response:", response.data);

      // Update the state based on the actual response structure
      const { userId, username } = response.data; // Adjust this based on the actual response
      setId(userId);
      setUsername(username);
    }).catch(error => {
      console.error("Error fetching profile data:", error);
    });
  }, []);

  return (
    <UserContext.Provider value={{ username, id, setUsername, setId }}>
      {children}
    </UserContext.Provider>
  );
}

UserContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
