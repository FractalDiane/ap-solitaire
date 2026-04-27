import CardObject from "./CardObject";
import { Card, CardLocation, DragData } from "./types";
import { getCardUid } from "./utils";

import "./Depot.css";


interface DepotProps {
	cards: Card[],
	index: number,
	
	dragData: DragData,
}

export default function Depot(props: DepotProps) {
	return <div className="depot drop-zone" drop-location={CardLocation.Depot} drop-index={props.index}>
		{props.cards.map((card, index) => <CardObject key={getCardUid(card)} card={card} allCardsInStack={props.cards}
		location={CardLocation.Depot} indexInLocation={props.index}
		dragData={props.dragData}
		staggered={true} stackIndex={index} isTopInStack={index === props.cards.length - 1} />)}
	</div>;
}
