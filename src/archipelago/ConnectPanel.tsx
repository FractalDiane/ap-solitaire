import { useMemo, useState } from "react";
import { ConnectionStatus } from "../types";

import "./ConnectPanel.css";

export interface ConnectInfo {
	address: string,
	slot: string,
	password: string,
}

interface ConnectPanelProps {
	onClickConnect: (isDisconnected: boolean, info: ConnectInfo) => void,
	connectionStatus: ConnectionStatus,
}

export default function ConnectPanel(props: ConnectPanelProps) {
	const [address, setAddress] = useState("");
	const [slot, setSlot] = useState("");
	const [password, setPassword] = useState("");

	function getButtonName(): string {
		switch (props.connectionStatus) {
			case ConnectionStatus.Connected: return "Disconnect";
			case ConnectionStatus.Connecting: return "Connecting...";
			case ConnectionStatus.Disconnecting: return "Disconnecting...";
			case ConnectionStatus.Disconnected: return "Connect";
		}
	}

	const buttonDisabled = useMemo(() => {
		return props.connectionStatus === ConnectionStatus.Connecting
				|| props.connectionStatus === ConnectionStatus.Disconnecting
				|| address.length === 0
				|| slot.length === 0;
	}, [address, slot, props.connectionStatus])

	return <div id="connect-panel-parent">
		<form id="connect-panel">
			<label>Address</label>
			<input type="url" value={address} onChange={(event) => setAddress(event.target.value)}></input>
			<label>Slot Name</label>
			<input type="text" value={slot} onChange={(event) => setSlot(event.target.value)}></input>
			<label>Password</label>
			<input type="password" value={password} onChange={(event) => setPassword(event.target.value)}></input>
			<button type="button" disabled={buttonDisabled}
			onClick={() => props.onClickConnect(props.connectionStatus === ConnectionStatus.Connected, {
				address: address.trim(),
				slot: slot.trim(),
				password: password,
			})}>{getButtonName()}</button>
		</form>
		<div id="connect-panel-settings">
			Death Link <input type="checkbox"></input>
		</div>
	</div>;
}
