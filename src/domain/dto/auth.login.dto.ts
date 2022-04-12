import {IsNotEmpty, IsString, Max, Min} from "class-validator";

export class AuthLogInDto {

    @IsNotEmpty()
    @Min(11)
    @Max(12)
    phone_number: string

    @IsNotEmpty()
    @IsString()
    @Min(8)
    password: string

}