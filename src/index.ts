//@ts-ignore
import { GuildMember, Guild, MessageEmbed, ColorResolvable } from '../../discord.js/src/index';
// @ts-ignore
import { connection, models, Schema, model, Document, Model, MongooseFilterQuery, SchemaDefinition, DocumentQuery, QueryHelpers } from '../../mongoose/index';

interface IOptions {
    modelName?: string;
    additionalSchema?: SchemaDefinition;
    // startingMoney?: number;
    customModel?: {
        query?: (member: GuildMember) => MongooseFilterQuery<Pick<Document, "_id">>;
        model: Model<Document, {}>;
        multipleQuery?: (members: GuildMember[]) => MongooseFilterQuery<Pick<Document, "_id">>;
        customGuildIdQuery?: (guildID: string) => MongooseFilterQuery<Pick<Document, "_id">>;
    }
    // customModel
}

function moneyModel(name: string, startingMoney: number, as: SchemaDefinition | undefined) {
    return models[name] ? model(name) : model(name, new Schema(!as ? {
        _id: {
            type: String,
            required: true
        },
        money: {
            type: Number,
            default: startingMoney
        }
    } : {
            ...{
                _id: {
                    type: String,
                    required: true
                },
                money: {
                    type: Number,
                    default: startingMoney
                }
            },
            ...as
        }));
}

class MoneySystem {
    private model: Model<Document, {}>;
    private startingMoney: number = 0;
    private query: (member: GuildMember) => MongooseFilterQuery<Pick<Document, "_id">> = (member) => ({ _id: member.guild.id + member.id });
    private multipleQuery: (members: GuildMember[]) => MongooseFilterQuery<Pick<Document, "_id">> = (members) => ({ _id: { $in: members.map(m => m.guild.id + m.id) } });
    private guildQuery: (guildID: string) => MongooseFilterQuery<Pick<Document, "_id">> = (guildID: string) => ({ _id: { $regex: new RegExp(guildID) } });
    private doSafetyCheck: boolean = true;

    constructor(options?: IOptions) {
        if (connection.readyState === 0) throw new Error("Connect to database first! mongoose.connect()");
        options = options || {};

        // if (options.startingMoney) this.startingMoney = options.startingMoney;

        if (options.customModel) {
            if (!options.customModel.model) throw new Error("You must provide the custom model if you choose to provide customModel propety");
        }

        this.model = options.customModel ? options.customModel.model : moneyModel(options.modelName || 'money', this.startingMoney, options.additionalSchema)
        if (options.customModel)
            if (options.customModel.query)
                this.query = options.customModel.query;
        if (options.customModel)
            if (options.customModel.multipleQuery)
                this.multipleQuery = options.customModel.multipleQuery;
        if (options.customModel)
            if (options.customModel.customGuildIdQuery)
                this.guildQuery = options.customModel.customGuildIdQuery;
    }

    async getData(member: GuildMember): Promise<Document | null> {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);


