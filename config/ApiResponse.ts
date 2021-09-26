interface ApiResponseError {
    code: number;
    errorObj?: string | object | any;
    errorsArray?: any[];
}

interface ApiResponseSuccess {
    code: number;
    msg: any
}

export {
    ApiResponseError,
    ApiResponseSuccess
};
