import React, { useEffect } from 'react';
import { gPhotoTimeAPI as photoTimeAPI} from '../api/PhototimeAPI';
import { Poller } from './Poller';

export function StatusCheck() {

	const [thumbStatus, setThumbStatus] = React.useState("Checking thumb status");

	var poller: Poller|null = null;

	const checkStatus = () => {
		console.log('checking thumb status');
		const gConx = photoTimeAPI.getConnection();

		if (!gConx || !poller)
			return;

		gConx.checkStatus().then((data) => {
			if (!poller)
				return;

			if (data.activeThumbTasks.length) {
				setThumbStatus(`thumb status: working on it, thumbs remaining: ${data.activeThumbTasks.length}`);
				poller.setPeriodMillis(3000);
			} else {
				setThumbStatus(`thumb status: all done`);
				// slow down check
				const periodMillis = poller.getPeriodMillis();
				if (periodMillis < 30000) {
					poller.setPeriodMillis(periodMillis+5000);
				} else {
					poller.cancel();
				}
			}
		}, (reason) => {
			console.warn('failed to check server status');
			// slow down
			if (!poller)
				return;
			const periodMillis = poller.getPeriodMillis();
			if (periodMillis < 30000) {
				poller.setPeriodMillis(periodMillis+5000);
			}				

		}).catch( (reason) => {
			console.log(reason);
		});
	};

	useEffect(() => {
		// call server to check thumb status
		poller = new Poller(checkStatus, 3000);
		return () => {
			if (poller)
				poller.cancel();
			poller = null;
		}
	});

	return (
		<>
		<div className="items-page-status" style={{paddingLeft: "10pt"}}>{thumbStatus}</div>
		</>
	);

}
