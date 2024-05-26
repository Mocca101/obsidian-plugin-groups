import { type App, Modal } from "obsidian";
import type { SvelteComponent } from "svelte";

type SvelteProps = ConstructorParameters<typeof SvelteComponent>[0];

/**
 * Generic modal utility class that can be used to easily display a modal
 * using any Svelte component.
 */
export class SvelteModal<T extends SvelteProps> extends Modal {
    _component!: SvelteComponent<T>;

    constructor(
        app: App,
        private component: typeof SvelteComponent<T>,
        private getProps: (modal: Modal) => T,
    ) {
        super(app);
    }

    onClose() {
        this._component.$destroy();
    }

    onOpen() {
        const { contentEl } = this;
        this._component = new this.component({
            target: contentEl,
            props: this.getProps(this),
        });
    }
}
