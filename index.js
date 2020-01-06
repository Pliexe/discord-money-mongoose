const { GuildMember, Guild, RichEmbed } = require('../discord.js/src/index');
const { Schema, model, connection, models } = require('../mongoose/index');
const splitIntoPile = require('split-into-pile');

function moneyModel(name = String)
{
    return models[name] ? model(name) : model(name, Schema({
        userID: String,
        guildID: String,
        money: Number
    }));
}

class MoneySystem
{
    /**
     * 
     * @param {Object} options - Options below
     * 
     * @param {String} options.modelName Set the name of the model where it writes the data. Used for storing multiple currencies
     */

    constructor(options = Object)
    {
        if (connection.readyState === 0) throw new Error("Connect to database first! mongoose.connect()");
        options = options || {};
        this.model = moneyModel(options.modelName || 'money');
    }

    /**
     * Returns a user's balanaced/money, `MUST USE AWAIT`
     * @param {GuildMember} guildmember Takes a **GuildMember**
     * @example
     * _MoneySystem = new MoneySystem();
     * console.log(await _MoneySystem.getMoney());
     * @returns {Number|Promise} Returns the user's money `IF AWAIT IS NOT USED IT RETURNS THE PROMISE`
     */
    async getMoney(guildmember = GuildMember)
    {
        let data = await this.model.findOne({ userID: guildmember.id, guildID: guildmember.guild.id });
        if (!data) {
            (new this.model({
                userID: guildmember.id,
                guildID: guildmember.guild.id,
                money: 0
            })).save().catch(err => console.log(err));
            return 0;
        } else
            return data.money;
    }

    /**
     *  Increases money of a specific guild member
     * @param {GuildMember} guildmember Takes a **GuildMember**
     * @param {Number} increase Takes a **Number** and increases user's money by amount given
     */
    increaseMoney(guildmember = GuildMember, increase = Number)
    {
        if (!(guildmember instanceof GuildMember)) throw new Error('First parameter may only be a `GuildMember`');
        if (isNaN(increase)) throw new Error('Second parameter(increase) must be a `number`');
        if (!(increase instanceof Number)) increase = parseFloat(increase);
        this.model.findOne({ userID: guildmember.id, guildID: guildmember.guild.id }, (err, data) =>
        {
            if (err) throw err;

            if (!data)
                (new this.model({
                    userID: guildmember.id,
                    guildID: guildmember.guild.id,
                    money: increase
                })).save().catch(err => console.log(err));
            else {
                data.money += increase;
                data.save().catch(err => console.log(err));
            }
        });
    }

    /**
     * Decreases money of a specific guild member
     * @param {GuildMember} guildmember Takes a **GuildMember**
     * @param {Number} decrease Takes a **Number** and decreases the user's money by the amount given
     */
    decreaseMoney(guildmember = GuildMember, decrease = Number)
    {
        if (!(guildmember instanceof GuildMember)) throw new Error('First parameter may only be a `GuildMember`');
        if (isNaN(decrease)) throw new Error('Second parameter(decrease) must be a `number`');
        if (!(decrease instanceof Number)) decrease = parseFloat(decrease);
        this.model.findOne({ userID: guildmember.id, guildID: guildmember.guild.id }, (err, data) =>
        {
            if (err) throw err;

            if (!data)
                (new this.model({
                    userID: guildmember.id,
                    guildID: guildmember.guild.id,
                    money: -1 * decrease
                })).save().catch(err => console.log(err));
            else {
                data.money -= decrease;
                data.save().catch(err => console.log(err));
            }
        });
    }

    /**
     * Sets money of a specific guild member
     * @param {GuildMember} guildmember Takes a **GuildMember**
     * @param {Number} money Takes a **Number** that will set the user's new balance/money
     */
    setMoney(guildmember = GuildMember, money = Number)
    {
        if (!(guildmember instanceof GuildMember)) throw new Error('First parameter may only be a `GuildMember`');
        if (isNaN(money)) throw new Error('Second parameter(money) must be a `number`');
        if (!(money instanceof Number)) money = parseFloat(money);
        this.model.findOne({ userID: guildmember.id, guildID: guildmember.guild.id }, (err, data) =>
        {
            if (err) throw err;

            if (!data)
                (new this.model({
                    userID: guildmember.id,
                    guildID: guildmember.guild.id,
                    money: money
                })).save().catch(err => console.log(err));
            else {
                data.money = money;
                data.save().catch(err => console.log(err));
            }
        });
    }

