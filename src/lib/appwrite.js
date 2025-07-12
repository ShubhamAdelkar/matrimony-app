import { Client, Account, Databases, ID } from 'appwrite';

// ⭐ Replace with your actual Appwrite Project ID and Database ID
// You can get these from your Appwrite Console
export const appwriteConfig = {
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    endpoint: import.meta.env.VITE_APPWRITE_ENDPOINT,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    profilesCollectionId: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID,
};

const client = new Client();

client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export { ID }; // Export ID for unique IDs