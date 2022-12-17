import {PgComponent} from "./Types";

export class PgPlugin implements PgComponent {

	id: string;
	name: string;


	constructor(id: string, name: string) {
		this.id = id;
		this.name = name;
	}

	enable() {
		// @ts-ignore
		app.plugins.enablePlugin(this.id);
	}

	disable() {
		// @ts-ignore
		app.plugins.disablePlugin(this.id);
	}
}
