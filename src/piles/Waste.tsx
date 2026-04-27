import CardObject from "../CardObject";
import { Card, CardLocation, DragData } from "../types";
import { getCardUid } from "../utils";

import "./Waste.css";

interface WasteProps {
	cards: Card[],

	dragData: DragData
}

export default function Waste(props: WasteProps) {
	return <div className="waste">
		{props.cards.map((card, index) => <CardObject key={getCardUid(card)} card={card} allCardsInStack={props.cards}
			location={CardLocation.Waste} indexInLocation={0}
			dragData={props.dragData}
			staggered={false} stackIndex={index} isTopInStack={index === props.cards.length - 1} />)}
	</div>;
}
