import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/es/storage';
import authReducer from './reducers/auth';

// Only the session itself survives a reload. `loading` and `error` would otherwise come back
// stuck from a request that was cut off by closing the tab.
const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isAuthenticated', 'token', 'user'],
  version: 1,
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
});

// Configure store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
