export enum StatusCode {
    OK = 200,
    CREATED = 201,
    BAD_REQUEST = 400,
    NOT_FOUND = 404,
    OTP_OR_PASS_INCORRECT = 4001,
    USER_ALREADY_REGISTERED = 403,
    PASSWORD_MISMATCH = 4007,
    TOO_MANY_REQUEST = 4009,
    OTP_FAIL = 4013,
    YOU_ARE_NOT_REGISTERED
}
