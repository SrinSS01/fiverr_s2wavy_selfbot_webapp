'use client'

import React, { useEffect, useState } from "react";
import TokenInput from "./components/TokenInput";
import ShowConfig from "./components/ShowConfig";
import PlayIcon from "./icons/Play.svg"
import StopIcon from "./icons/Stop.svg"
import EditIcon from "./icons/Edit.svg"
import DeleteIcon from "./icons/Delete.svg"
import OfflineStatusIcon from "./icons/OfflineStatus.svg"
import OnlineStatusIcon from "./icons/OnlineStatus.svg"
import Image from "next/image";
import { APIEndPoint } from "./config/Config";

type SelfBotUsers = {
	user_id: string;
	name: string;
	avatar: string;
	bot_running: boolean;
};

export type { SelfBotUsers };

export default function Home() {
	const [ users, setUsers ] = useState<SelfBotUsers[]>([]);
	const [ selectedUser, setSelectedUser ] = useState<SelfBotUsers>();
	const [ showConfig, setShowConfig ] = useState(false);
	const [ hoverIndex, setHoverIndex ] = useState<number>();
	const [ error, setError ] = useState<string | undefined>();
	const [ success, setSuccess ] = useState<string | undefined>();
	const [ showDeleteModal, setShowDeleteModal ] = useState(false);

	function fetchUsers() {
		fetch(`${APIEndPoint}/self_bot_users`, { cache: "no-store" })
			.then(res => res.json())
			.then(_json => setUsers(_json))
			.catch(console.error);
	}

	useEffect(() => {
		fetchUsers();
	}, []);

	async function handleResponse(response: Response) {
		const json = await response.json();
		if ( !response.ok ) {
			setError(JSON.stringify(json));
			setTimeout(() => setError(undefined), 5000);
			fetchUsers();
			return;
		}
		setSuccess(JSON.stringify(json));
		setTimeout(() => setSuccess(undefined), 5000);
		fetchUsers();
	}

	async function StopBot(user_id: string) {
		const response = await fetch(`${APIEndPoint}/stop_bot/${ user_id }`, { method: "POST" });
		await handleResponse(response);
	}

	async function StartBot(user_id: string) {
		const response = await fetch(`${APIEndPoint}/start_bot/${ user_id }`, { method: "POST" });
		await handleResponse(response);
	}

	async function DeleteBot(user_id: string) {
		const response = await fetch(`${APIEndPoint}/self_bot_users/${ user_id }`, { method: "DELETE" });
		await handleResponse(response);
	}

	const ShowPlayStopButtons = ({ showPlay, is_hover, user_id }: {
		showPlay: boolean;
		is_hover: boolean;
		user_id: string
	}) => {
		if ( !showPlay ) {
			return <Image className={ `${ is_hover ? "block" : "hidden" } cursor-pointer` }
						  src={ PlayIcon } alt="play"
						  onClick={ async () => await StartBot(user_id) }/>;
		}
		return <Image className={ `${ is_hover ? "block" : "hidden" } cursor-pointer` }
					  src={ StopIcon } alt="stop"
					  onClick={ async () => await StopBot(user_id) }/>
	}

	return (
		<>
			{
				showConfig ?
					<div className={ "text-white w-full h-full" }>{ selectedUser ?
						<ShowConfig user={ selectedUser } setShowConfig={ setShowConfig }/> : "Null"
					}</div>
					:
					<div className={ "flex flex-col outline outline-2 p-5 w-[700px]" }>{
						users.map((user, index) =>
							<div
								key={ index }
								className={ "flex justify-between items-center hover:bg-gray-700 p-2 pl-4 pr-4" }
								onMouseEnter={ () => {
									setHoverIndex(index)
								} }
								onMouseLeave={ () => {
									setHoverIndex(undefined)
								} }>
								<div className={ "flex items-center gap-5" }>
									{ user.bot_running ?
										<Image src={ OnlineStatusIcon } alt={ "online" }/> :
										<Image src={ OfflineStatusIcon } alt={ "offline" }/> }
									<img className={ "rounded-full" }
										 src={ user.avatar === null ? `https://cdn.discordapp.com/avatars/0.png?size=256` : `https://cdn.discordapp.com/avatars/${ user.user_id }/${ user.avatar }.png?size=256` }
										 width={ 100 } alt={ user.name }></img>
									<div className={ "flex flex-col" }>
										<span className={ "text-3xl font-bold" }>{ user.name }</span>
										<span>{ user.user_id }</span>
									</div>
								</div>
								<div className={ "flex items-center gap-2" }>
									<ShowPlayStopButtons showPlay={ user.bot_running } is_hover={ hoverIndex == index }
														 user_id={ user.user_id }/>
									<Image className={ `${ hoverIndex == index ? "block" : "hidden" } cursor-pointer` }
										   src={ EditIcon } alt="edit" onClick={ () => {
										setShowConfig(true);
										setSelectedUser(user);
									} }/>
									<Image className={ `${ hoverIndex == index ? "block" : "hidden" } cursor-pointer` }
										   src={ DeleteIcon } alt={ "delete" }
										   onClick={ () => {
											   setShowDeleteModal(true);
											   setSelectedUser(user);
										   } }/>
								</div>
							</div>)
					}
						<TokenInput resetUsers={ setUsers }/>
					</div>
			}
			{ showDeleteModal && selectedUser ? <dialog
				className={ "bg-gray-950 border-2 border-gray-600 text-gray-300 font-mono font-bold p-5 pl-10 pr-10 flex flex-col items-center" }>
				<div className={ "m-10" }>Do you want to delete this bot?</div>
				<form method={ "dialog" }>
					<button className={ "m-3 bg-green-950 border-2 border-green-500 p-2 pl-4 pr-4 hover:bg-green-800" }
							onClick={ async () => {
								setShowDeleteModal(false);
								await DeleteBot(selectedUser.user_id);
								setSelectedUser(undefined);
							} }>Yes
					</button>
					<button className={ "m-3 bg-red-950 border-2 border-red-500 p-2 pl-4 pr-4 hover:bg-red-800" }
							onClick={ () => setShowDeleteModal(false) }>Cancel
					</button>
				</form>
			</dialog>: <></> }
			<div className={ error ? "absolute font-bold font-mono bottom-0 left-0 bg-red-500 pl-4 pr-4 p-2" : "" }>{ error ?? "" }</div>
			<div
				className={ success ? "absolute font-bold font-mono bottom-0 left-0 bg-green-500 pl-4 pr-4 p-2" : "" }>{ success ?? "" }</div>
		</>
	);
}
