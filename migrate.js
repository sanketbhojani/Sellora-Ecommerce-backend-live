import mongoose from 'mongoose';

const localUri = 'mongodb://localhost:27017/sellora_ecommerce';
const atlasUri = 'mongodb+srv://sanketbhojani107_db_user:49pETc648PLAVc5B@cluster0.fmuf6kv.mongodb.net/sellora_ecommerce?retryWrites=true&w=majority';

async function migrateData() {
    console.log("Connecting to local MongoDB...");
    const localDb = mongoose.createConnection(localUri);

    localDb.on('error', (err) => {
        console.error("Local DB Connection Error:", err);
    });

    localDb.once('open', async () => {
        console.log("Connected to local DB successfully!");
        
        console.log("Connecting to Atlas MongoDB...");
        const atlasDb = mongoose.createConnection(atlasUri);
        
        atlasDb.on('error', (err) => {
            console.error("Atlas DB Connection Error (Did you allow IP address 0.0.0.0/0 in Atlas Network Access?):", err);
        });

        atlasDb.once('open', async () => {
            console.log("Connected to Atlas DB successfully!");
            
            try {
                // Get all collections from local DB
                const collections = await localDb.db.listCollections().toArray();
                console.log(`Found ${collections.length} collections to transfer...`);

                for (let col of collections) {
                    const colName = col.name;
                    console.log(`\nTransferring collection: ${colName}...`);
                    
                    const localCollection = localDb.collection(colName);
                    const atlasCollection = atlasDb.collection(colName);

                    const documents = await localCollection.find({}).toArray();
                    
                    if (documents.length > 0) {
                        console.log(`Found ${documents.length} documents. Inserting into Atlas...`);
                        await atlasCollection.insertMany(documents);
                        console.log(`✅ Successfully copied ${documents.length} documents for ${colName}`);
                    } else {
                        console.log(`⚠️ Collection ${colName} is empty. Skipping.`);
                    }
                }

                console.log("\n🎉 ALL DATA HAS BEEN TRANSFERRED SUCCESSFULLY! 🎉");
            } catch (err) {
                console.error("Error during migration:", err);
            } finally {
                localDb.close();
                atlasDb.close();
                process.exit(0);
            }
        });
    });
}

migrateData();
