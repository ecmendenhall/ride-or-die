import { getRepository } from "typeorm";
import { Session } from "./entity/Session";
import { User } from "./entity/User";

interface SessionParams {
  user: User;
  expires: number;
  nonce: string;
}

const create = async (params: SessionParams) => {
  let { user, ...sessionParams } = params;
  let sessionRepository = getRepository(Session);
  let session = sessionRepository.create(sessionParams);
  await sessionRepository.save(session);
  user.session = session;
  return getRepository(User).save(user);
};

const findByUser = async (userId: number) => {
  let user = await getRepository(User).findOne(
    { id: userId },
    { relations: ["session"] }
  );
  return user?.session;
};

export default {
  create: create,
  findByUser: findByUser,
};
