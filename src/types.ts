import imageHeart from "./assets/heart.svg";
import imageDiamond from "./assets/diamond.svg";
import imageClub from "./assets/club.svg";
import imageSpade from "./assets/spade.svg";

import imageHeartsA from "./assets/cards3/images/cards_01.png";
import imageHearts2 from "./assets/cards3/images/cards_02.png";
import imageHearts3 from "./assets/cards3/images/cards_03.png";
import imageHearts4 from "./assets/cards3/images/cards_04.png";
import imageHearts5 from "./assets/cards3/images/cards_05.png";
import imageHearts6 from "./assets/cards3/images/cards_06.png";
import imageHearts7 from "./assets/cards3/images/cards_07.png";
import imageHearts8 from "./assets/cards3/images/cards_08.png";
import imageHearts9 from "./assets/cards3/images/cards_09.png";
import imageHearts10 from "./assets/cards3/images/cards_10.png";
import imageHeartsJ from "./assets/cards3/images/cards_11.png";
import imageHeartsQ from "./assets/cards3/images/cards_12.png";
import imageHeartsK from "./assets/cards3/images/cards_13.png";

import imageDiamondsA from "./assets/cards3/images/cards_14.png";
import imageDiamonds2 from "./assets/cards3/images/cards_15.png";
import imageDiamonds3 from "./assets/cards3/images/cards_16.png";
import imageDiamonds4 from "./assets/cards3/images/cards_17.png";
import imageDiamonds5 from "./assets/cards3/images/cards_18.png";
import imageDiamonds6 from "./assets/cards3/images/cards_19.png";
import imageDiamonds7 from "./assets/cards3/images/cards_20.png";
import imageDiamonds8 from "./assets/cards3/images/cards_21.png";
import imageDiamonds9 from "./assets/cards3/images/cards_22.png";
import imageDiamonds10 from "./assets/cards3/images/cards_23.png";
import imageDiamondsJ from "./assets/cards3/images/cards_24.png";
import imageDiamondsQ from "./assets/cards3/images/cards_25.png";
import imageDiamondsK from "./assets/cards3/images/cards_26.png";

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

export const cardWordValues = new Map([
	["Ace", 1],
	["Jack", 11],
	["Queen", 12],
	["King", 13],
]);

export const cardNumberValues = new Map([
	[1, "Ace"],
	[11, "Jack"],
	[12, "Queen"],
	[13, "King"],
]);

export const cardSuitCodes = new Map([
	["H", Suit.Hearts],
	["D", Suit.Diamonds],
	["C", Suit.Clubs],
	["S", Suit.Spades],
]);

export const suitImages = [
	imageHeart,
	imageDiamond,
	imageClub,
	imageSpade,
];

export const cardImages = new Map<string, string>([
	["H1", imageHeartsA],
	["H2", imageHearts2],
	["H3", imageHearts3],
	["H4", imageHearts4],
	["H5", imageHearts5],
	["H6", imageHearts6],
	["H7", imageHearts7],
	["H8", imageHearts8],
	["H9", imageHearts9],
	["H10", imageHearts10],
	["H11", imageHeartsJ],
	["H12", imageHeartsQ],
	["H13", imageHeartsK],

	["D1", imageDiamondsA],
	["D2", imageDiamonds2],
	["D3", imageDiamonds3],
	["D4", imageDiamonds4],
	["D5", imageDiamonds5],
	["D6", imageDiamonds6],
	["D7", imageDiamonds7],
	["D8", imageDiamonds8],
	["D9", imageDiamonds9],
	["D10", imageDiamonds10],
	["D11", imageDiamondsJ],
	["D12", imageDiamondsQ],
	["D13", imageDiamondsK],

	["C1", imageHeartsA],
	["C2", imageHearts2],
	["C3", imageHearts3],
	["C4", imageHearts4],
	["C5", imageHearts5],
	["C6", imageHearts6],
	["C7", imageHearts7],
	["C8", imageHearts8],
	["C9", imageHearts9],
	["C10", imageHearts10],
	["C11", imageHeartsJ],
	["C12", imageHeartsQ],
	["C13", imageHeartsK],

	["S1", imageDiamondsA],
	["S2", imageDiamonds2],
	["S3", imageDiamonds3],
	["S4", imageDiamonds4],
	["S5", imageDiamonds5],
	["S6", imageDiamonds6],
	["S7", imageDiamonds7],
	["S8", imageDiamonds8],
	["S9", imageDiamonds9],
	["S10", imageDiamonds10],
	["S11", imageDiamondsJ],
	["S12", imageDiamondsQ],
	["S13", imageDiamondsK],
]);

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
