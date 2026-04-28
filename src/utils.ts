import { cardWordValues, Suit, Vector2, type Card } from "./types";

import { create } from "random-seed";

export function shuffleArray<T>(array: T[]) {
	for (let i = array.length - 1; i > 0; --i) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export function doRectsOverlap(a: DOMRect, b: DOMRect): boolean {
	const xMaxA = a.x + a.width;
	const yMaxA = a.y + a.height;
	const xMaxB = b.x + b.width;
	const yMaxB = b.y + b.height;

	return a.x <= xMaxB && b.x <= xMaxA && a.y <= yMaxB && b.y <= yMaxA;
}

export function rectDistanceSquared(a: DOMRect, b: DOMRect): number {
	const centerA: Vector2 = {x: a.x + a.width / 2, y: a.y + a.height / 2};
	const centerB: Vector2 = {x: b.x + b.width / 2, y: b.y + b.height / 2};
	return Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2);
}

export function getCardUid(card: Card): string {
	return `${Suit[card.suit].substring(0, 1)}${card.value}`;
}

export function getCardUidFromItemName(name: string): string {
	const split = name.split(" ");
	return `${split[2].substring(0, 1)}${cardWordValues.get(split[0]) ?? split[0]}`
}

export function getRandomCardColor(cardId: string): string {
	const rand = create(cardId);
	const r = rand.intBetween(0, 255);
	const g = rand.intBetween(0, 255);
	const b = rand.intBetween(0, 255);
	return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export function buildCardDeck(): Card[] {
	const cards = [];
	for (let s = 0; s < 4; ++s) {
		for (let v = 1; v < 14; ++v) {
			cards.push({
				suit: s,
				value: v,
				isFaceUp: false,
				isJoker: false,
			});
		}
	}

	shuffleArray(cards);
	return cards;
}
