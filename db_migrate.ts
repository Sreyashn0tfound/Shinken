import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function main() {
    try {
        await db.execute(sql`ALTER TABLE players ADD COLUMN IF NOT EXISTS session_id integer REFERENCES sessions(id) ON DELETE CASCADE;`);
        await db.execute(sql`ALTER TABLE players DROP COLUMN IF EXISTS clan_id;`);
        await db.execute(sql`DROP TABLE IF EXISTS clans CASCADE;`);
        console.log("Migration successful");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();
