import {Body, Controller, Get, Post, Query} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {AuthRegisterDto} from "../domain/dto/auth.register.dto";
import {AuthVerifyDto} from "../domain/dto/auth.verify.dto";
import {AuthLogInDto} from "../domain/dto/auth.login.dto";
import { query } from "express";
import { RefreshTokenDto } from "src/domain/dto/refresh-tokem.dto";

@Controller("auth")
export class AuthController {

    constructor(
        private authService: AuthService,
    ) {
    }


    @Post("/register")
    async register(
        @Body() authRegisterDto: AuthRegisterDto,
        @Query() query,
    ) {
        return await this.authService.register(authRegisterDto);
    }

    @Post("/verify")
    async verify(
        @Body() authRegisterDto: AuthVerifyDto
    ) {
        return this.authService.verify(authRegisterDto)
    }

    @Post("/login")
    signIn(@Body()authLogInDto:AuthLogInDto){
        return this.authService.login(authLogInDto);
    }


    @Post("/register/forgot/password")
    async registerForgotPassword(
        @Body() authRegisterDto:AuthRegisterDto,
        @Query()query,
    ){
        return await this.authService.register(authRegisterDto);

    }

    @Post("verify/forgot/password")
    async verifyForgotPassword(
        @Body() authRegisterDto: AuthVerifyDto
    ) {
        return this.authService.verify(authRegisterDto)
    }

    @Post("/refresh-token")
    async refreshToken(
        @Body() refreshTokenDto:RefreshTokenDto
    ){
        return this.authService.refreshToken(refreshTokenDto)
    }

}