    /**
     * 
     * @param {Object} members Takes a **Array** of **GuildMember**s
     * @param {Number} money The money to set for these users
     * @param {Boolean} updateInMultipleGuilds Update in multiple guilds
     * @example
     * _MoneySystem = new MoneySystem();
     * _MoneySystem.setMultiple([GuildMember, GuildMember], 50);
     */
    setMultiple(members, money, updateInMultipleGuilds = false)
    {
        if (!members) throw new Error('First parameter missing');
        if (!money) throw new Error('Second parameter missing');
        if (!Array.isArray(members)) throw new Error('First parameter may only be an array');
        if (isNaN(money)) throw new Error('Second parameter(money) may only be a Number');
        if (!(typeof updateInMultipleGuilds === 'boolean')) throw new Error('Third parameter(updateInMultipleGuilds) may only be a **Boolean**');
        money = parseFloat(money);
        if (!(members.every(m => m instanceof GuildMember))) throw new Error("Invalid array, all elements in array must be **GuildMember**");
        if (!members.every(m => !m.user.bot)) throw new Error('Bot may not have balance assigned to them.');
        if (!updateInMultipleGuilds && !members.every(m => m.guild.id === members[0].guild.id)) throw new Error('Every member must be in same guild, or set updateInMultipleGuilds parameter to true!');

        this.model.updateMany({ guildID: updateInMultipleGuilds ? { $in: members.map(m => m.guild.id) } : members[0].guild.id, userID: { $in: members.map(m => m.id) } }, { money: money }).exec();
    }

    /**
     * Returns money of multiple users `MUST USE AWAIT OR IT WILL RETURN PROMISE`
     * @param {Array<GuildMember>} members Takes a **Array** of **GuildMember**s
     * @param {Boolean} searchMultipleGuilds Do search in multiple guilds
     * @returns {Array<model>} Returns array of `{ member: GuildMember, money: Number }` `MUST USE AWAIT OR IT WILL RETURN PROMISE`
     */
    async getMultiple(members, searchMultipleGuilds = false)
    {
        if (!members) throw new Error('First parameter missing');
        if (!Array.isArray(members)) throw new Error('First parameter may only be an array');
        if (!(typeof searchMultipleGuilds === 'boolean')) throw new Error('Second parameter(searchMultipleGuilds) may only be a **Boolean**');
        return await this.model.find({ guildID: updateInMultipleGuilds ? { $in: members.map(m => m.guild.id) } : members[0].guild.id, userID: { $in: members.map(m => m.id) } }).exec();
    }

    /**
     * Get array sorted to be used as lb later
     * @param {Guild} guild Takes a **Guild**
     * @returns {Array} returns {nickname: 'usernickname', username: 'username of the user', guildID: 'guildid', userID: 'userid'}
     */
    async getLeaderboard(guild)
    {
        return (await this.model.find({ guildID: guild.id }).exec())
            .map(m => ({ nickname: guild.members.get(m.userID).nickname, username: guild.members.get(m.userID).user.username, guildID: m.guildID, userID: m.userID, money: m.money }))
            .sort((a, b) => (a.money < b.money) ? 1 : ((b.money < a.money) ? -1 : 0));
    }

    /**
     * Returns formated RichEmbed message
     * @param {Guild} guild Takes a **Guild**
     * @param {Object} options
     * @param {Number} options.page The page number to display
     * @param {Number} options.pageSize Size for each page
     * @param {String} options.title The title of the embed
     * @param {} options.colour Embed color
     * @example
     * var _MoneySystem = new MoneySystem();
     * message.channel.send(_MoneySystem.formatLeaderboard(guild));
     * @returns {RichEmbed} Returns a **RichEmbed** that is formated to the leaderboard
     */
    async formatLeaderboard(guild, options = {})
    {
        let data = await this.getLeaderboard(guild);
        options.pageSize = options.pageSize || 10;
        options.page = options.page || 1;
        data = (new splitIntoPile(data, options.pageSize)).ArrayPages();

        let str = '';
        for (var i = 0; i < data[options.page - 1].length; i++)
            str += `\n${(i + 1) + ((options.page * options.pageSize) - options.pageSize)}# - ${data[options.page - 1][i].username} | ${data[options.page - 1][i].money}$`;

        let embed = new RichEmbed()
            .setTitle(options.title || 'Leaderboard')
            .setColor(options.colour || 0xb06305)
            .setDescription(str)
            .setTimestamp();

        return embed;
    }
}

module.exports = MoneySystem;