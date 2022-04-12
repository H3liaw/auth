import {BaseResponse} from './base.finotich.response';
import {StatusCode} from "../enums/status.code.enum";

export class SuccessResponse extends BaseResponse {
    constructor(statusCode: StatusCode, message: any) {
        super()
        this.error = false;
        this.statusCode = statusCode;
        this.message = message
    }
}
