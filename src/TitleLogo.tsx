import { useEffect, useMemo, useRef, useState } from "react";
import CardObject from "./CardObject";
import { Card, CardLocation, Suit } from "./types";

import "./TitleLogo.css";

export default function TitleLogo() {
	const [cardFaceUp, setCardFaceUp] = useState(true);
	const [cardSuit, setCardSuit] = useState(randomSuit);
	const [cardValue, setCardValue] = useState(randomValue);

	const card = useMemo<Card>(() => {
		return {
			suit: cardSuit,
			value: cardValue,
			isFaceUp: cardFaceUp,
			isJoker: false,
		};
	}, [cardFaceUp, cardSuit, cardValue]);

	function randomSuit(): Suit {
		return Math.floor(Math.random() * 4);
	}

	function randomValue(): number {
		return Math.floor(Math.random() * 12) + 1;
	}

	const cardElement = useRef<HTMLDivElement>(null);
	//const cardElements = useRef<HTMLDivElement[]>([]);

	useEffect(() => {

	}, []);
	
	useEffect(() => {
		cardElement.current!.onanimationiteration = () => {
			setCardFaceUp(!cardFaceUp);
			setCardSuit(randomSuit);
			setCardValue(randomValue);
		}
	}, [cardFaceUp]);

	function TitleCard() {
		return <CardObject displayOnly={true} card={card} staggered={false}
			stackIndex={0} isTopInStack={true} allCardsInStack={[card]}
			suitProgressions={[13, 13, 13, 13]} indexInLocation={0} location={CardLocation.Foundation}
			rainbowTrapActive={false}
			dragData={{
				draggedCard: "",
				dragOffset: {x: 0, y: 0},
				dragStartPos: {x: 0, y: 0},
				onMouseDown: () => {},
				onMouseUp: () => {},
			}} />;
	}

	return <div id="title-container">
		<div id="title-card" ref={cardElement}>
			<CardObject displayOnly={true} card={card} staggered={false}
			stackIndex={0} isTopInStack={true} allCardsInStack={[card]}
			suitProgressions={[13, 13, 13, 13]} indexInLocation={0} location={CardLocation.Foundation}
			rainbowTrapActive={false}
			dragData={{
				draggedCard: "",
				dragOffset: {x: 0, y: 0},
				dragStartPos: {x: 0, y: 0},
				onMouseDown: () => {},
				onMouseUp: () => {},
			}} />
		</div>
		<div id="title-text">AP SOLITAIRE</div>
	</div>;
}
