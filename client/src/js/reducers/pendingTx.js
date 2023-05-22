const pendingTxReducer = (state = '', action) => {
	switch (action.type) {
		case 'PENDING_TX':
			return action.value
		default:
			return state
	}
}

export default pendingTxReducer