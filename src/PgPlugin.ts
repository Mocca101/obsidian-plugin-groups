import {PgComponent} from "./Types";

export class PgPlugin implements PgComponent {

	id: string;
	name: string;


	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}
}
