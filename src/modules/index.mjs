
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "@prisma-cms/prisma-module";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema



class Module extends PrismaModule {


  constructor(props = {}) {

    super(props);

    Object.assign(this, {
    });

  }


  getSchema(types = []) {


    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  getApiSchema(types = []) {


    let baseSchema = [];

    let schemaFile = __dirname + "/../schema/generated/prisma.graphql";

    if (fs.existsSync(schemaFile)) {
      baseSchema = fs.readFileSync(schemaFile, "utf-8");
    }

    let apiSchema = super.getApiSchema(types.concat(baseSchema), []);

    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


    return apiSchema;

  }


  getResolvers() {

    const resolvers = super.getResolvers();

    Object.assign(resolvers.Query, {
      logsConnection: this.logsConnection,
      logs: this.logs,
      log: this.log,
    }); 

    return resolvers;
    
  }

  log(source, args, ctx, info) {
    return ctx.db.query.log({}, info);
  }

  logs(source, args, ctx, info) {
    return ctx.db.query.logs({}, info);
  }

  logsConnection(source, args, ctx, info) {
    return ctx.db.query.logsConnection({}, info);
  }


}


export default Module;