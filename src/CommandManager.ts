import {groupFromId} from "./Utilities";
import {PluginGroup} from "./PluginGroup";
import Manager from "./Manager";
import {Command} from "obsidian";

export default class CommandManager {

	private enableGroupCommandPrefix = 'plugin-groups-enable-';
	private disableGroupCommandPrefix = 'plugin-groups-disable-';
	private cnEnablePrefix = 'Plugin Groups: Enable ';
	private cnDisablePrefix = 'Plugin Groups: Disable ';

	private commandMap: Map<string, Command> = new Map<string, Command>();

	private static instance?: CommandManager;
	private constructor() {	}

	public static getInstance() : CommandManager {
		if(!CommandManager.instance) {
			CommandManager.instance = new CommandManager();
		}
		return CommandManager.instance;
	}

	AddGroupCommands(groupID: string) {
		const group = groupFromId(groupID);
		if(!group) return;
		const enableId = this.enableGroupCommandPrefix + group.id;

		this.commandMap.set(enableId, Manager.getInstance().pluginInstance.addCommand({
			id: enableId,
			name: this.cnEnablePrefix + group.name,
			icon: 'power',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.enable();
			}
		}));

		const disableId = this.disableGroupCommandPrefix + group.id;

		this.commandMap.set(disableId, Manager.getInstance().pluginInstance.addCommand({
			id: disableId,
			name: this.cnDisablePrefix + group.name,
			icon: 'power-off',
			checkCallback: (checking: boolean) => {
				if(!this.shouldShowCommand(group)) return false;
				if (checking) return true;
				group.disable();
			}
		}));
	}

	shouldShowCommand(group: PluginGroup): boolean {
		if (!Manager.getInstance().groupsMap.has(group.id)) return false;
		if (!Manager.getInstance().generateCommands) return false;
		if(!group.groupActive()) { return false; }
		return group.generateCommands;
	}

	updateCommand(groupId: string) {
		const group = groupFromId(groupId);
		if(!group) {return;}

		let command = this.commandMap.get(this.enableGroupCommandPrefix + group.id);
		if(command) {
			command.name = this.cnEnablePrefix + group.name;
		}

		command = this.commandMap.get(this.disableGroupCommandPrefix + group.id)
		if(command) {
			command.name = this.cnDisablePrefix + group.name;
		}
	}
}
