import {IsInt, IsNotEmpty, IsString, Max, min, Min} from "class-validator";

export class AuthVerifyDto {

    @IsNotEmpty()
    @IsInt()
    otp_code: number;

    @IsNotEmpty()
    @IsString()
    @Min(8)
    password: string;
    @IsNotEmpty()
    @IsString()
    @Min(8)
    repeat_password: string;


    @IsNotEmpty()
    @IsString()
    uuid_code: string

}