import { deviceNameKey } from './Constants';
import { PluginGroup } from '../DataStructures/PluginGroup';
import Manager from '../Managers/Manager';

export function generateGroupID(
	name: string,
	delay?: number
): string | undefined {
	let id = nameToId((delay ? 'stg-' : 'pg-') + name);

	const groupMap = Manager.getInstance().groupsMap;

	if (!groupMap) {
		return undefined;
	}

	if (!groupMap.has(id)) {
		return id;
	}

	for (let i = 0; i < 512; i++) {
		const nrdId = id + i.toString();
		id += i.toString();
		if (!groupMap.has(id)) {
			return delay ? nrdId + delay.toString() : nrdId;
		}
	}
	return undefined;
}

export function nameToId(name: string): string {
	return name.replace(/[\W_]/g, '').toLowerCase();
}

export function saveVaultLocalStorage(key: string, object: any): void {
	// @ts-ignore
	Manager.getInstance().pluginInstance.app.saveLocalStorage(key, object);
}

export function loadVaultLocalStorage(key: string): string | null | undefined {
	// @ts-ignore
	return Manager.getInstance().pluginInstance.app.loadLocalStorage(key);
}

export function getCurrentlyActiveDevice(): string | null {
	const device = loadVaultLocalStorage(deviceNameKey);
	if (typeof device === 'string') {
		return device as string;
	}
	return null;
}

export function setCurrentlyActiveDevice(device: string | null) {
	saveVaultLocalStorage(deviceNameKey, device);
}

export function groupFromId(id: string): PluginGroup | undefined {
	return Manager.getInstance().groupsMap.get(id);
}
