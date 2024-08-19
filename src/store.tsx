// store.js
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import { commonReducer } from './reducers/common.slice';
import commonSaga from './sagas/common.saga';

const sagaMiddleware = createSagaMiddleware();
const rootReducer = combineReducers({ common: commonReducer });

export const store = configureStore({
    reducer: {
        common: commonReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(sagaMiddleware),
});
sagaMiddleware.run(commonSaga);

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
