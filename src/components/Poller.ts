export class Poller
{
	method: (poller: Poller) => void;
	periodMillis: number;
	isCancelled: boolean;
	boundFn: () => void;

	constructor(method: (poller: Poller) => void, periodMillis: number) {
		this.method = method;
		this.periodMillis = periodMillis?periodMillis:30000;
		this.isCancelled = false;
		var me = this;
		this.boundFn = function() {
			me.onTime();
		}.bind(this);

		setTimeout(this.boundFn, periodMillis);
	}


	onTime() {
		if (!this.isCancelled) {
			this.method(this);
			setTimeout(this.boundFn, this.periodMillis);
		}
	}
	getPeriodMillis() {
		return this.periodMillis;
	}
	setPeriodMillis(newPeriodMillis: number) {
		this.periodMillis = newPeriodMillis;
	}
	cancel() {
		this.isCancelled = true;
	}
}

