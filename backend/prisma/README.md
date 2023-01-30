<p align="center">
  <a href="https://www.prisma.io/docs/concepts" target="blank"><img src="https://website-v9.vercel.app/logo-dark.svg" width="200" alt="Prisma Logo" /></a>
</p>

<p align="center">
    We have chosen to use prisma to manage our databases. Prisma is an open source next-generation ORM. It consists of the following parts: Prisma Client: Auto-generated and type-safe query builder for Node.js & TypeScript. Prisma Migrate: Migration system
</p>


## Description

The Prisma schema file (short: schema file, Prisma schema or schema) is the main configuration file for your Prisma setup. It is typically called schema.prisma and consists of the following parts:

### Data sources:
Specify the details of the data sources Prisma should connect to (PostgreSQL database for this project). The DATABASE_URL environment variable contains all required informations Prisma needs to connect to the database and is stored in a .env file.
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```
### Generators:
Specifies what clients should be generated based on the data model (e.g. Prisma Client)
```prisma
generator client {
  provider = "prisma-client-js"
}
```

### Data model definition:
Specifies your application models (the shape of the data per data source) and their relations. for example, if we look at this very simplified example :
```prisma
model User {
  id          Int          @id @default(autoincrement())
  username    String       @unique
  channels    Channel[]    @relation("channel::members")
  profile     Profile?
}

model Channel {
  id        Int            @id @default(autoincrement())
  members   User[]         @relation("channel::members")
  Message   Message[]
}

model Message {
  id        Int            @id @default(autoincrement())
  channel   Channel        @relation(fields: [channelId], references: [id])
  channelId Int
  content   String
}

model Profile {
  id     Int               @id @default(autoincrement())
  user   User              @relation(fields: [userId], references: [id])
  userId Int
}

```

Prisma will generate three tables and create specific relationships between them. There are 3 types of relationships: 
- **One-to-one**: A user can only have one profile and a profile can only correspond to one user. In the prisma schema, the relationship is set up by passing a 'userId' item and specifying the relationship using the '@relation(fields: [userId], references: [id])' parameter.
- **One-to-Many**: A channel can contain several messages but a message is only present in one channel. The implementation of this relationship in the prisma schema is done in the same way as a One-to-One relationship, except that the channel will contain an array of messages ('Message[]').
- **Many-to-many**: A user can be in several channels and a channel can contain several users. This case is specific: to implement this relationship in a relational data schema we need to create an additional table to link the two other tables. In our example, the table will contain 2 columns: userId and channelId. This will allow us to find all the rows that correspond to a user or a channel. Prisma automatically generates this table.

#### WARNING: For these three types of relationships, rows with '@relation' do not actually exist in the table. However, we can use our query formatting to ensure that the generated SQL code returns this information. See the Prisma module readme for more information, but here's a quick example:

To get the information of a channel and the information of the users who are members of it, we will have to use the 'include' property:
```js
async channel(channelWhereUniqueInput: Prisma.ChannelWhereUniqueInput): Promise<Channel | null> {
	return this.prisma.channel.findUnique({
		where: channelWhereUniqueInput,
		include: {
		  members: true,
		},
	});
}
```
