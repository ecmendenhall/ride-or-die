import { getRepository } from "typeorm";
import { User } from "./entity/User";

interface UserParams {
  address: string;
  stravaId?: number;
}

const create = async (params: UserParams) => {
  let repository = getRepository(User);
  let user = repository.create(params);
  return repository.save(user);
};

const update = async (address: string, params: UserParams) => {
  let repository = getRepository(User);
  let user = await find(address);
  if (user) {
    return repository.update(user, params);
  }
};

const find = async (address: string) => {
  return getRepository(User).findOne(
    { address: address },
    { relations: ["session"] }
  );
};

export default {
  create: create,
  update: update,
  find: find,
};
