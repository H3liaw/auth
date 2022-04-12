import {StatusCode} from '../enums/status.code.enum';

export class BaseResponse {
    error:Boolean;
    statusCode: StatusCode;
    message?:any;
}
