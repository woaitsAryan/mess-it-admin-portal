import * as dotenv from 'dotenv'

dotenv.config();

const envHandler = (envName:string) => {
  const env = process.env[envName];
  if (!env) {
    console.error(`ENV ${envName} is not defined.`);
  }
  return env;
};

export default envHandler;