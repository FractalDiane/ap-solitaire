import { Card, cardImages, CardLocation, cardValues, DragData, Suit, suitImages } from "./types";
import { useMemo, useRef } from "react";

import "./CardObject.css";
import { getCardUid, getRandomHueShift } from "./utils";

interface CardObjectProps {
	card: Card,
	staggered: boolean,
	stackIndex: number,
	isTopInStack: boolean,
	allCardsInStack: Card[],

	location: CardLocation,
	indexInLocation: number,

	unlockedCards: string[],
	rainbowTrapActive: boolean,

	dragData: DragData,
}

export default function CardObject(props: CardObjectProps) {
	const id = useMemo(() => getCardUid(props.card), [props.card]);
	const isRed = useMemo(() => props.card.suit == Suit.Hearts || props.card.suit == Suit.Diamonds, [props.card]);
	const isUnlocked = true;//useMemo(() => props.unlockedCards.includes(id), [id, props.unlockedCards]);
	const isBeingDragged = useMemo(
		() => props.dragData.draggedCard === id || props.allCardsInStack.slice(0, props.stackIndex).some(card => props.dragData.draggedCard === getCardUid(card)),
		[id, props.dragData.draggedCard, props.allCardsInStack, props.stackIndex],
	);

	const ref = useRef<HTMLDivElement>(null);

	return <div ref={ref} style={{
				position: "relative",
				zIndex: props.stackIndex + 100 + (isBeingDragged ? 1000 : 0),
				transform: isBeingDragged ? `translateX(${props.dragData.dragOffset.x - props.dragData.dragStartPos.x}px) translateY(${props.dragData.dragOffset.y - props.dragData.dragStartPos.y}px)` : "none",
			}} className={`card-object ${!isUnlocked ? "locked" : ""} ${props.staggered ? "staggered" : ""} ${props.card.isFaceUp ? Suit[props.card.suit].toLowerCase() : "face-down"}`}
			onMouseDown={(e) => {
				if (props.card.isFaceUp || props.location === CardLocation.Stock) props.dragData.onMouseDown({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.allCardsInStack.slice(props.stackIndex), props.location, props.indexInLocation, props.stackIndex)}}
		onMouseUp={(e) => {if (isBeingDragged) props.dragData.onMouseUp({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.allCardsInStack.slice(props.stackIndex), props.location, props.indexInLocation, props.stackIndex)}}
			>
			{props.card.isFaceUp && <>
				<img className="card" src={cardImages.get(id) ?? undefined} draggable={false} style={{
					filter: props.rainbowTrapActive ? `hue-rotate(${getRandomHueShift(id)}deg)` : !isRed ? "grayscale(1.0)" : "none",
				}} />
				<div className={`text ${isRed ? "red" : ""}`}>{cardValues[props.card.value]}</div>
				<div className={`text bottom ${isRed ? "red" : ""}`}>{cardValues[props.card.value]}</div>
				<img className="suit" src={suitImages[props.card.suit]} draggable={false} style={{
					filter: props.rainbowTrapActive ? `hue-rotate(${getRandomHueShift(id)}deg)` : "none",
				}} />
				<img className="suit bottom" src={suitImages[props.card.suit]} draggable={false} style={{
					filter: props.rainbowTrapActive ? `hue-rotate(${getRandomHueShift(id)}deg)` : "none",
				}} />
			</>}
		</div>;
}
