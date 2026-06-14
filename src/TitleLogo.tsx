import { useEffect, useMemo, useRef, useState } from "react";
import CardObject from "./CardObject";
import { Card, CardLocation, Suit } from "./types";

import "./TitleLogo.css";

export default function TitleLogo() {
	const [cardsFaceUp, setCardsFaceUp] = useState([true, false, true, false, true]);
	const [cardSuits, setCardSuits] = useState([randomSuit(), randomSuit(), randomSuit(), randomSuit(), randomSuit()]);
	const [cardValues, setCardValues] = useState([randomValue(), randomValue(), randomValue(), randomValue(), randomValue()]);

	const cards = useMemo<Card[]>(() => {
		const result = [];
		for (let i = 0; i < 5; ++i) {
			result.push({
				suit: cardSuits[i],
				value: cardValues[i],
				isFaceUp: cardsFaceUp[i],
				isJoker: false,
			});
		}
		
		return result;
	}, [cardsFaceUp, cardSuits, cardValues]);

	function randomSuit(): Suit {
		return Math.floor(Math.random() * 4);
	}

	function randomValue(): number {
		return Math.floor(Math.random() * 12) + 1;
	}

	const cardElements = useRef<HTMLDivElement[]>([]);

	useEffect(() => {
		cardElements.current = cardElements.current.slice(0, 5);
	}, []);
	
	useEffect(() => {
		cardElements.current[0]!.onanimationiteration = () => {
			const newFaceUps = [];
			const newSuits = [];
			const newValues = [];
			for (let i = 0; i < 5; ++i) {
				newFaceUps.push(!cardsFaceUp[i]);
				newSuits.push(randomSuit());
				newValues.push(randomValue());
			}

			setCardsFaceUp(newFaceUps);
			setCardSuits(newSuits);
			setCardValues(newValues);
		};
	}, [cardsFaceUp]);

	function TitleCard(props: {index: number}) {
		return <div className="title-card" ref={el => {cardElements.current[props.index] = el!}}>
			<CardObject displayOnly={true} card={cards[props.index]} staggered={false}
			stackIndex={0} isTopInStack={true} allCardsInStack={[cards[props.index]]}
			suitProgressions={[13, 13, 13, 13]} indexInLocation={0} location={CardLocation.Foundation}
			rainbowTrapActive={false}
			dragData={{
				draggedCard: "",
				dragOffset: {x: 0, y: 0},
				dragStartPos: {x: 0, y: 0},
				onMouseDown: () => {},
				onMouseUp: () => {},
			}} />
		</div>;
	}

	return <div id="title-container">
		<div id="title-cards">
			{[...Array(5).keys()].map(index => <TitleCard index={index} />)}
		</div>
		<div id="title-text">AP SOLITAIRE</div>
	</div>;
}
