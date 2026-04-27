import imageHeart from "./assets/heart.svg";
import imageDiamond from "./assets/diamond.svg";
import imageClub from "./assets/club.svg";
import imageSpade from "./assets/spade.svg";

export interface Vector2 {
	x: number,
	y: number,
}

export enum CardLocation {
	Depot,
	Foundation,
	Stock,
	Waste,
}

export type CardMouseHandler = (mousePos: Vector2, cardRect: DOMRect, cardId: string, cards: Card[], location: CardLocation, index: number, indexInStack: number) => void;
export interface DragData {
	draggedCard: string,
	dragOffset: Vector2,
	dragStartPos: Vector2,

	onMouseDown: CardMouseHandler,
	onMouseUp: CardMouseHandler,
}

export interface GameState {
	tableau: Card[][],
	foundations: Card[][],
	stock: Card[],
	waste: Card[],
}

export interface DropZone {
	box: DOMRect,
	location: CardLocation,
	index: number,
}

export enum Suit {
	Hearts,
	Diamonds,
	Clubs,
	Spades,
}

export enum Color {
	Red,
	Black,
}

export const SuitColors = [
	Color.Red,
	Color.Red,
	Color.Black,
	Color.Black,
];

export interface Card {
	suit: Suit,
	value: number,
	isFaceUp: boolean,
	isJoker: boolean,
}

export const cardValues = [
	"0",
	"A",
	"2",
	"3",
	"4",
	"5",
	"6",
	"7",
	"8",
	"9",
	"10",
	"J",
	"Q",
	"K",
];

export const suitImages = [
	imageHeart,
	imageDiamond,
	imageClub,
	imageSpade,
];

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface ConnectionInfo {
	address: string,
	slot: string,
	password: string,
}

export enum ConnectionStatus {
	Disconnected,
	Disconnecting,
	Connecting,
	Connected,
}
