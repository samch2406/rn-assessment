class CommonService {

	getUrlSearchParam = (param: any) => {
		return new URLSearchParams(param).toString();
	};
}

export const commonService = new CommonService();
