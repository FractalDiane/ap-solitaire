import { Card, CardLocation, cardValues, DragData, Suit } from "./types";
import { useMemo, useRef } from "react";

import "./CardObject.css";
import { getCardUid, getRandomCardColor } from "./utils";

interface CardObjectProps {
	card: Card,
	staggered: boolean,
	stackIndex: number,
	isTopInStack: boolean,
	allCardsInStack: Card[],

	location: CardLocation,
	indexInLocation: number,

	dragData: DragData,

	rainbowTrapActive: boolean,
}

export default function CardObject(props: CardObjectProps) {
	const id = useMemo(() => getCardUid(props.card), [props.card]);
	const color = useMemo(() => {
		if (props.rainbowTrapActive) {
			return getRandomCardColor(id);
		} else if (props.card.suit == Suit.Hearts || props.card.suit == Suit.Diamonds) {
			return "red";
		} else {
			return "black";
		}
	}, [id, props.card, props.rainbowTrapActive]);

	const isBeingDragged = useMemo(
		() => props.dragData.draggedCard === id || props.allCardsInStack.slice(0, props.stackIndex).some(card => props.dragData.draggedCard === getCardUid(card)),
		[id, props.dragData.draggedCard, props.allCardsInStack, props.stackIndex],
	);

	const ref = useRef<HTMLDivElement>(null);

	return <div ref={ref} style={{
				position: "relative",
				zIndex: props.stackIndex + 100 + (isBeingDragged ? 1000 : 0),
				transform: isBeingDragged ? `translateX(${props.dragData.dragOffset.x - props.dragData.dragStartPos.x}px) translateY(${props.dragData.dragOffset.y - props.dragData.dragStartPos.y}px)` : "none",
			}} className={`card-object ${props.staggered ? "staggered" : ""} ${props.card.isFaceUp ? Suit[props.card.suit].toLowerCase() : "face-down"}`}
			onMouseDown={(e) => {
				if (props.card.isFaceUp || props.location === CardLocation.Stock) props.dragData.onMouseDown({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.allCardsInStack.slice(props.stackIndex), props.location, props.indexInLocation, props.stackIndex)}}
		onMouseUp={(e) => {if (isBeingDragged) props.dragData.onMouseUp({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.allCardsInStack.slice(props.stackIndex), props.location, props.indexInLocation, props.stackIndex)}}
			>
			{props.card.isFaceUp && <>
				<div className={`text`} style={{color: color}}>{cardValues[props.card.value]}</div>
			</>}
		</div>;
}
