import { useMemo, useRef, useState } from "react";
import {v4 as uuidv4} from "uuid";
import { buildCardDeck, doRectsOverlap, getCardNameFromUid, getCardUid, getRandomTrapType, rectDistanceSquared } from "./utils";
import { ArchipelagoOptions, Card, CardLocation, cardSuitStrings, ConnectionInfo, ConnectionStatus, DataPackage, DeathLinkCriteria, DeathLinkPunishment, DragData, DropZone, GameState, NetworkItem, PlayerInfo, Suit, SuitColors, TrapType, Vector2 } from "./types";
import Tableau from "./piles/Tableau";
import Foundation from "./piles/Foundation";
import Waste from "./piles/Waste";
import Stock from "./piles/Stock";
import ConnectPanel from "./archipelago/ConnectPanel";

import titleBackground from "./assets/sunray.svg";

import "./App.css";
import Console from "./archipelago/Console";
import SuitProgressionDisplay from "./archipelago/SuitProgressionDisplay";

function App() {
	const [gameState, setGameState] = useState(generateNewGame);

	const [draggedCard, setDraggedCard] = useState("");
	const [draggedCardOffset, setDraggedCardOffset] = useState<Vector2>({x: 0, y: 0});
	const [draggedCardStartPos, setDraggedCardStartPos] = useState<Vector2>({x: 0, y: 0});

	const websocket = useRef<WebSocket | null>(null);
	const connectInfo = useRef<ConnectionInfo>({address: "", slot: "", password: ""});
	const dataPackage = useRef<DataPackage>({});
	//const players = useRef<[string, string][]>([]);
	const players = useRef<Map<number, PlayerInfo>>(new Map());
	//const games = useRef<string[]>([]);
	//const itemIdToName = useRef<Map<string, string>>(new Map());
	//const locationIdToName = useRef<Map<string, string>>(new Map());
	const itemIdToName = useRef<Map<string, Map<string, string>>>(new Map());
	const locationIdToName = useRef<Map<string, Map<string, string>>>(new Map());
	//const cardsToUnlock = useRef<string[]>([]);
	const preDataPackageItems = useRef<NetworkItem[]>([]);
	const archipelagoSeed = useRef("");
	const archipelagoSlot = useRef(-1);
	const archipelagoSlotName = useRef("");
	const [connectionStatus, setConnectionStatus] = useState(ConnectionStatus.Disconnected);
	const [consoleMessages, setConsoleMessages] = useState<string[]>([]);

	const [archipelagoOptions, setArchipelagoOptions] = useState<ArchipelagoOptions>({
		death_link: false,
		death_link_criteria: 0,
		death_link_criteria_count: 0,
		death_link_punishment: 0,
		trap_fill_percentage: 0,
	});
	//const [unlockedCards, setUnlockedCards] = useState<string[]>([]);
	//const [suitProgressions, setSuitProgressions] = useState<number[]>([0, 0, 0, 0]);
	const [heartsProgression, setHeartsProgression] = useState(0);
	const [diamondsProgression, setDiamondsProgression] = useState(0);
	const [clubsProgression, setClubsProgression] = useState(0);
	const [spadesProgression, setSpadesProgression] = useState(0);

	const suitProgressions = useMemo(
		() => [heartsProgression, diamondsProgression, clubsProgression, spadesProgression],
		[heartsProgression, diamondsProgression, clubsProgression, spadesProgression],
	);

	const [mirrorTrapActive, setMirrorTrapActive] = useState(false);
	const [rainbowTrapActive, setRainbowTrapActive] = useState(false);

	const [gameResetCount, setGameResetCount] = useState(0);
	const [throughDeckCount, setThroughDeckCount] = useState(0);

	////////////////////////////////////////////////////////////////////////////////////////////////

	function printToConsole(msg: string) {
		setConsoleMessages(oldConsole => [...oldConsole, msg]);
	}

	function onClickConnect(isDisconnect: boolean, info: ConnectionInfo) {
		if (!isDisconnect) {
			const socket = new WebSocket(`wss://${info.address}`);
			socket.onopen = onWebsocketConnect;
			socket.onmessage = onWebsocketMessage;
			socket.onerror = onWebsocketError;
			socket.onclose = onWebsocketDisconnect;

			websocket.current = socket;
			connectInfo.current = info;
			setConnectionStatus(ConnectionStatus.Connecting);
			archipelagoSlotName.current = info.slot;

		} else {
			setConnectionStatus(ConnectionStatus.Disconnecting);
			websocket.current?.close();
		}
	}

	function sendCommand(command: object) {
		websocket.current?.send(JSON.stringify([command]));
	}

	function onWebsocketConnect() {
		sendCommand({
			cmd: "Connect",
			tags: ["DeathLink"],
			game: "Solitaire",
			password: connectInfo.current.password,
			name: connectInfo.current.slot,
			uuid: uuidv4(),
			version: {class: "Version", major: 0, minor: 7, build: 0},
			items_handling: 0b111,
			slot_data: true,
		});
	}

	function onWebsocketMessage(msg: MessageEvent) {
		const data = JSON.parse(msg.data);

		for (const packet of data) {
			const cmd = packet.cmd ?? "";

			console.log(packet);

			switch (cmd) {
				case "RoomInfo": {
					archipelagoSeed.current = packet.seed_name;
					//games.current = packet.games;
					const localChecksums = JSON.parse(localStorage.collectItem(`dataChecksums_${packet.seed_name}`) ?? "{}");
					const staleGames = [];
					for (const [game, checksum] of Object.entries(packet.datapackage_checksums)) {
						if (localChecksums[game] !== checksum) {
							staleGames.push(game);
						}
					}

					if (staleGames.length > 0) {
						sendCommand({
							cmd: "GetDataPackage",
							//games: staleGames,
						});

						localStorage.setItem(`dataChecksums_${packet.seed_name}`, JSON.stringify(packet.datapackage_checksums));
					} else {
						dataPackage.current = JSON.parse(localStorage.collectItem(`data_${packet.seed_name}_${archipelagoSlotName.current}`) ?? "{}");

						/*const itemIdToNameMap = new Map<string, string>();
						for (const [name, id] of Object.entries<number>(dataPackage.current.Solitaire.item_name_to_id)) {
							itemIdToNameMap.set(String(id), name);
						}

						const locationIdToNameMap = new Map<string, string>();
						for (const [name, id] of Object.entries<number>(dataPackage.current.Solitaire.location_name_to_id)) {
							locationIdToNameMap.set(String(id), name);
						}

						itemIdToName.current = itemIdToNameMap;
						locationIdToName.current = locationIdToNameMap;*/

						//buildIdMappings(dataPackage.current);
					}
				} break;

				case "DataPackage": {
					localStorage.setItem(`data_${archipelagoSeed.current}_${archipelagoSlotName.current}`, JSON.stringify(packet.data.games));
					dataPackage.current = packet.data.games;

					/*const itemIdToNameMap = new Map<string, string>();
					for (const [name, id] of Object.entries<number>(packet.data.games.Solitaire.item_name_to_id)) {
						itemIdToNameMap.set(String(id), name);
					}

					itemIdToName.current = itemIdToNameMap;*/

					buildIdMappings(packet.data.games);

					if (preDataPackageItems.current.length > 0) {
						for (const item of preDataPackageItems.current) {
							//const itemDecoded = itemIdToName.current.get(players.current.get(archipelagoSlot.current)!.game)?.get(String(item.item));
							const itemDecoded = getItemName(String(item.item), archipelagoSlot.current);
							if (itemDecoded !== undefined) {
								collectItem(itemDecoded);
							} else {
								console.error(`Invalid item: ${item.toString()}`);
							}
						}

						preDataPackageItems.current = [];
					}
				} break;

				case "Connected": {
					archipelagoSlot.current = packet.slot;

					setConnectionStatus(ConnectionStatus.Connected);
					setArchipelagoOptions(packet.slot_data);

					const playersMap = new Map<number, PlayerInfo>();
					for (const [num, data] of Object.entries(packet.slot_info)) {
						playersMap.set(Number(num), {name: packet.players[Number(num) - 1].alias, game: data.game})
					}

					players.current = playersMap;

					if (Object.keys(dataPackage.current).length > 0) {
						buildIdMappings(dataPackage.current);
					}
					
					if (!loadGame()) {
						generateNewGame();
					}
				} break;

				case "ConnectionRefused": {
					setConnectionStatus(ConnectionStatus.Disconnected);
				} break;

				case "PrintJSON": {
					let result = "";
					for (const part of packet.data) {
						switch (part.type ?? "text") {
							case "text": {
								result += part.text;
							} break;

							case "player_id": {
								result += players.current.get(Number(part.text));
							} break;

							case "item_id": {
								//result += itemIdToName.current[part.player - 1].get(part.text);
								result += getItemName(part.text, part.player);
							} break;

							case "location_id": {
								//result += locationIdToName.current[part.player - 1].get(part.text);
								result += getLocationName(part.text, part.player);
							} break;
						}
					}

					printToConsole(result);
				} break;

				case "ReceivedItems": {
					console.log(itemIdToName.current);
					console.log(archipelagoSlotName.current)
					if (Object.keys(dataPackage.current).length > 0) {
						for (const item of packet.items) {
							//const itemDecoded = itemIdToName.current[archipelagoSlot.current - 1].get(String(item.item));
							const itemDecoded = getItemName(String(item.item), archipelagoSlot.current);
							if (itemDecoded !== undefined) {
								collectItem(itemDecoded);
							} else {
								console.error(`Invalid item: ${item.item}`);
							}
						}
					} else {
						preDataPackageItems.current = preDataPackageItems.current.concat(packet.items);
					}
				} break;

				case "Bounced": {
					if (packet.data.source !== archipelagoSlotName.current && packet.tags?.includes("DeathLink") && archipelagoOptions.death_link) {
						console.log("DEATH LINK RECEIVED");
						switch (archipelagoOptions.death_link_punishment) {
							case DeathLinkPunishment.ResetGame: {
								const newState = generateNewGame();
								setGameState(newState);
								saveGame(newState);
							} break;

							case DeathLinkPunishment.RandomTrap: {
								console.log("test");
								applyTrap(getRandomTrapType());
							} break;

							case DeathLinkPunishment.Defoundation: {
								const newGameState = {...gameState};
								for (const foundation of newGameState.foundations) {
									const card = foundation.pop();
									if (card !== undefined) {
										newGameState.stock.splice(0, 0, card);
									}
								}

								setGameState(newGameState);
								saveGame(newGameState);
							} break;

							case DeathLinkPunishment.Blackout: {
								const newGameState = {...gameState};
								for (const depot of newGameState.tableau) {
									for (let i = 0; i < depot.length - 1; ++i) {
										depot[i].isFaceUp = false;
									}
								}

								setGameState(newGameState);
								saveGame(newGameState);
							} break;

							case DeathLinkPunishment.Freeze: {

							} break;

							default: break;
						}
					}
				} break;
				
				default: {
					console.warn(`UNIMPLEMENTED PACKET: ${cmd}`);
				} break;
			}
		}
	}

	function onWebsocketError(event: Event) {
		console.error(event);
	}

	function onWebsocketDisconnect(event: CloseEvent) {
		if (event.code === 1015) {
			printToConsole(`Couldn't connect to Archipelago server at ${connectInfo.current.address}.`);
		}

		setConnectionStatus(ConnectionStatus.Disconnected);
		console.log(event);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

	/*function buildIdMappings(dataPackage: DataPackage) {
		const itemIdToNameMap = new Map<string, string>();
		for (const [name, id] of Object.entries<number>(dataPackage.current.Solitaire.item_name_to_id)) {
			itemIdToNameMap.set(String(id), name);
		}

		const locationIdToNameMap = new Map<string, string>();
		for (const [name, id] of Object.entries<number>(dataPackage.current.Solitaire.location_name_to_id)) {
			locationIdToNameMap.set(String(id), name);
		}

		itemIdToName.current = itemIdToNameMap;
		locationIdToName.current = locationIdToNameMap;
	}*/

	function buildIdMappings(dataPackage: DataPackage) {
		const itemIdToNameMap: Map<string, Map<string, string>> = new Map();
		const locationIdToNameMap: Map<string, Map<string, string>> = new Map();
		console.log(players.current);
		//console.log(games.current);
		//console.log(dataPackage);
		/*players.current.forEach((_player, index) => {
			const playerItemMap = new Map<string, string>();
			for (const [name, id] of Object.entries<number>(dataPackage[games.current[index]]["item_name_to_id"])) {
				playerItemMap.set(String(id), name);
			}

			const playerLocationMap = new Map<string, string>();
			for (const [name, id] of Object.entries<number>(dataPackage[games.current[index]]["location_name_to_id"])) {
				playerLocationMap.set(String(id), name);
			}

			itemIdToNameMap.push(playerItemMap);
			locationIdToNameMap.push(playerLocationMap);
		});*/

		players.current.forEach((player) => {
			if (!itemIdToNameMap.has(player.game)) {
				const gameItemMap = new Map<string, string>();
				for (const [name, id] of Object.entries<number>(dataPackage[player.game]["item_name_to_id"])) {
					gameItemMap.set(String(id), name);
				}

				const gameLocationMap = new Map<string, string>();
				for (const [name, id] of Object.entries<number>(dataPackage[player.game]["location_name_to_id"])) {
					gameLocationMap.set(String(id), name);
				}

				itemIdToNameMap.set(player.game, gameItemMap);
				locationIdToNameMap.set(player.game, gameLocationMap);
			}
		});

		itemIdToName.current = itemIdToNameMap;
		locationIdToName.current = locationIdToNameMap;
	}

	function getItemName(id: string, player: number): string {
		return itemIdToName.current.get(players.current.get(player)?.game ?? "")?.get(id) ?? "NULL";
	}

	function getLocationName(id: string, player: number): string {
		return locationIdToName.current.get(players.current.get(player)?.game ?? "")?.get(id) ?? "NULL";
	}

	////////////////////////////////////////////////////////////////////////////////////////////////

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

		return {
			tableau: newTableau,
			stock: cards,
			foundations: [[], [], [], []],
			waste: [],
		};
	}

	function saveGame(state: GameState) {
		const saveData = JSON.stringify(state);
		localStorage.setItem(`save_${archipelagoSeed.current}_${archipelagoSlotName.current}`, saveData);
	}

	function loadGame(): boolean {
		const saveData = localStorage.collectItem(`save_${archipelagoSeed.current}_${archipelagoSlotName.current}`);
		if (saveData !== null) {
			setGameState(JSON.parse(saveData));
			return true;
		} else {
			return false;
		}
	}

	function collectItem(item: string) {
		switch (item) {
			case "Rainbow Trap": {
				applyTrap(TrapType.RainbowTrap);
			} break;

			case "Mirror Trap": {
				applyTrap(TrapType.MirrorTrap);
			} break;

			case "Freeze Trap": {
				applyTrap(TrapType.FreezeTrap);
			} break;

			default: {
				const suit = cardSuitStrings.get(item.split(" ")[1])!;
				addSuitProgression(suit);
			} break;
		}
	}

	function addSuitProgression(suit: Suit) {
		switch (suit) {
			case Suit.Hearts:
				setHeartsProgression(old => old + 1);
				break;
			case Suit.Diamonds:
				setDiamondsProgression(old => old + 1);
				break;
			case Suit.Clubs:
				setClubsProgression(old => old + 1);
				break;
			case Suit.Spades:
				setSpadesProgression(old => old + 1);
				break;
		}
	}

	function drawCard() {
		const newState = {...gameState};
		const card = newState.stock.pop() ?? null;
		if (card !== null) {
			card.isFaceUp = true;
			newState.waste.push(card);
			setGameState(newState);
			saveGame(newState);
		}
	}

	function resetStock() {
		const newState = {...gameState};
		const cards = newState.waste;
		cards.reverse();
		for (const card of cards) {
			card.isFaceUp = false;
		}

		newState.waste = [];
		newState.stock = cards;
		setGameState(newState);

		if (archipelagoOptions.death_link && archipelagoOptions.death_link_criteria === DeathLinkCriteria.ExhaustDeck) {
			const throughCount = throughDeckCount + 1;
			if (throughCount >= archipelagoOptions.death_link_criteria_count) {
				sendCommand({
					cmd: "Bounce",
					tags: ["DeathLink"],
					data: {
						"time": Date.now(),
						"cause": `${archipelagoSlotName} went through the deck too many times.`,
						"source": archipelagoSlotName,
					},
				});

				setThroughDeckCount(0);
			} else {
				setThroughDeckCount(throughCount);
			}
		}
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

	function takeCardFromDepot(index: number, indexInStack: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newTableau[index] = newTableau[index].slice(0, indexInStack);
		if (newTableau[index].length > 0) {
			newTableau[index][newTableau[index].length - 1].isFaceUp = true;
		}

		return [newTableau, newFoundations, newWaste];
	}

	function tryAddCardsToFoundation(cards: Card[], index: number): [Card[][], Card[][]] | [null, null] {
		if (suitProgressions[cards[0].suit] >= cards[0].value) {
			const targetCard: Card | null = gameState.foundations[index][gameState.foundations[index].length - 1] ?? null;
			const bottomCard = cards[0];
			if (cards.length === 1 && (targetCard === null && bottomCard.value == 1 || bottomCard.suit === targetCard?.suit && bottomCard.value === targetCard?.value + 1)) {
				const newFoundations = [...gameState.foundations];
				newFoundations[index] = newFoundations[index].concat(cards);

				const cardId = getCardUid(cards[0]);
				const cardName = `${getCardNameFromUid(cardId)} on foundation`;
				const checks = [dataPackage.current.Solitaire.location_name_to_id[cardName]];
				if (cards[0].value == 13) {
					checks.push(dataPackage.current.Solitaire.location_name_to_id[`${cards[0].suit} Done`]);
				}

				sendCommand({
					cmd: "LocationChecks",
					locations: checks,
				});

				return [gameState.tableau, newFoundations];
			}
		}
		
		return [null, null];
	}

	function takeCardFromFoundation(index: number, _: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newFoundations[index].pop();
		return [newTableau, newFoundations, newWaste];
	}

	function takeCardFromWaste(_: number, __: number, newTableau: Card[][], newFoundations: Card[][], newWaste: Card[]): [Card[][], Card[][], Card[]] {
		newWaste.pop();
		return [newTableau, newFoundations, newWaste];
	}

	function applyTrap(trapType: TrapType) {
		switch (trapType) {
			case TrapType.RainbowTrap: {
				setRainbowTrapActive(true);
				setTimeout(() => {
					setRainbowTrapActive(false);
				}, 30000);
			} break;

			case TrapType.MirrorTrap: {
				setMirrorTrapActive(true);
				setTimeout(() => {
					setMirrorTrapActive(false);
				}, 30000);
			} break;

			case TrapType.FreezeTrap: {
				setRainbowTrapActive(true);
				setTimeout(() => {
					setRainbowTrapActive(false);
				}, 20000);
			} break;
		}
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
			const removeFunc = location === CardLocation.Foundation ? takeCardFromFoundation : location === CardLocation.Depot ? takeCardFromDepot : takeCardFromWaste;

			let [newTableau, newFoundations] = (addFunc)(cards, closestZone.index);
			let newWaste = gameState.waste;
			if (newTableau !== null && newFoundations !== null) {
				[newTableau, newFoundations, newWaste] = (removeFunc)(index, indexInStack, newTableau, newFoundations, newWaste);
				const newState = {
					tableau: newTableau,
					foundations: newFoundations,
					stock: gameState.stock,
					waste: newWaste,
				};

				setGameState(newState);
				saveGame(newState);
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

	function onClickReset() {
		const reset = confirm(`Really reset the game?${archipelagoOptions.death_link_criteria === DeathLinkCriteria.GameReset && gameResetCount + 1 >= archipelagoOptions.death_link_criteria_count ? " This will send a DeathLink." : ""}`);
		if (reset) {
			const newState = generateNewGame();
			setGameState(newState);
			saveGame(newState);

			if (archipelagoOptions.death_link && archipelagoOptions.death_link_criteria === DeathLinkCriteria.GameReset) {
				const resetCount = gameResetCount + 1;
				if (resetCount >= archipelagoOptions.death_link_criteria_count) {
					sendCommand({
						cmd: "Bounce",
						tags: ["DeathLink"],
						data: {
							"time": Date.now(),
							"cause": `${archipelagoSlotName.current} reset their Solitaire game${archipelagoOptions.death_link_criteria_count > 1 ? " too many times" : ""}.`,
							"source": archipelagoSlotName.current,
						},
					});

					setGameResetCount(0);
				} else {
					setGameResetCount(resetCount);
				}
			}
		}
	}

	const dragData = useMemo<DragData>(() => {
		return {
			draggedCard: draggedCard,
			dragOffset: draggedCardOffset,
			dragStartPos: draggedCardStartPos,
			onMouseDown: onCardMouseDown,
			onMouseUp: onCardMouseUp,
		};
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [draggedCard, draggedCardOffset, draggedCardStartPos]);

	return <div id="actual-root" onMouseMove={(e) => {
			if (draggedCard.length > 0) {
				setDraggedCardOffset({x: e.clientX, y: mirrorTrapActive ? window.innerHeight - e.clientY : e.clientY});
			}
		}}>
		<div id="main-screen">
			{connectionStatus === ConnectionStatus.Connected ? <div id="game" style={{transform: mirrorTrapActive ? "scaleY(-1)" : "none"}}>
				<button onClick={onClickReset}>Reset Game</button>
				<SuitProgressionDisplay progression={suitProgressions} />
				<div className="foundations-container">
					<Stock cards={gameState.stock} dragData={dragData} onClickCard={drawCard} onClickEmpty={resetStock} suitProgressions={suitProgressions} rainbowTrapActive={rainbowTrapActive} />
					<Waste cards={gameState.waste} dragData={dragData} suitProgressions={suitProgressions} rainbowTrapActive={rainbowTrapActive} />
					{gameState.foundations.map((foundation, index) => <Foundation key={index} index={index} cards={foundation} dragData={dragData} suitProgressions={suitProgressions} rainbowTrapActive={rainbowTrapActive} />)}
				</div>
				<Tableau depots={gameState.tableau} dragData={dragData} suitProgressions={suitProgressions} rainbowTrapActive={rainbowTrapActive} />
			</div> : <div id="title-screen">{false && <img src={titleBackground} />}</div>}
			<div id="archipelago-info">
				<ConnectPanel connectionStatus={connectionStatus} onClickConnect={onClickConnect} />
				<Console messages={consoleMessages} />
			</div>
		</div>
	</div>;
}

export default App;
