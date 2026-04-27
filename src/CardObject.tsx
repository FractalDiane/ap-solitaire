import { Card, CardLocation, cardValues, DragData, Suit } from "./types";
import { useMemo, useRef } from "react";

import "./CardObject.css";
import { getCardUid } from "./utils";

interface CardObjectProps {
	card: Card,
	staggered: boolean,
	stackIndex: number,
	isTopInStack: boolean,

	location: CardLocation,
	indexInLocation: number,

	dragData: DragData,
}

export default function CardObject(props: CardObjectProps) {
	const id = useMemo(() => getCardUid(props.card), [props.card]);
	const isBeingDragged = useMemo(() => props.dragData.draggedCard === id, [id, props.dragData.draggedCard]);
	const isRed = useMemo(() => props.card.suit == Suit.Hearts || props.card.suit == Suit.Diamonds, [props.card]);

	const ref = useRef<HTMLDivElement>(null);

	return <div ref={ref} style={{
				position: "relative",
				zIndex: props.stackIndex + 100 + (isBeingDragged ? 1000 : 0),
				transform: isBeingDragged ? `translateX(${props.dragData.dragOffset.x - props.dragData.dragStartPos.x}px) translateY(${props.dragData.dragOffset.y - props.dragData.dragStartPos.y}px)` : "none",
			}} className={`card-object ${props.staggered ? "staggered" : ""} ${props.card.isFaceUp ? Suit[props.card.suit].toLowerCase() : "face-down"}`}
			onMouseDown={(e) => {if (props.card.isFaceUp) props.dragData.onMouseDown({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.card, props.location, props.indexInLocation)}}
		onMouseUp={(e) => {if (isBeingDragged) props.dragData.onMouseUp({x: e.clientX, y: e.clientY}, ref.current?.getBoundingClientRect() ?? new DOMRect(), id, props.card, props.location, props.indexInLocation)}}
			>
			{props.card.isFaceUp && <>
				<div className={`text ${isRed ? "red" : ""}`}>{cardValues[props.card.value]}</div>
			</>}
		</div>;
}
