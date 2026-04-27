import CardObject from "./CardObject";
import { Card, CardLocation, DragData } from "./types";
import { getCardUid } from "./utils";

import "./Foundation.css";

interface FoundationProps {
	cards: Card[],
	index: number,

	dragData: DragData
}

export default function Foundation(props: FoundationProps) {
	return <div className="foundation drop-zone" drop-location={CardLocation.Foundation} drop-index={props.index}>
		{props.cards.map((card, index) => <CardObject key={getCardUid(card)} card={card}
			location={CardLocation.Foundation} indexInLocation={props.index}
			dragData={props.dragData}
			staggered={false} stackIndex={index} isTopInStack={index === props.cards.length - 1} />)}
	</div>;
}
