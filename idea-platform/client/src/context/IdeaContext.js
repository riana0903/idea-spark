// client/src/context/IdeaContext.js
import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  ideas: [],
  currentIdea: null,
  loading: false,
  error: null
};

// Action types
const types = {
  FETCH_IDEAS_REQUEST: 'FETCH_IDEAS_REQUEST',
  FETCH_IDEAS_SUCCESS: 'FETCH_IDEAS_SUCCESS',
  FETCH_IDEAS_FAILURE: 'FETCH_IDEAS_FAILURE',
  SET_CURRENT_IDEA: 'SET_CURRENT_IDEA',
  CREATE_IDEA_SUCCESS: 'CREATE_IDEA_SUCCESS',
  UPDATE_IDEA_SUCCESS: 'UPDATE_IDEA_SUCCESS',
  DELETE_IDEA_SUCCESS: 'DELETE_IDEA_SUCCESS'
};

// Reducer
const ideaReducer = (state, action) => {
  switch (action.type) {
    case types.FETCH_IDEAS_REQUEST:
      return { ...state, loading: true };
    case types.FETCH_IDEAS_SUCCESS:
      return { ...state, loading: false, ideas: action.payload, error: null };
    case types.FETCH_IDEAS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case types.SET_CURRENT_IDEA:
      return { ...state, currentIdea: action.payload };
    case types.CREATE_IDEA_SUCCESS:
      return { ...state, ideas: [...state.ideas, action.payload] };
    case types.UPDATE_IDEA_SUCCESS:
      return {
        ...state,
        ideas: state.ideas.map(idea => 
          idea._id === action.payload._id ? action.payload : idea
        )
      };
    case types.DELETE_IDEA_SUCCESS:
      return {
        ...state,
        ideas: state.ideas.filter(idea => idea._id !== action.payload)
      };
    default:
      return state;
  }
};

// Create context
const IdeaContext = createContext();

export const useIdeas = () => useContext(IdeaContext);

export const IdeaProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ideaReducer, initialState);

  return (
    <IdeaContext.Provider value={{ ...state, dispatch }}>
      {children}
    </IdeaContext.Provider>
  );
};
