import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpService } from 'nestjs-http-promise';
import { RedisClient } from 'redis';
import { promisify } from 'util';
import { SuccessResponse } from '../domain/responses/success.response';
import { AuthRegisterDto } from '../domain/dto/auth.register.dto';
import { User } from '../domain/entity/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { ErrorResponse } from '../domain/responses/error.response';
import { StatusCode } from '../domain/enums/status.code.enum';
import { AuthVerifyDto } from '../domain/dto/auth.verify.dto';
import { AuthLogInDto } from '../domain/dto/auth.login.dto';
import { JwtService } from '@nestjs/jwt';
import { log } from 'console';
import { RefreshTokenDto } from 'src/domain/dto/refresh-tokem.dto';
import { userInfo } from 'os';
import jwt_decode from 'jwt-decode';
import { isPhoneNumber } from 'class-validator';

let crypto = require('crypto');

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private http: HttpService,
    @Inject('REDIS_CONNECTION') private redis: RedisClient,
  ) {}

  redisFunc = {
    set: async (key, value) => {
      const set = promisify(this.redis.set).bind(this.redis);
      return await set(key, value);
    },
    exists: async (key) => {
      const func = promisify(this.redis.exists).bind(this.redis);
      return await func(key);
    },
    keys: async () => {
      const keys = promisify(this.redis.keys).bind(this.redis);
      return await keys('*');
    },
    del: async (address) => {
      const del = promisify(this.redis.del).bind(this.redis);
      return await del(address);
    },
    get: async (key) => {
      const get = promisify(this.redis.get).bind(this.redis);
      return get(key);
    },
    hmset: async (key, value) => {
      const hmset = promisify(this.redis.hmset).bind(this.redis);
      return await hmset(key, value);
    },
    hmget: async (key, value) => {
      const hmGet = promisify(this.redis.hmget).bind(this.redis);
      return hmGet(key, value);
    },
    expire: async (key, time) => {
      const expire = promisify(this.redis.expire).bind(this.redis);
      return expire(key, time);
    },
  };

  async sendToFinotech(data) {
    try {
      await this.http.post(
        `https://apibeta.finnotech.ir/facility/v2/clients/maxpool/finnotext?trackId=${randomUUID()}`,
        data,
        {
          headers: {
            Authorization: process.env.AUTH_FINOTECH,
            'Content-Type': 'application/json',
          },
        },
      );

      //todo check failure cases
      // if (res.status==200 && res?.data?.status===FinitechStatusEnum.DONE){ }
    } catch (e) {
      return new ErrorResponse(StatusCode.BAD_REQUEST, {
        data: 'Phone_number Is Incorrect!',
      });
    }
  }

  async register(authRegisterDto: AuthRegisterDto) {
    try {
      const uuidCode = uuidv4();

      const otp_number = Math.floor(100000 + Math.random() * 900000);

      const data = {
        from: '20002323',
        to: [authRegisterDto.phone_number],
        message: [otp_number],
      };
      const value = {
        otp_number: otp_number,
        phone_number: authRegisterDto.phone_number,
      };

      const getKey = await this.redisFunc.get(authRegisterDto.phone_number);

      if (getKey) {
        return new ErrorResponse(StatusCode.TOO_MANY_REQUEST, {
          data: 'Too Many Request!',
        });
      } else {
        await this.redisFunc.hmset(uuidCode, value);
        await this.redisFunc.expire(uuidCode, process.env.EXP_UUID_TIME);

        await this.redisFunc.set(authRegisterDto.phone_number, true);
        await this.redisFunc.expire(authRegisterDto.phone_number, 90);
        this.sendToFinotech(data).then();

        return new SuccessResponse(StatusCode.OK, {
          data: 'OTP send',
          uuid_code: uuidCode,
        });
      }
    } catch (e) {
      return new ErrorResponse(StatusCode.BAD_REQUEST, {
        data: 'Phone_number Is Incorrect!',
      });
    }
  }

  async verify(authVerifyDto: AuthVerifyDto) {
    let phone_number = await this.redisFunc.hmget(
      authVerifyDto.uuid_code,
      'phone_number',
    );

    if (phone_number[0] === null) {
      return new ErrorResponse(StatusCode.NOT_FOUND, {
        data: 'Phone_number Did Not Find!',
      });
    }
    const phone_number_redis = String(phone_number[0]);

    const user = new User();
    const hash = crypto
      .createHash('sha256')
      .update(authVerifyDto.password)
      .digest('base64');
    user.phone_number = phone_number_redis;
    user.password = hash;

    try {
      let otp_code = await this.redisFunc.hmget(
        authVerifyDto.uuid_code,
        'otp_number',
      );

      otp_code = String(otp_code[0]);
      if (
        String(authVerifyDto.otp_code) === otp_code &&
        authVerifyDto.repeat_password === authVerifyDto.password
      ) {
        try {
          const users = await User.findOne({
            where: { phone_number: phone_number_redis },
          });
          if (users) {
            return new ErrorResponse(StatusCode.BAD_REQUEST, {
              data: 'user already exists',
            });
          } else {
            await user.save();
            return new SuccessResponse(StatusCode.CREATED, {
              data: 'User Created Successfully.',
            });
          }
        } catch (e) {
          return new ErrorResponse(StatusCode.BAD_REQUEST, {
            data: 'DB Error',
          });
        }
      } else {
        return new ErrorResponse(
          StatusCode.OTP_OR_PASS_INCORRECT,
          {
            data: 'OTP or Password Dose Not Match!',
          } /*|| "Password And Repeat_password Do Not Match!"*/,
        );
      }
    } catch (error) {
      return new ErrorResponse(StatusCode.BAD_REQUEST, { data: '!' });
    }
  }

  async login(authLogInDto: AuthLogInDto) {
    const user = await User.findOne({
      where: { phone_number: authLogInDto.phone_number },
    });

    if (!user) {
      return new ErrorResponse(StatusCode.YOU_ARE_NOT_REGISTERED, {
        data: 'You are not registered!',
      });
    } else {
      const hash = crypto
        .createHash('sha256')
        .update(authLogInDto.password)
        .digest('base64');
      const userPass = await User.findOne({ where: { password: hash } });

      if (hash === userPass.password) {
        const payload = {
          userId: user.id,
          type: 'accessToken',
        };
        const token = this.jwtService.sign(payload);
        const refreshToken = await this.getJwtRefreshToken(user.id);

        await this.redisFunc.set(user.id, refreshToken);
        await this.redisFunc.expire(refreshToken, process.env.EXP_TOKEN_TIME);

        return new SuccessResponse(StatusCode.OK, {
          data: {
            access_token: { token, expiresIn: '2d' },
            refresh_token: { refreshToken, expiresIn: '30d' },
          },
        });
      } else {
        return new ErrorResponse(StatusCode.PASSWORD_MISMATCH, {
          data: 'Your password is incorrect!',
        });
      }
    }
  }

  async getJwtRefreshToken(userId: number) {
    const user = await User.findOne({ where: { id: userId } });
    const payload = { userId: user.id, type: 'refreshToken' };
    const token = this.jwtService.sign(payload, {
      secret: '*es(aJ$KQ9SWZG&Mj7ZxV$_@GF=Vz7txqUG!kA%p.w<(Vu6q5FB',
      expiresIn: '120d',
    });

    return token;
  }
  async createToken(userId: number) {
    const expiresIn = '2d';
    const userInfo = { userId: userId, type: 'accessToken' };
    const token = this.jwtService.sign(userInfo);

    return {
      expires_in: expiresIn,
      access_token: token,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto) {
    const decode: any = jwt_decode(refreshTokenDto.refreshToken);

    const user = await User.findOne({ where: { id: decode.userId } });
    const getKey = await this.redisFunc.get(decode.userId);

    if (getKey === refreshTokenDto.refreshToken) {
      const { refreshToken } = refreshTokenDto;
      const verifyToken = this.jwtService.verify(refreshToken, {
        secret: '*es(aJ$KQ9SWZG&Mj7ZxV$_@GF=Vz7txqUG!kA%p.w<(Vu6q5FB',
      });
      if (verifyToken) {
        const accessToken = await this.createToken(user.id);
        const newRefreshToken = await this.getJwtRefreshToken(user.id);
        return {
          access_token: accessToken,
          refresh_token: { newRefreshToken, expiresIn: '340d' },
        };
      } else {
        return new ErrorResponse(StatusCode.NOT_FOUND, {
          data: 'Refresh_TOken Not coorect!',
        });
      }
    }
  }
}
