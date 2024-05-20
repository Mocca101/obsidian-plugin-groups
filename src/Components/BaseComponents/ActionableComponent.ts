import HtmlComponent from "./HtmlComponent";

export default abstract class ActionableComponent<
	Type,
> extends HtmlComponent<Type> {
	private listener: EventListener;
	private eventTarget: EventTarget;

	eventType = "pg-action";
	outwardEvent: CustomEvent<unknown>;

	protected constructor(parentElement: HTMLElement) {
		super(parentElement);
	}

	subscribe(onActionListener: EventListener) {
		this.eventTarget.addEventListener(this.eventType, onActionListener);
	}

	unsubscribe(onActionListener: EventListener) {
		this.eventTarget.removeEventListener(this.eventType, onActionListener);
	}

	private emit() {
		this.eventTarget.dispatchEvent(this.outwardEvent);
	}
}
