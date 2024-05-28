import { pluginInstance } from "@/stores/main-store";
import { Modal } from "obsidian";
import type { SvelteComponent, ComponentProps } from 'svelte';
import { get } from "svelte/store";



export class SvelteModal<T extends SvelteComponent, P = ComponentProps<T>> extends Modal {
	_component!: SvelteComponent<T>;

    constructor(
			private component: { new (arg:{
				target: HTMLElement,
				props: P
			}): T },
        private props: () => P
    ) {
        super(get(pluginInstance).app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = new this.component({
            target: contentEl,
						props: this.props()
        });
    }


}
