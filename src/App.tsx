import { useMemo, useState } from "react";
import { buildCardDeck, doRectsOverlap, rectDistanceSquared } from "./utils";
import { Card, CardLocation, DragData, DropZone, Suit, SuitColors, Vector2 } from "./types";
import Tableau from "./Tableau";
import Foundation from "./Foundation";

import "./App.css";

function App() {
	const testCard: Card = {suit: Suit.Hearts, value: 2, isFaceUp: true, isJoker: false};
	const testCard2: Card = {suit: Suit.Diamonds, value: 4, isFaceUp: true, isJoker: false};
	const testCard3: Card = {suit: Suit.Clubs, value: 7, isFaceUp: true, isJoker: false};
	const testCard4: Card = {suit: Suit.Spades, value: 9, isFaceUp: true, isJoker: false};

	const [foundations, setFoundations] = useState<Card[][]>([[testCard], [testCard2], [testCard3], [testCard4]]);
	const [tableau, setTableau] = useState<Card[][]>(generateNewGame);
	const [stock, setStock] = useState<Card[]>([]);
	const [waste, setWaste] = useState<Card[]>([]);

	const [draggedCard, setDraggedCard] = useState("");
	const [draggedCardOffset, setDraggedCardOffset] = useState<Vector2>({x: 0, y: 0});
	const [draggedCardStartPos, setDraggedCardStartPos] = useState<Vector2>({x: 0, y: 0});

	////////////////////////////////////////////////////////////////////////////////////////////////

	function generateNewGame(): Card[][] {
		const cards = buildCardDeck();
		const newTableau: Card[][] = [[], [], [], [], [], [], []];
		let depotSize = 1;
		for (let d = 0; d < 7; ++d) {
			for (let c = 0; c < depotSize; ++c) {
				const thisCard = cards.pop()!;
				thisCard.isFaceUp = c == d;
				newTableau[d].push(thisCard);
			}

			++depotSize;
		}

		return newTableau;
	}

	function tryAddCardToDepot(card: Card, index: number): boolean {
		const targetCard: Card | null = tableau[index][tableau[index].length - 1] ?? null;
		if (targetCard === null || SuitColors[card.suit] !== SuitColors[targetCard.suit] && card.value === targetCard.value - 1) {
			const newTableau = [...tableau];
			newTableau[index].push(card);
			setTableau(newTableau);
			return true;
		} else {
			return false;
		}
	}

	function takeCardFromDepot(index: number): Card {
		const newTableau = [...tableau];
		const removed = newTableau[index].pop()!;
		if (newTableau[index].length > 0) {
			newTableau[index][newTableau[index].length - 1].isFaceUp = true;
		}

		setTableau(newTableau);
		return removed;
	}

	function tryAddCardToFoundation(card: Card, index: number): boolean {
		const targetCard: Card | null = foundations[index][foundations[index].length - 1] ?? null;
		if (targetCard === null || card.suit === targetCard.suit && card.value === targetCard.value + 1) {
			const newFoundations = [...foundations];
			newFoundations[index].push(card);
			setFoundations(newFoundations);
			return true;
		} else {
			return false;
		}
	}

	function takeCardFromFoudnation(index: number): Card {
		const newFoundations = [...foundations];
		const removed = newFoundations[index].pop()!;
		setFoundations(newFoundations);
		return removed;
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	function onCardMouseDown(mousePos: Vector2, _: DOMRect, cardId: string) {
		setDraggedCardStartPos(mousePos);
		setDraggedCardOffset(mousePos);
		setDraggedCard(cardId);
	}

	function onCardMouseUp(_: Vector2, cardPos: DOMRect, __: string, card: Card, location: CardLocation, index: number) {
		setDraggedCard("");

		const dropZones = getDropZones();

		let minDistance = Infinity;
		let closestZone: DropZone | null = null;
		for (const zone of dropZones) {
			if (doRectsOverlap(cardPos, zone.box)) {
				const distanceSquared = rectDistanceSquared(cardPos, zone.box);
				if (distanceSquared < minDistance) {
					closestZone = zone;
					minDistance = distanceSquared;
				}
			}
		}

		if (closestZone !== null) {
			const addFunc = closestZone.location === CardLocation.Foundation ? tryAddCardToFoundation : tryAddCardToDepot;
			const removeFunc = location === CardLocation.Foundation ? takeCardFromFoudnation : takeCardFromDepot;
			if ((addFunc)(card, closestZone.index)) {
				(removeFunc)(index);
			}
		}
	}

	function getDropZones(): DropZone[] {
		const result = [];
		const zones = document.querySelectorAll<HTMLDivElement>(".drop-zone");
		for (const zone of zones) {
			result.push({
				box: zone.getBoundingClientRect(),
				location: Number(zone.getAttribute("drop-location")),
				index: Number(zone.getAttribute("drop-index")),
			});
		}

		return result;
	}

	const dragData = useMemo<DragData>(() => {
		return {
			draggedCard: draggedCard,
			dragOffset: draggedCardOffset,
			dragStartPos: draggedCardStartPos,
			onMouseDown: onCardMouseDown,
			onMouseUp: onCardMouseUp,
		};
	}, [draggedCard, draggedCardOffset, draggedCardStartPos])

	return <div id="actual-root" onMouseMove={(e) => {
		if (draggedCard.length > 0) {
			setDraggedCardOffset({x: e.clientX, y: e.clientY});
		}
	}}>
		<div className="foundations-container">
			{foundations.map((foundation, index) => <Foundation key={index} index={index} cards={foundation} dragData={dragData} />)}
		</div>
		<Tableau depots={tableau} dragData={dragData} />
	</div>;
}

export default App;
