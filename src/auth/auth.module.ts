import {Module, Scope} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {HttpModule} from "nestjs-http-promise";
import {RedisConnection} from "../redis-connection/redis-connection";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";

@Module({
    imports: [HttpModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        PassportModule, JwtModule.register({
            secret: '*es(aJ$KQ9SWZG&Mj7ZxV$_@GF=Vz7txqUG!kA%p.w<(Vu6q5FB',
            signOptions: {
              expiresIn: '120d',
            },
          }),],
    controllers: [AuthController],
    providers: [AuthService, {
        provide: "REDIS_CONNECTION",
        scope: Scope.DEFAULT,
        useFactory: () => new RedisConnection().getInstance({
            REDIS_HOST: process.env.REDIS_HOST,
            REDIS_PORT: process.env.REDIS_PORT,
            REDIS_DB: parseInt(process.env.REDIS_DB_NUMBER),
        })
    }
    ],

})
export class AuthModule {
}