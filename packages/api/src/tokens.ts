import { getRepository } from "typeorm";
import { Token } from "./entity/Token";
import { User } from "./entity/User";
import users from "./users";

interface TokenParams {
  expires: number;
  accessToken: string;
  refreshToken: string;
  scopes: string;
}

const create = async (userAddress: string, params: TokenParams) => {
  let tokenRepository = getRepository(Token);
  let token = tokenRepository.create(params);
  await tokenRepository.save(token);
  let user = await users.find(userAddress);
  if (user) {
    user.token = token;
    return getRepository(User).save(user);
  }
};

const findByUser = async (address: string) => {
  let user = await getRepository(User).findOne(
    { address: address },
    { relations: ["session", "token"] }
  );
  return user?.token;
};

export default {
  create: create,
  findByUser: findByUser,
};
