import { makeCollapsible } from "src/Utils/Utilities";
import HtmlComponent from "../BaseComponents/HtmlComponent";
import { ExtraButtonComponent } from "obsidian";
import EditPluginList from "../EditPluginList";
import { PgPlugin } from "src/DataStructures/PgPlugin";
import Manager from "src/Managers/Manager";
import PluginManager from "src/Managers/PluginManager";
import { ItemAndDescription } from "../DescriptionsList";

export interface PluginSettingOptions {
	collapsible?: boolean;
	startOpened?: boolean;
	maxListHeight?: number;
}

export default class PluginSettings extends HtmlComponent<PluginSettingOptions> {

  content: HTMLElement;

	constructor(parentEL: HTMLElement, options: PluginSettingOptions) {
		super(parentEL, options);
		this.generateComponent();
	}

  protected generateContainer(): void {
		this.mainEl = this.parentEl.createDiv();
	}

  protected generateContent(): void {
		if (!this.mainEl) {
			return;
		}

    const header = this.mainEl.createEl('h5', { text: 'Plugins' });

		this.content = this.mainEl.createDiv();

		makeCollapsible(header, this.content);

		if (this.options.collapsible) {
			makeCollapsible(header, this.content, this.options.startOpened);
		}

		const listContainer = this.content.createDiv();
		listContainer.style.overflow = 'scroll';
		listContainer.style.maxHeight =
			(this.options.maxListHeight?.toString() ?? '') + 'px';

		this.GeneratePluginsList(listContainer);
	}

  GeneratePluginsList(parentEl: HTMLElement) {

		const refresh = new ExtraButtonComponent(this.content);
		refresh.setIcon('refresh-cw');
		refresh.setTooltip(
			'Refresh list for changes to the plugins and assigned groups.'
		);

		const pluginList = new EditPluginList(
			this.content,
			{
				items: this.getPluginsWithGroupsAsDescription(),
			},
			() => {
				pluginList.update({
					items: this.getPluginsWithGroupsAsDescription(),
				});
			}
		);

		refresh.onClick(() => {
			pluginList.update({
				items: this.getPluginsWithGroupsAsDescription(),
			});
		});
	}

	private getPluginsWithGroupsAsDescription(): ItemAndDescription<PgPlugin>[] {
		return PluginManager.getAllAvailablePlugins().map((plugin) => {
			const groups = Manager.getInstance().getGroupsOfPlugin(plugin.id);

			return {
				item: plugin,
				description: groups.map((group) => group.name).join(', '),
			};
		});
	}
}
