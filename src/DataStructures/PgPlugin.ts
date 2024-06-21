import type { PgComponent } from "../Utils/Types";

export interface PgPlugin extends PgComponent {
	id: string;
	name: string;
}
