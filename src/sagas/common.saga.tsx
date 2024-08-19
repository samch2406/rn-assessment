import { createAction } from '@reduxjs/toolkit';
import axios, { AxiosResponse } from 'axios';
import { call, put, takeLatest } from 'redux-saga/effects';
import { API_URL, GOOGLE_MAP_API_KEY } from '../constants/api.constant';
import {
	setAutoCompleteApiRes,
	setPlaceDetailsApiRes,
} from '../reducers/common.slice';
import { commonService } from '../services/common.service';

// const apiCall = async (apiUrl) => {
//   const isJsonString = (value) => {
//     try {
//       JSON.parse(value);
//     } catch (e) {
//       return false;
//     }
//     return true;
//   };
//   return await fetch(encodeURI(apiUrl), { mode: 'no-cors' }).then(
//     (response) => {
//       console.log('res >> \n', response);
//       const returnValue = isJsonString(response.bodyString)
//         ? JSON.parse(response.bodyString)
//         : response.bodyString ?? '';

//       return returnValue;
//     }
//   );
// };

// const apiCall2 = async (apiUrl) => {
//   return await fetch(apiUrl, { mode: 'no-cors' }).then(async (response) => {
//     return await response.json().then((value) => {
//       return value;
//     });
//   });
// };

const axiosApiCall = async (apiUrl: string) => {
	try {
		const { data }: AxiosResponse<any> = await axios
			.get(apiUrl)
			.then((response: any) => {
				return response;
			});
		console.log('Response Data >>\n', JSON.stringify(data));
		return data;
	} catch (e) {
		console.log('Error >> ', e);
	}
}

function* getAutoComplete(action: any): Generator<any> {
	try {
		const params = yield call(commonService.getUrlSearchParam, {
			input: action.payload,
			key: GOOGLE_MAP_API_KEY,
		});

		const data: any = yield call(axiosApiCall, `${API_URL.AUTO_COMPLETE}${params}`);

		yield put(
			setAutoCompleteApiRes(data && data?.predictions ? data?.predictions : [])
		);
	} catch (e) {
		console.log('Error getAutoComplete > ', e);
	}
}

function* getPlaceDetails(action: any): Generator<any> {
	try {
		const params = yield call(commonService.getUrlSearchParam, {
			place_id: action.payload,
			key: GOOGLE_MAP_API_KEY,
		});

		const data: any = yield call(axiosApiCall, `${API_URL.PLACE_DETAILS}${params}`);

		yield put(setPlaceDetailsApiRes(data.result));
	} catch (e) {
		console.log('Error getPlaceDetails > ', e);
	}
}

function* commonSaga() {
	yield takeLatest(getAutoCompleteAction.type, getAutoComplete);
	yield takeLatest(getPlaceDetailsAction.type, getPlaceDetails);
}

export const getAutoCompleteAction = createAction<any>('getAutoCompleteAction');
export const getPlaceDetailsAction = createAction<any>('getPlaceDetailsAction');

export default commonSaga;
