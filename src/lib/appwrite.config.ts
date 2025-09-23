import { ENDPOINT, PROJECTID } from '@/contants/env.file';
import { Client } from 'appwrite';

const client = new Client();

client.setEndpoint(ENDPOINT).setProject(PROJECTID);

export default client;
