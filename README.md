# discord-money-mongoose
 ![npm](https://img.shields.io/npm/v/discord-money-mongoose?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/discord-money-mongoose?style=for-the-badge) ![npm](https://img.shields.io/npm/dm/discord-money-mongoose?style=for-the-badge)

Money manager for discord.js bots

# Features!

  - Economy
  -- Fetch multiple users
  -- Leaderboard ready auto sort dmm.getLeaderboard()
  -- get formated RichEmbed Leaderboard for simple use 
  -- Set user's money
  -- Increase money of a user
  -- Decrease money of a user


to-do:
  - Suggest what to add next at github


### Installation

```sh
$ npm install discord-money-mongoose
```

### Example
   - Here's a example of using this module
```js
const DiscordMoneyMongoose = require('discord-money-mongoose');
const { Client } = require('discord.js');
const { connect } = require('mongoose');

const bot = new Client({ disableEveryone: true });
connect('url', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const money = new DiscordMoneyMongoose();

bot.on('message', async msg =>
{
    if (msg.author.bot || !msg.content.startsWith('!')) return;
    const [command, ...args] = msg.content
        .slice('!'.length)
        .split(' ');

    if (command === 'money')
        msg.channel.send(`Money: ${await money.getMoney(msg.member)}`);
    else
        if (command === 'increase') {
            money.increaseMoney(msg.member, args[0] || 1);
            msg.channel.send(`Increased by ${args[0] || 1}`);
        } else if (command === 'decrease') {
            money.decreaseMoney(msg.member, args[0] || 1);
            msg.channel.send(`Decreased by ${args[0] || 1}`);
        } else if (command === 'set') {
            money.setMoney(msg.member, args[0] || 1);
            msg.channel.send(`Set to ${args[0] || 1}`);
        } else if (command === 'usermoney')
            msg.channel.send(`${msg.mentions.members.first()} has ${await money.getMoney(msg.mentions.members.first())} `);
        else if (command === 'setusermoney') {
            money.setMoney(msg.mentions.members.first(), args[1]);
            msg.channel.send(`Set ${msg.mentions.members.first()} 's money to ${args[1]}`);
        } else if (command === 'lb')
            msg.channel.send(await money.formatLeaderboard(msg.guild));
});

bot.login('TOKEN');

```
# Syntax
### Main
```js
const DiscordMoneyMongoose = require('discord-money-mongoose');
const _DiscordMoneyMongoose = new DiscordMoneyMongoose('ModelName'); 
```
### `async getMoney(GuildMember)`
- Use await when calling function

| Parameters | First           |
|------------|-----------------|
| Input      | A `GuildMember` |
| Type       | GuildMember     |

| Returns              | Type   |
|----------------------|--------|
| User's current money | Number |

### `increaseMoney(GuildMember, increase)`
| Parameters | First           | Second                          |
|------------|-----------------|---------------------------------|
| Input      | A `GuildMember` | The amount of money to increase |
| Type       | GuildMember     | Number                          |

### `.decreaseMoney(GuildMember, decrease)`
| Parameters | First           | Second                          |
|------------|-----------------|---------------------------------|
| Input      | A `GuildMember` | The amount of money to decrease |
| Type       | GuildMember     | Number                          |

### `setMoney(GuildMember, increase)`
| Parameters | First           | Second                         |
|------------|-----------------|--------------------------------|
| Input      | A `GuildMember` | The amount to set user's money |
| Type       | GuildMember     | Number                         |

### `setMultiple(members, money, updateInMultipleGuilds)`
| Parameters | First                      | Second                               | Third                         |
|------------|----------------------------|--------------------------------------|-------------------------------|
| Input      | An array of `GuildMember`s | The amount of money to set for users | Don't limit to only one guild |
| Type       | Array<GuildMember>         | Number                               | Boolean                       |
### `async getMultiple(members, searchMultipleGuilds = false)`
| Parameters | First                      | Second                        |
|------------|----------------------------|-------------------------------|
| Input      | An array of `GuildMember`s | Don't limit to only one guild |
| Type       | Array<GuildMember>         | Boolean                       |

| Returns                                                                                              | Type  |
|------------------------------------------------------------------------------------------------------|-------|
| Returns array of `{ member: GuildMember, money: Number }` `MUST USE AWAIT OR IT WILL RETURN PROMISE` | Array |
### `async getLeaderboard(guild)`
| Parameters | First           |
|------------|-----------------|
| Input      | Input a `Guild` |
| Type       | Guild           |

| Returns                                                                                                    | Type  |
|------------------------------------------------------------------------------------------------------------|-------|
| returns {nickname: 'usernickname', username: 'username of the user', guildID: 'guildid', userID: 'userid'} | Array |
### `async formatLeaderboard(guild, options = {})`
| Parameters | First           | Second  |
|------------|-----------------|---------|
| Input      | Input a `Guild` | Options |
| Type       | Guild           | Object  |

| Options | page                       | pageSize           | title              |
|---------|----------------------------|--------------------|--------------------|
| Input   | The page number to display | Size for each page | Title of the embed |
| Type    | Number                     | Number             | String             |

| Returns                                         | Type      |
|-------------------------------------------------|-----------|
| Returns a `RichEmbed` to be used in discord msg | RichEmbed |
## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details