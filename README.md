# discord-money-mongoose
 ![npm](https://img.shields.io/npm/v/discord-money-mongoose?style=for-the-badge) ![NPM](https://img.shields.io/npm/l/discord-money-mongoose?style=for-the-badge) ![npm](https://img.shields.io/npm/dm/discord-money-mongoose?style=for-the-badge)

Money manager for discord.js bots

# Updates!
  - 2.0.0, Updated to discord.js version v12
  - 3.0.0, Rewriten in Typescript .Now should be faster and more compatible, now it has more tools built into it

# Important!
 This module requires discord.js and mongoose preinstalled

# Features!
  - Fetch multiple users
  - Leaderboard ready auto sort dmm.getLeaderboard()
  - get formated RichEmbed Leaderboard for simple use 
  - Set user's money
  - Increase money of a user
  - Decrease money of a user
  - Delete user document
  - Delete multiple user documents
  - Use custom fields for money
  - Custom name for collection
  - Can put custom query resolver
  - Provide a custom model with custom resolver
 
to-do:
  - Suggest what to add next at github


## Guides
  - [Example](#example)
  - [Syntax](#syntax)
    - [getData()](#async-getdatamember-guildmember)
    - [getRawData()](#async-getrawdatamember-guildmember)
    - [getCustomField()](#async-getcustomfieldmember-guildmember-field-string)
    - [getMoney()](#async-getmoneymember-guildmember-customfield-string)
    - [deleteMoney()](#async-deletemoneymember-guildmember)
    - [deleteMany()](#async-deletemanymember-guildmember)
    - [increaseMoney()](#async-increasemoneymember-guildmember-increase-number-customfield-string)
    - [decreaseMoney()](#async-decreasemoneymember-guildmember-decrease-number-customfield-string)
    - [setMoney()](#async-setmoneyguildmember-increase)
    - [increaseMultiple()](#async-increasemultiplemembers-guildmember[]-increase-number-customfield-string)
    - [decreaseMultiple()](#async-decreasemultiplemembers-guildmember-decrease-number-customfield-string)
    - [setMultiple()](#async-setmultiplemembers-guildmember-amount-number-customfield-string)
    - [getMultiple()](#async-getmultiplemembers)
    - [getRawMultiple()](#async-getrawmultiplemembers)
    - [getLeaderboard()](#async-getleaderboardguild-guild-limit-number-options--customfield-string-usefetch-boolean-)
    - [formatLeaderboard()](#async-formatleaderboardguild-guild-options--customfield-string-color-colorresolvable-pagesize-number-page-number-title-string-)
  - [How to](#how-to?)

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

async function init() {

    await connect('MONGO URI', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    const bot = new Client({ disableEveryone: true });

    const money = new DiscordMoneyMongoose();

    bot.on('message', async msg => {
        if (msg.author.bot || !msg.content.startsWith('!')) return;
        if (msg.channel.type === "dm") return;
        const [command, ...args] = msg.content
            .slice('!'.length)
            .split(' ');

        switch (command.toLowerCase()) {
            case "money":
                msg.channel.send(`Money: ${await money.getMoney(msg.member)}`);
                break;
            case "increase":
                await money.increaseMoney(msg.member, args[0])
                msg.channel.send(`Increased by ${args[0]}`);
                break;
            case "decrease":
                money.decreaseMoney(msg.member, args[0]);
                msg.channel.send(`Decreased by ${args[0]}`);
                break;
            case "set":
                money.setMoney(msg.member, args[0]);
                msg.channel.send(`Set to ${args[0]}`);
                break;
            case "usermoney":
                msg.channel.send(`${msg.mentions.members.first()} has ${await money.getMoney(msg.mentions.members.first())} `);
                break;
            case "setusermoney":
                money.setMoney(msg.mentions.members.first(), args[1]);
                msg.channel.send(`Set ${msg.mentions.members.first()} 's money to ${args[1]}`);
                break;
            case "leaderboard":
                msg.channel.send(await money.formatLeaderboard(msg.guild));
                break;
        }
    });

    bot.login('BOT TOKEN');
}

init();
```
# Syntax
### Main
```js
const DiscordMoneyMongoose = require('discord-money-mongoose');
const _DiscordMoneyMongoose = new DiscordMoneyMongoose(options); 
```
## Options
Parameters|info
-|-
modeName| Custom collection name
additionalSchema|Add aditional values to the default schema
customModel|Set to use a custom model
## Options.customModel
  - Defaults to money field if nothing is provided

Parameters|info|required
-|-|-
model|Custom model to use|Yes
query|Custom query filter for finding the user|Recommended
multipleQuery|Query for finding multiple members|No
customGuildIdQuery|Query for finding members inside guild| Needed for leaderboard
```typescript
interface {
    modelName?: string;
    additionalSchema?: SchemaDefinition;
    customModel?: {
        query?: (member: GuildMember) => MongooseFilterQuery<Pick<Document, "_id">>;
        model: Model<Document, {}>;
        multipleQuery?: (members: GuildMember[]) => MongooseFilterQuery<Pick<Document, "_id">>;
        customGuildIdQuery?: (guildID: string) => MongooseFilterQuery<Pick<Document, "_id">>;
    }
}
```
### `async getData(member: GuildMember)`
- Use await when calling function

| Parameters | First           |
|------------|-----------------|
| Input      | `GuildMember` |
| Type       | GuildMember     |

| Returns              | Type   |
|----------------------|--------|
| Members collection document | Promise<Document \| null> |

### `async getRawData(member: GuildMember)`
- Use await when calling function

| Parameters | First           |
|------------|-----------------|
| Input      |`GuildMember` |
| Type       | GuildMember     |

| Returns              | Type   |
|----------------------|--------|
| Members collection document | Promise<Pick<Document, "_id"> \| null> |

### `async getCustomField(member: GuildMember, field: string)`
- Use await when calling function

| Parameters | First           |Second|
|------------|-----------------|-|
| Input      | `GuildMember` |Custom field|
| Type       | GuildMember     |String|

| Returns              | Type   |
|----------------------|--------|
| Members collection document | Promise<Promise<any \| null>> |

### `async getMoney(member: GuildMember, customField?: string)`
- Use await when calling function

| Parameters | First           |Second|
|------------|-----------------|-|
| Input      | `GuildMember` |Custom field|
| Type       | GuildMember     |String|

| Returns              | Type   |
|----------------------|--------|
| User's current money | Promise<number> |

### `async deleteMoney(member: GuildMember)`
- Use await when calling function

| Parameters | First           |
|------------|-----------------|
| Input      | `GuildMember` |
| Type       | GuildMember     |

### `async deleteMany(member: GuildMember)`
- Use await when calling function

| Parameters | First           |
|------------|-----------------|
| Input      | Array of `GuildMember` |
| Type       | GuildMember[]     |

### `async increaseMoney(member: GuildMember, increase: number, customField?: string)`
| Parameters | First           | Second                          |Third|
|------------|-----------------|---------------------------------|-|
| Input      | `GuildMember` | The amount of money to increase |Custom field|
| Type       | GuildMember     | Number                          |string|

### `async decreaseMoney(member: GuildMember, decrease: number, customField?: string)`
| Parameters | First           | Second                          |Third|
|------------|-----------------|---------------------------------|-|
| Input      | A `GuildMember` | The amount of money to decrease |Custom field|
| Type       | GuildMember     | Number                          |string|

### `async setMoney(GuildMember, increase)`
| Parameters | First           | Second                         |Third|
|------------|-----------------|--------------------------------|-|
| Input      | A `GuildMember` | The amount to set user's money |Custom field|
| Type       | GuildMember     | Number                         |string|

### `async increaseMultiple(members: GuildMember[], increase: number, customField?: string)`
| Parameters | First| Second| Third
-|-|-|-
| Input| An array of `GuildMember`s | The amount of money to increase for users | Custom field |
| Type       | Array<GuildMember>         | Number                               | string                       |

### `async decreaseMultiple(members: GuildMember[], decrease: number, customField?: string)`
| Parameters | First| Second| Third
-|-|-|-
| Input| An array of `GuildMember`s | The amount of money to decrease for users | Custom field |
| Type       | Array<GuildMember>         | Number                               | string                       |

### `async setMultiple(members: GuildMember[], amount: number, customField?: string)`
| Parameters | First| Second| Third
-|-|-|-
| Input| An array of `GuildMember`s | The amount of money to set for users | Custom field |
| Type       | Array<GuildMember>         | Number                               | string                       |
### `async getMultiple(members)`
| Parameters | First                      |
|------------|----------------------------|
| Input      | An array of `GuildMember`s |
| Type       | Array<GuildMember>         |

|Returns|Type|
-|-
|Array of member documents|Array<Document>

### `async getRawMultiple(members)`
| Parameters | First                      |
|------------|----------------------------|
| Input      | An array of `GuildMember`s |
| Type       | Array<GuildMember>         |

|Returns|Type|
-|-
|Array of member documents|Array<Document<Pick<"_id", {}>>>

### `async getLeaderboard(guild: Guild, limit: number, options?: { customField?: string, useFetch?: boolean })`
| Parameters | First           |Second|Third
|------------|-----------------|-|-
| Input      | Input a `Guild` |Max number of users returned|Options
| Type       | Guild           |number|Object

### Options

Parameters|Custom field|Use Fetch
-|-|-
Input|Custom field|Use fetch functionallity in discord.js
Type|string|boolean


| Returns                                                                                                    | Type  |
|------------------------------------------------------------------------------------------------------------|-------|
| Array of members and money | Array<{ member: GuildMember, money: number }> |
### `async formatLeaderboard(guild: Guild, options?: { customField?: string, color?: ColorResolvable, pageSize?: number, page?: number, title?: string })`
| Parameters | First           | Second  |
|------------|-----------------|---------|
| Input      | Input a `Guild` | Options |
| Type       | Guild           | Object  |

| Options | customField                       | pageSize           | title              |
|---------|----------------------------|--------------------|--------------------|
| Input   | Custom field | Max members | Title of the embed |
| Type    |string|number|

| Returns                                         | Type      |
|-------------------------------------------------|-----------|
| Returns a `RichEmbed` to be used in discord message | RichEmbed |

#How to?
##### Finishing it later time
## License

This project is licensed under the MIT License 
 - see the [LICENSE](LICENSE) file for details