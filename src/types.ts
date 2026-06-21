import imageHeart from "./assets/heart.svg";
import imageDiamond from "./assets/diamond.svg";
import imageClub from "./assets/club.svg";
import imageSpade from "./assets/spade.svg";

import imageRed2 from "./assets/cards3/images/card_02.png";
import imageRed3 from "./assets/cards3/images/card_03.png";
import imageRed4 from "./assets/cards3/images/card_04.png";
import imageRed5 from "./assets/cards3/images/card_05.png";
import imageRed6 from "./assets/cards3/images/card_06.png";
import imageRed7 from "./assets/cards3/images/card_07.png";
import imageRed8 from "./assets/cards3/images/card_08.png";
import imageRed9 from "./assets/cards3/images/card_09.png";
import imageRed10 from "./assets/cards3/images/card_10.png";
import imageRedJ from "./assets/cards3/images/card_j.png";
import imageRedK from "./assets/cards3/images/card_k.png";

import imageBlack2 from "./assets/cards3/images/card_02b.png";
import imageBlack3 from "./assets/cards3/images/card_03b.png";
import imageBlack4 from "./assets/cards3/images/card_04b.png";
import imageBlack5 from "./assets/cards3/images/card_05b.png";
import imageBlack6 from "./assets/cards3/images/card_06b.png";
import imageBlack7 from "./assets/cards3/images/card_07b.png";
import imageBlack8 from "./assets/cards3/images/card_08b.png";
import imageBlack9 from "./assets/cards3/images/card_09b.png";
import imageBlack10 from "./assets/cards3/images/card_10b.png";
import imageBlackJ from "./assets/cards3/images/card_jb.png";
import imageBlackK from "./assets/cards3/images/card_kb.png";

import imageAHearts from "./assets/cards3/images/card_ah.png";
import imageADiamonds from "./assets/cards3/images/card_ad.png";
import imageAClubs from "./assets/cards3/images/card_ac.png";
import imageASpades from "./assets/cards3/images/card_as.png";

import imageQHearts from "./assets/cards3/images/card_qh.png";
import imageQDiamonds from "./assets/cards3/images/card_qd.png";
import imageQClubs from "./assets/cards3/images/card_qc.png";
import imageQSpades from "./assets/cards3/images/card_qs.png";

//import imageBack from "./assets/cards3/images/back.png";

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
	["H", "Hearts"],
	["D", "Diamonds"],
	["C", "Clubs"],
	["S", "Spades"],
]);

export const cardSuitStrings = new Map([
	["Hearts", Suit.Hearts],
	["Diamonds", Suit.Diamonds],
	["Clubs", Suit.Clubs],
	["Spades", Suit.Spades],
]);

export const suitImages = [
	imageHeart,
	imageDiamond,
	imageClub,
	imageSpade,
];

export const cardImages = new Map<string, string>([
	["H1", imageAHearts],
	["H2", imageRed2],
	["H3", imageRed3],
	["H4", imageRed4],
	["H5", imageRed5],
	["H6", imageRed6],
	["H7", imageRed7],
	["H8", imageRed8],
	["H9", imageRed9],
	["H10", imageRed10],
	["H11", imageRedJ],
	["H12", imageQHearts],
	["H13", imageRedK],

	["D1", imageADiamonds],
	["D2", imageRed2],
	["D3", imageRed3],
	["D4", imageRed4],
	["D5", imageRed5],
	["D6", imageRed6],
	["D7", imageRed7],
	["D8", imageRed8],
	["D9", imageRed9],
	["D10", imageRed10],
	["D11", imageRedJ],
	["D12", imageQDiamonds],
	["D13", imageRedK],

	["C1", imageAClubs],
	["C2", imageBlack2],
	["C3", imageBlack3],
	["C4", imageBlack4],
	["C5", imageBlack5],
	["C6", imageBlack6],
	["C7", imageBlack7],
	["C8", imageBlack8],
	["C9", imageBlack9],
	["C10", imageBlack10],
	["C11", imageBlackJ],
	["C12", imageQClubs],
	["C13", imageBlackK],

	["S1", imageASpades],
	["S2", imageBlack2],
	["S3", imageBlack3],
	["S4", imageBlack4],
	["S5", imageBlack5],
	["S6", imageBlack6],
	["S7", imageBlack7],
	["S8", imageBlack8],
	["S9", imageBlack9],
	["S10", imageBlack10],
	["S11", imageBlackJ],
	["S12", imageQSpades],
	["S13", imageBlackK],
]);

////////////////////////////////////////////////////////////////////////////////////////////////////

export interface ConnectionInfo {
	address: string,
	slot: string,
	password: string,
	hintMode: boolean,
}

export interface ArchipelagoOptions {
	death_link: boolean,
	death_link_criteria: number,
	death_link_criteria_count: number,
	trap_fill_percentage: number,
}

export enum ConnectionStatus {
	Disconnected,
	Disconnecting,
	Connecting,
	Connected,
}

export enum DeathLinkCriteria {
	GameReset,
	ExhaustDeck,
}

export enum TrapType {
	RainbowTrap,
	MirrorTrap,
	FreezeTrap,
}

export interface NetworkItem {
	item: number,
	location: number,
	player: number,
	flags: number,
}

export interface PlayerInfo {
	name: string,
	game: string,
}

export interface DataPackageEntry {
	item_name_to_id: Record<string, number>,
	location_name_to_id: Record<string, number>,
	checksum: string,
}

export type DataPackage = Record<string, DataPackageEntry>;
