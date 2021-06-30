import { getRepository } from "typeorm";
import { Token } from "./entity/Token";
import { User } from "./entity/User";

interface TokenParams {
  user: User;
  expires: number;
  accessToken: string;
  refreshToken: string;
  scopes: string;
}

const create = async (params: TokenParams) => {
  let { user, ...tokenParams } = params;
  let tokenRepository = getRepository(Token);
  let token = tokenRepository.create(tokenParams);
  await tokenRepository.save(token);
  user.token = token;
  return getRepository(User).save(user);
};

const findByUser = async (userId: number) => {
  let user = await getRepository(User).findOne(
    { id: userId },
    { relations: ["token"] }
  );
  return user?.token;
};

export default {
  create: create,
  findByUser: findByUser,
};
