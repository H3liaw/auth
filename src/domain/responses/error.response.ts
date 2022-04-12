import {BaseResponse} from "./base.finotich.response";
import {StatusCode} from "../enums/status.code.enum";

export class ErrorResponse extends BaseResponse {
    constructor(statusCode:StatusCode,message:{data:string}) {
        super();
        this.error = true;
        this.statusCode = statusCode;
        this.message=message
    }
}
