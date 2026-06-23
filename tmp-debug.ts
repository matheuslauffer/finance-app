import { db } from './db';
import { recurrences } from './db/schema/recurrences';
import { desc, eq } from 'drizzle-orm';

async function main() {
  try {
    const [row] = await db.select().from(recurrences).limit(1);
    console.log('one recurrence row', row);
    const rows = await db
      .select()
      .from(recurrences)
      .where(eq(recurrences.userId, row.userId))
      .orderBy(desc(recurrences.nextOccurrence))
      .limit(1);
    console.log('query succeeded rows', rows);
  } catch (e) {
    console.error('error', e);
    process.exit(1);
  }
}

main();
