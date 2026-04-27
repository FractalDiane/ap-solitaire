import CardObject from "../CardObject";
import { Card, CardLocation, DragData } from "../types";
import { getCardUid } from "../utils";

import "./Stock.css";

interface StockProps {
	cards: Card[],

	dragData: DragData,
	onClickEmpty: () => void,
	onClickCard: () => void,

	rainbowTrapActive: boolean,
}

export default function Stock(props: StockProps) {
	const dragData = {...props.dragData};
	dragData.onMouseDown = () => {
		props.onClickCard();
	}

	return <div className="stock" onClick={props.onClickEmpty}>
		{props.cards.map((card, index) => <CardObject key={getCardUid(card)} card={card} allCardsInStack={props.cards}
			location={CardLocation.Stock} indexInLocation={0} dragData={dragData}
			staggered={false} stackIndex={index} isTopInStack={index === props.cards.length - 1}
			rainbowTrapActive={props.rainbowTrapActive}
		/>)}
	</div>;
}
