import { setIcon } from "obsidian";
import type { PluginGroup } from "../DataStructures/PluginGroup";
import Manager from "../Managers/Manager";
import { deviceNameKey } from "./Constants";

export function generateGroupID(
	name: string,
	delay?: number
): string | undefined {
	let id = nameToId((delay ? "stg-" : "pg-") + name);

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

export function devLog(message?: any, ...data: any[]) {
	if (Manager.getInstance().devLog) {
		console.log(message, data);
	}
}

export function nameToId(name: string): string {
	return name.replace(/[\W_]/g, "").toLowerCase();
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
	if (typeof device === "string") {
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

export function makeCollapsible(
	foldClickElement: HTMLElement,
	content: HTMLElement,
	startOpened?: boolean
) {
	if (!content.hasClass("pg-collapsible-content")) {
		content.addClass("pg-collapsible-content");
	}

	if (!foldClickElement.hasClass("pg-collapsible-header")) {
		foldClickElement.addClass("pg-collapsible-header");
	}

	toggleCollapsibleIcon(foldClickElement);

	if (startOpened) {
		content.addClass("is-active");
		toggleCollapsibleIcon(foldClickElement);
	}

	foldClickElement.onclick = () => {
		content.hasClass("is-active")
			? content.removeClass("is-active")
			: content.addClass("is-active");

		toggleCollapsibleIcon(foldClickElement);
	};
}

function toggleCollapsibleIcon(parentEl: HTMLElement) {
	let foldable: HTMLElement | null = parentEl.querySelector(
		":scope > .pg-collapsible-icon"
	);
	if (!foldable) {
		foldable = parentEl.createSpan({ cls: "pg-collapsible-icon" });
	}
	if (foldable.dataset.togglestate === "up") {
		setIcon(foldable, "chevron-down");
		foldable.dataset.togglestate = "down";
	} else {
		setIcon(foldable, "chevron-up");
		foldable.dataset.togglestate = "up";
	}
}
