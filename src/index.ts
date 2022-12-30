import {IgApiClient} from "instagram-private-api";

const ig = new IgApiClient();
ig.state.generateDevice(process.env.IG_USERNAME!);

const login = async () => {
  await ig.simulate.preLoginFlow();
  const loggedInUser = await ig.account.login(process.env.IG_USERNAME!, process.env.IG_PASSWORD!);
}

const getCloseFriends = async () => {
  const feed = ig.feed.bestFriendships()
  const items = await feed.items();
  console.log(items)
  for (const item of items) {
    console.log("AAAAAAAAAAAA")
    console.log(item.username)
    console.log(item.is_bestie)
    console.log(item.full_name)
    console.log(item.profile_pic_id)
  }
}

const removeAllCloseFriend = async () => {
  const removeFriends = [1]
  await ig.friendship.setBesties({
    remove: removeFriends
  })
}

const main = async () => {
  await login()
  await getCloseFriends()
}

main()
