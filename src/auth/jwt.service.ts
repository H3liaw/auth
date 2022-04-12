import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:'*es(aJ$KQ9SWZG&Mj7ZxV$_@GF=Vz7txqUG!kA%p.w<(Vu6q5FB',
    });
  }

  async validate(payload: any) {
    console.log('@@@@@@@ PAYLOAD JWT STG,', payload);
    return null;
  }
}
