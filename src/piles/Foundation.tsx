import CardObject from "../CardObject";
import { Card, CardLocation, DragData } from "../types";
import { getCardUid } from "../utils";

import "./Foundation.css";

interface FoundationProps {
	cards: Card[],
	index: number,

	dragData: DragData

	suitProgressions: number[],
	rainbowTrapActive: boolean,
	mirrorTrapActive: boolean,
}

export default function Foundation(props: FoundationProps) {
	return <div className="foundation drop-zone" drop-location={CardLocation.Foundation} drop-index={props.index}>
		{props.cards.map((card, index) => <CardObject key={getCardUid(card)} card={card} allCardsInStack={props.cards}
			location={CardLocation.Foundation} indexInLocation={props.index} suitProgressions={props.suitProgressions}
			dragData={props.dragData} rainbowTrapActive={props.rainbowTrapActive} mirrorTrapActive={props.mirrorTrapActive}
			staggered={false} stackIndex={index} isTopInStack={index === props.cards.length - 1} />)}
	</div>;
}
