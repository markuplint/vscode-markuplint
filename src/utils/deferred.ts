export default class Deferred<T = undefined> implements PromiseLike<T> {
	#promise: Promise<T>;
	#resolve!: (value: T | PromiseLike<T>) => void;
	#reject!: (reason?: any) => void;

	constructor() {
		this.#promise = new Promise((resolve, reject) => {
			this.#resolve = resolve;
			this.#reject = reject;
		});
	}

	resolve(value: T | PromiseLike<T>) {
		this.#resolve(value);
	}

	reject(reason?: any) {
		this.#reject(reason);
	}

	then<TResult1 = T, TResult2 = never>(
		onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
		onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
	): PromiseLike<TResult1 | TResult2> {
		return this.#promise.then(onfulfilled, onrejected);
	}
}
