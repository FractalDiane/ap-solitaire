import { useEffect, useRef, useState } from "react";
import CardObject from "../CardObject";
import { CardLocation, Suit } from "../types";

import "./TitleCard.css";

interface TitleCardProps {
	index: number,
	startFaceUp: boolean,
}

export default function TitleCard(props: TitleCardProps) {
	function randomSuit(): Suit {
		return Math.floor(Math.random() * 4);
	}

	function randomValue(): number {
		return Math.floor(Math.random() * 12) + 1;
	}

	const [faceUp, setFaceUp] = useState(props.startFaceUp);
	const [suit, setSuit] = useState(randomSuit);
	const [value, setValue] = useState(randomValue);

	const cardElement = useRef<HTMLDivElement>(null);

	useEffect(() => {
		cardElement.current!.onanimationiteration = () => {
			setFaceUp(!faceUp);
			setSuit(randomSuit);
			setValue(randomValue);
		}
	}, [faceUp]);

	const card = {
		suit: suit,
		value: value,
		isFaceUp: faceUp,
		isJoker: false,
	};

	return <div className="title-card" ref={cardElement} style={{animationDelay: `-2s`, animationDuration: `${4 + props.index}s`}}>
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
	</div>;
}
