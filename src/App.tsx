import { useMemo, useState } from "react";
import { buildCardDeck, doRectsOverlap, rectDistanceSquared } from "./utils";
import { Card, CardLocation, DragData, DropZone, GameState, SuitColors, Vector2 } from "./types";
import Tableau from "./Tableau";
import Foundation from "./Foundation";

import "./App.css";

function App() {
	/*const testCard: Card = {suit: Suit.Hearts, value: 2, isFaceUp: true, isJoker: false};
	const testCard2: Card = {suit: Suit.Diamonds, value: 4, isFaceUp: true, isJoker: false};
	const testCard3: Card = {suit: Suit.Clubs, value: 7, isFaceUp: true, isJoker: false};
	const testCard4: Card = {suit: Suit.Spades, value: 9, isFaceUp: true, isJoker: false};*/

	/*const [foundations, setFoundations] = useState<Card[][]>([[testCard], [testCard2], [testCard3], [testCard4]]);
	const [tableau, setTableau] = useState<Card[][]>(generateNewGame);
	const [stock, setStock] = useState<Card[]>([]);
	const [waste, setWaste] = useState<Card[]>([]);*/

	const [gameState, setGameState] = useState(generateNewGame);

	const [draggedCard, setDraggedCard] = useState("");
	const [draggedCardOffset, setDraggedCardOffset] = useState<Vector2>({x: 0, y: 0});
	const [draggedCardStartPos, setDraggedCardStartPos] = useState<Vector2>({x: 0, y: 0});

	////////////////////////////////////////////////////////////////////////////////////////////////

	/*function generateNewGame(): Card[][] {
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
	}*/

	function generateNewGame(): GameState {
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

		console.log(newTableau);

		return {
			tableau: newTableau,
			stock: cards,
			foundations: [[], [], [], []],
			waste: [],
		};
	}

	function tryAddCardsToDepot(cards: Card[], index: number): [Card[][], Card[][]] | [null, null] {
		const targetCard: Card | null = gameState.tableau[index][gameState.tableau[index].length - 1] ?? null;
		const bottomCard = cards[0];
		if (targetCard === null && bottomCard.value == 13 || SuitColors[bottomCard.suit] !== SuitColors[targetCard?.suit] && bottomCard.value === targetCard?.value - 1) {
			const newTableau = [...gameState.tableau];
			newTableau[index] = newTableau[index].concat(cards);
			return [newTableau, gameState.foundations];
		} else {
			return [null, null];
		}
	}

	function takeCardFromDepot(index: number, indexInStack: number, newTableau: Card[][], newFoundations: Card[][]): [Card[][], Card[][]] {
		newTableau[index] = newTableau[index].slice(0, indexInStack);
		if (newTableau[index].length > 0) {
			newTableau[index][newTableau[index].length - 1].isFaceUp = true;
		}

		return [newTableau, newFoundations];
	}

	function tryAddCardsToFoundation(cards: Card[], index: number): [Card[][], Card[][]] | [null, null] {
		const targetCard: Card | null = gameState.foundations[index][gameState.foundations[index].length - 1] ?? null;
		const bottomCard = cards[0];
		if (targetCard === null && bottomCard.value == 1 || bottomCard.suit === targetCard.suit && bottomCard.value === targetCard.value + 1) {
			const newFoundations = [...gameState.foundations];
			newFoundations[index] = newFoundations[index].concat(cards);
			return [gameState.tableau, newFoundations];
		} else {
			return [null, null];
		}
	}

	function takeCardFromFoudnation(index: number, _: number, newTableau: Card[][], newFoundations: Card[][]): [Card[][], Card[][]] {
		newFoundations[index].pop();
		return [newTableau, newFoundations];
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	function onCardMouseDown(mousePos: Vector2, _: DOMRect, cardId: string) {
		setDraggedCardStartPos(mousePos);
		setDraggedCardOffset(mousePos);
		setDraggedCard(cardId);
	}

	function onCardMouseUp(_: Vector2, cardPos: DOMRect, __: string, cards: Card[], location: CardLocation, index: number, indexInStack: number) {
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
			const addFunc = closestZone.location === CardLocation.Foundation ? tryAddCardsToFoundation : tryAddCardsToDepot;
			const removeFunc = location === CardLocation.Foundation ? takeCardFromFoudnation : takeCardFromDepot;

			let [newTableau, newFoundations] = (addFunc)(cards, closestZone.index);
			if (newTableau !== null && newFoundations !== null) {
				[newTableau, newFoundations] = (removeFunc)(index, indexInStack, newTableau, newFoundations);
				setGameState({
					tableau: newTableau,
					foundations: newFoundations,
					stock: gameState.stock,
					waste: gameState.waste,
				});
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
			{gameState.foundations.map((foundation, index) => <Foundation key={index} index={index} cards={foundation} dragData={dragData} />)}
		</div>
		<Tableau depots={gameState.tableau} dragData={dragData} />
	</div>;
}

export default App;
