import { Migration } from '@mikro-orm/migrations';

export class Migration20221210182321 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
    this.addSql('alter table "post" alter column "created_at" set default \'NOW()\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" alter column "created_at" drop default;');
    this.addSql('alter table "post" alter column "created_at" type timestamptz(0) using ("created_at"::timestamptz(0));');
  }

}
