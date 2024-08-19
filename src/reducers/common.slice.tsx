import { createSlice } from '@reduxjs/toolkit';

interface CommonState {
    autoCompleteApiRes: any;
    placeDetailsApiRes: any;
    recentSearch: any
}

const initialState: CommonState = {
    autoCompleteApiRes: [],
    placeDetailsApiRes: {},
    recentSearch: [],
};

const common = createSlice({
    name: 'common',
    initialState: initialState,
    reducers: {
        setAutoCompleteApiRes(state, action) {
            state.autoCompleteApiRes = action.payload;
        },
        setPlaceDetailsApiRes(state, action) {
            state.placeDetailsApiRes = action.payload;
        },
        setRecentSearch(state, action) {
            state.recentSearch = action.payload;
        },
    },
});

export const { setAutoCompleteApiRes, setPlaceDetailsApiRes, setRecentSearch } =
    common.actions;
export const commonReducer = common.reducer;
