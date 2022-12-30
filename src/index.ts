import {IgApiClient} from "instagram-private-api";
import * as fs from "fs";
import {stringify} from "csv-stringify/sync";
import {AccountRepositoryLoginResponseLogged_in_user} from "instagram-private-api/dist/responses";
import {parse} from "csv-parse/sync";

type Friend = {
  pk: number
  username: string
  full_name: string
  profile_pic_url: string
}

// @ts-ignore
let ig: IgApiClient = undefined;
// @ts-ignore
let user: AccountRepositoryLoginResponseLogged_in_user = undefined;

const login = async () => {
  ig = new IgApiClient();
  ig.state.generateDevice(process.env.IG_USERNAME!);
  // await ig.simulate.preLoginFlow();
  user = await ig.account.login(process.env.IG_USERNAME!, process.env.IG_PASSWORD!);
}

const getCloseFriends = async (): Promise<Friend[]> => {
  const feed = ig.feed.bestFriendships()
  const items = await feed.items();
  let friends: Friend[] = [];
  for (const item of items) {
    friends.push({
        username: item.username,
        full_name: item.full_name,
        pk: item.pk,
        profile_pic_url: item.profile_pic_url,
      }
    )
  }
  return friends;
}

const getFollowings = async (): Promise<Friend[]> => {
  const followingsFeed = ig.feed.accountFollowing(user.pk);
  let friends: Friend[] = [];
  const items = await followingsFeed.items();
  console.log(`ITEM LENGTH IS: ${items.length}`)
  for (const item of items) {
    friends.push({
      username: item.username,
      full_name: item.full_name,
      pk: item.pk,
      profile_pic_url: item.profile_pic_url,
    })
  }
  return friends
}

const removeAllCloseFriend = async () => {
  const friends = await getCloseFriends()
  const pks = friends.map(f => f.pk);
  await ig.friendship.setBesties({
    remove: pks
  })
}

const addCloseFriend = async (pks: string[]) => {
  await ig.friendship.setBesties({
    add: pks
  })
}

const saveCSV = (data: any, filepath: string) => {
  const csvString = stringify(data, {
    header: true
  });
  fs.writeFileSync(filepath, csvString);
}

const readCSV = (filepath: string): any => {
  const data = fs.readFileSync(filepath);
  const records = parse(data, {
    columns: true
  });
  return records;
}

const switchCloseFriend = async (filepath: string, type: string) => {
  const data = readCSV(filepath)
  const pks: string[] = data.filter((d: any) => d["type"] === type)
    .map((d: any) => d["pk"])
  if (pks.length === 0) {
    return
  } else {
    console.log(`${pks.length} users is detected`)
  }

  await login()
  await removeAllCloseFriend()
  await addCloseFriend(pks);
}

const main = async () => {
  // await login()
  // await getCloseFriends()
  // await removeAllCloseFriend()
  // const followings = await getFollowings();
  // saveCSV(followings, "csv/followings.csv")
}


switchCloseFriend("csv/output.csv", "")