        try {
            return await this.model.findOne(this.query(member));
        } catch (e) {
            throw e;
        }
    }

    async getRawData(member: GuildMember): Promise<Pick<Document, "_id"> | null> {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);


        try {
            return await this.model.findOne(this.query(member)).lean();
        } catch (e) {
            throw e;
        }
    }

    async getCustomField(member: GuildMember, field: string): Promise<any | null> {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (!field) throw new Error(`Invalid syntax, second (field) parameter undefined`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);


        try {
            let data = await this.model.findOne(this.query(member));

            if (!data) return null;
            else return data.get(field);
        } catch (e) {
            throw e;
        }
    }

    // async getMultipleCurrencies(member: GuildMember, fields: { field:  })

    async getMoney(member: GuildMember, customField?: string): Promise<number> {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);


        try {
            let data = await this.model.findOne(this.query(member));

            if (!data)
                return this.startingMoney;
            else if (!data.get(customField ? customField : "money"))
                return this.startingMoney;
            else
                return data.get(customField ? customField : "money")
        } catch (e) {
            throw e;
        }
    }

    async deleteMoney(member: GuildMember) {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);

        try {
            return await this.model.deleteOne(this.query(member));
        } catch (e) {
            throw e;
        }
    }

    async deleteMany(members: GuildMember) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.deleteMany(this.multipleQuery(members));
        } catch (e) {
            throw e;
        }
    }

    async increaseMoney(member: GuildMember, increase: number, customField?: string) {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (increase == null) throw new Error(`Invalid syntax, second (increase) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);
        if (isNaN(increase)) throw new Error(`Invalid second (increase) parameter, Expected number but got ${typeof increase}`);


        try {
            return await this.model.updateOne(this.query(member), {
                $inc: customField ? { [customField]: increase } : { money: increase }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async decreaseMoney(member: GuildMember, decrease: number, customField?: string) {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (decrease == null) throw new Error(`Invalid syntax, second (decrease) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);
        if (isNaN(decrease)) throw new Error(`Invalid second (decrease) parameter, Expected number but got ${typeof decrease}`);


        try {
            return await this.model.updateOne(this.query(member), {
                $inc: customField ? { [customField]: -decrease } : { money: -decrease }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async setMoney(member: GuildMember, amount: number, customField?: string) {
        if (!member) throw new Error(`Invalid syntax, first (member) parameter undefined`);
        if (amount == null) throw new Error(`Invalid syntax, second (amount) parameter undefined`);
        if (!member.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.id`);
        if (!member.guild) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild`);
        if (!member.guild.id) throw new Error(`Invalid first (member) parameter, Expected object to have member.guild.id`);
        if (isNaN(amount)) throw new Error(`Invalid second (amount) parameter, Expected number but got ${typeof amount}`);


        try {
            return await this.model.updateOne(this.query(member), {
                $set: customField ? { [customField]: amount } : { money: amount }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async increaseMultiple(members: GuildMember[], increase: number, customField?: string) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (increase == null) throw new Error(`Invalid syntax, second (increase) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.update(this.multipleQuery(members), {
                $inc: customField ? { [customField]: increase } : { money: increase }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async decreaseMultiple(members: GuildMember[], decrease: number, customField?: string) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (decrease == null) throw new Error(`Invalid syntax, second (decrease) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.update(this.multipleQuery(members), {
                $inc: customField ? { [customField]: -decrease } : { money: -decrease }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async setMultiple(members: GuildMember[], amount: number, customField?: string) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (amount == null) throw new Error(`Invalid syntax, second (amount) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.update(this.multipleQuery(members), {
                $set: customField ? { [customField]: amount } : { money: amount }
            }, {
                upsert: true,
                setDefaultsOnInsert: true
            });
        } catch (e) {
            throw e;
        }
    }

    async getMultiple(members: GuildMember[]) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.find(this.multipleQuery(members));
        } catch (e) {
            throw e;
        }
    }

    async getRawMultiple(members: GuildMember[]) {
        if (!members) throw new Error(`Invalid syntax, first (members) parameter undefined`);
        if (!Array.isArray(members)) throw new Error(`Invalid first (members) parameter, Expected Array<GuildMember> but got ${typeof members}`);

        try {
            return await this.model.find(this.multipleQuery(members));
        } catch (e) {
            throw e;
        }
    }

    seperateGuildIdFromUserId(GuildIdAndUserId: string): { guildID: string, userID: string } {
        if (GuildIdAndUserId.length !== 36) throw new Error('GuildId + UserId always results in length of 18 and this string is not length of 18');

        return { guildID: GuildIdAndUserId.slice(0, 18), userID: GuildIdAndUserId.slice(18) }
    }

    // @ts-ignore
    async getLeaderboard(guild: Guild, limit: number, options?: { customField?: string, useFetch?: boolean }): Promise<{ money: number, member: GuildMember }[]> {
        if (!guild) throw new Error('Invalid syntax, first (guildID) parameter undefined');

        let goptions = options || {};

        try {
            let data = await this.model.find(this.guildQuery).limit(limit).sort({ [goptions.customField ? goptions.customField : "money"]: -1 });

            if (goptions.useFetch) {
                // @ts-ignore
                let members = await guild.members.fetch({ user: data.map(x => this.seperateGuildIdFromUserId(x._id).userID) });
                // @ts-ignore

                return data.map(x => ({ money: x.get(goptions.customField ? goptions.customField : "money"), member: members.get(this.seperateGuildIdFromUserId(x._id).userID) }));
                // @ts-ignore
            } else data.map(m => ({ member: guild.members.cache.get(this.seperateGuildIdFromUserId(m._id).userID), money: m.get(goptions.customField ? goptions.customField : "money") }));

        } catch (e) {
            throw e;
        }
    }

    async formatLeaderboard(guild: Guild, options?: { customField?: string, color?: ColorResolvable, pageSize?: number, page?: number, title?: string }): Promise<MessageEmbed> {
        if (!guild) throw new Error('Invalid syntax, first (guildID) parameter undefined');

        options = options || {};

        let page = options.page || 1;
        let pageSize = options.pageSize || 10;

        let data = await this.getLeaderboard(guild, pageSize, options.customField ? { customField: options.customField, useFetch: true } : { useFetch: true });
        if (!data) return null;

        if (data.length <= 0) {
            return new MessageEmbed()
                .setTitle(options.title ? options.title : 'Leaderboard')
                .setColor(options.color ? options.color : 0xb06305)
                .setDescription("No users have money in the guild currently")
                .setTimestamp();
        } else {

            let str = '';
            for (var i = 0; i < data.length; i++)
                str += `\n${(i + 1)}# - ${data[i].member?.user.username} | ${data[i].money}$`;

            return new MessageEmbed()
                .setTitle(options.title ? options.title : 'Leaderboard')
                .setColor(options.color ? options.color : 0xb06305)
                .setDescription(str)
                .setTimestamp();
        }
    }
}

export = MoneySystem;